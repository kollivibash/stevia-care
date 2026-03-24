from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
import random
import httpx
from app.database import get_db
from jose import jwt
import os

router = APIRouter(prefix="/api/v1/auth", tags=["otp"])

class SendOTPRequest(BaseModel):
    phone: str  # 10 digit Indian number

class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str

FAST2SMS_KEY = os.getenv("FAST2SMS_KEY", "")
JWT_SECRET = os.getenv("JWT_SECRET", "stevia-secret")

def create_token(user_id: str, phone: str):
    payload = {"sub": user_id, "phone": phone, "exp": datetime.utcnow() + timedelta(days=30)}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

@router.post("/send-otp")
async def send_otp(body: SendOTPRequest):
    db = get_db()
    phone = body.phone.strip().replace("+91", "").replace(" ", "")
    if len(phone) != 10 or not phone.isdigit():
        raise HTTPException(400, "Invalid phone number. Send 10 digit Indian number.")

    otp = str(random.randint(100000, 999999))
    expiry = datetime.utcnow() + timedelta(minutes=10)

    # Store OTP in MongoDB
    await db.otp_store.update_one(
        {"phone": phone},
        {"$set": {"phone": phone, "otp": otp, "expiry": expiry, "attempts": 0}},
        upsert=True
    )

    # Send SMS via Fast2SMS if key is available
    sms_sent = False
    if FAST2SMS_KEY and FAST2SMS_KEY != "":
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get(
                    "https://www.fast2sms.com/dev/bulkV2",
                    params={
                        "authorization": FAST2SMS_KEY,
                        "variables_values": otp,
                        "route": "otp",
                        "numbers": phone,
                    }
                )
                data = resp.json()
                sms_sent = data.get("return", False)
        except Exception:
            sms_sent = False

    # Return OTP in dev mode (when no SMS key set) so developer can test
    response = {"success": True, "message": "OTP sent successfully"}
    if not sms_sent:
        response["dev_otp"] = otp  # Remove this in production after SMS is configured
        response["message"] = "SMS not configured. Use dev_otp for testing."

    return response

@router.post("/verify-otp")
async def verify_otp(body: VerifyOTPRequest):
    db = get_db()
    phone = body.phone.strip().replace("+91", "").replace(" ", "")
    otp = body.otp.strip()

    record = await db.otp_store.find_one({"phone": phone})
    if not record:
        raise HTTPException(400, "OTP not found. Please request a new OTP.")

    # Check attempts (max 5)
    if record.get("attempts", 0) >= 5:
        await db.otp_store.delete_one({"phone": phone})
        raise HTTPException(400, "Too many attempts. Please request a new OTP.")

    # Increment attempts
    await db.otp_store.update_one({"phone": phone}, {"$inc": {"attempts": 1}})

    # Check expiry
    if datetime.utcnow() > record["expiry"]:
        await db.otp_store.delete_one({"phone": phone})
        raise HTTPException(400, "OTP expired. Please request a new one.")

    # Check OTP
    if record["otp"] != otp:
        raise HTTPException(400, "Invalid OTP. Please try again.")

    # OTP valid — clean up
    await db.otp_store.delete_one({"phone": phone})

    # Find or create user
    user = await db.users.find_one({"phone": phone})
    if not user:
        from bson import ObjectId
        user_data = {
            "_id": ObjectId(),
            "phone": phone,
            "name": f"User{phone[-4:]}",
            "email": f"{phone}@phone.steviacare.in",
            "created_at": datetime.utcnow(),
            "auth_method": "phone"
        }
        await db.users.insert_one(user_data)
        user = user_data

    token = create_token(str(user["_id"]), phone)

    return {
        "token": token,
        "access_token": token,
        "user": {
            "id": str(user["_id"]),
            "phone": phone,
            "name": user.get("name", f"User{phone[-4:]}"),
            "email": user.get("email", ""),
        }
    }
