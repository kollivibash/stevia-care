from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.database import get_db
from app.models.user import UserRegister, UserLogin, UserProfile
from app.services.auth_service import hash_password, verify_password, create_token, decode_token
from bson import ObjectId
from datetime import datetime
import traceback

router = APIRouter(prefix="/auth", tags=["Auth"])
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/register")
async def register(data: UserRegister):
    try:
        db = get_db()
        existing = await db.users.find_one({"email": data.email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        user = {
            "name": data.name,
            "email": data.email,
            "password": hash_password(data.password),
            "age": data.age,
            "gender": data.gender,
            "conditions": "",
            "medications": "",
            "blood_group": "",
            "created_at": datetime.utcnow()
        }
        result = await db.users.insert_one(user)
        token = create_token(str(result.inserted_id))
        return {"token": token, "user": {"id": str(result.inserted_id), "name": data.name, "email": data.email, "age": data.age, "gender": data.gender}}
    except HTTPException:
        raise
    except Exception as e:
        print(f"REGISTER ERROR: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
async def login(data: UserLogin):
    try:
        db = get_db()
        user = await db.users.find_one({"email": data.email})
        if not user or not verify_password(data.password, user["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        token = create_token(str(user["_id"]))
        return {"token": token, "user": {"id": str(user["_id"]), "name": user["name"], "email": user["email"], "age": user.get("age"), "gender": user.get("gender"), "conditions": user.get("conditions", ""), "medications": user.get("medications", ""), "blood_group": user.get("blood_group", "")}}
    except HTTPException:
        raise
    except Exception as e:
        print(f"LOGIN ERROR: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me")
async def get_me(current_user = Depends(get_current_user)):
    return {"id": str(current_user["_id"]), "name": current_user["name"], "email": current_user["email"], "age": current_user.get("age"), "gender": current_user.get("gender"), "conditions": current_user.get("conditions", ""), "medications": current_user.get("medications", ""), "blood_group": current_user.get("blood_group", "")}

@router.put("/profile")
async def update_profile(data: UserProfile, current_user = Depends(get_current_user)):
    try:
        db = get_db()
        await db.users.update_one({"_id": current_user["_id"]}, {"$set": {"name": data.name, "age": data.age, "gender": data.gender, "conditions": data.conditions, "medications": data.medications, "blood_group": data.blood_group}})
        return {"message": "Profile updated successfully"}
    except Exception as e:
        print(f"PROFILE ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── FORGOT PASSWORD ───────────────────────────────────────────────
from app.services.otp_service import send_reset_email, verify_reset_token, send_phone_otp, verify_phone_otp
from pydantic import BaseModel as BM

class ForgotPasswordRequest(BM):
    email: str

class ResetPasswordRequest(BM):
    email: str
    token: str
    new_password: str

class PhoneOTPRequest(BM):
    phone: str

class VerifyOTPRequest(BM):
    phone: str
    otp: str
    name: str = ""

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest, db=Depends(get_db)):
    try:
        users_col = db["users"]
        user = await users_col.find_one({"email": req.email.lower()})
        # Always return success to prevent email enumeration
        if user:
            send_reset_email(req.email.lower(), user.get("name", "User"))
        return {"message": "If that email exists, a reset link has been sent."}
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db=Depends(get_db)):
    try:
        if not verify_reset_token(req.email.lower(), req.token):
            raise HTTPException(status_code=400, detail="Invalid or expired reset link")
        users_col = db["users"]
        from app.services.auth_service import hash_password
        hashed = hash_password(req.new_password)
        result = await users_col.update_one(
            {"email": req.email.lower()},
            {"$set": {"password": hashed}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": "Password updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/send-otp")
async def send_otp(req: PhoneOTPRequest, db=Depends(get_db)):
    try:
        phone = req.phone.strip()
        if len(phone) < 10:
            raise HTTPException(status_code=400, detail="Enter a valid phone number")
        otp = send_phone_otp(phone)
        # In dev: return OTP in response so you can test without Twilio
        return {"message": "OTP sent", "dev_otp": otp}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-otp")
async def verify_otp_login(req: VerifyOTPRequest, db=Depends(get_db)):
    try:
        if not verify_phone_otp(req.phone.strip(), req.otp.strip()):
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
        users_col = db["users"]
        user = await users_col.find_one({"phone": req.phone.strip()})
        
        # Auto-create account if new user
        if not user:
            name = req.name or f"User{req.phone[-4:]}"
            new_user = {
                "name": name,
                "phone": req.phone.strip(),
                "email": f"phone_{req.phone.strip()}@healthpilot.app",
                "password": "",
                "age": 25,
                "gender": "other",
                "created_at": __import__('datetime').datetime.utcnow().isoformat()
            }
            result = await users_col.insert_one(new_user)
            new_user["id"] = str(result.inserted_id)
            user = new_user
        
        from app.services.auth_service import create_token
        user_data = {
            "id": str(user.get("_id", user.get("id", ""))),
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "phone": user.get("phone", ""),
            "age": user.get("age", 25),
            "gender": user.get("gender", "other"),
        }
        token = create_token(user_data)
        return {"token": token, "user": user_data}
    except HTTPException:
        raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
