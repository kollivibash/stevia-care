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
