from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import os, jwt

MONGO_URL  = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
SECRET_KEY = os.getenv("SECRET_KEY", "stevia-secret-key-2024")
ALGORITHM  = "HS256"

router = APIRouter(prefix="/api/v1/data", tags=["Health Data"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


class HealthData(BaseModel):
    familyMembers: Optional[List[dict]] = []
    reminders:     Optional[List[dict]] = []
    labReports:    Optional[List[dict]] = []
    periodCycles:  Optional[List[dict]] = []
    vitalsLog:     Optional[List[dict]] = []
    isPremium:     Optional[bool] = False


@router.get("/all")
async def get_all_data(user_id: str = Depends(get_current_user)):
    """Load all health data for the logged-in user"""
    from main import db   # uses your existing db connection
    doc = await db.health_data.find_one({"user_id": user_id})
    if not doc:
        return {
            "familyMembers": [],
            "reminders":     [],
            "labReports":    [],
            "periodCycles":  [],
            "vitalsLog":     [],
            "isPremium":     False,
        }
    doc.pop("_id", None)
    doc.pop("user_id", None)
    return doc


@router.post("/sync")
async def sync_all_data(data: HealthData, user_id: str = Depends(get_current_user)):
    """Save all health data for the logged-in user — upsert"""
    from main import db
    payload = {
        "user_id":       user_id,
        "familyMembers": data.familyMembers,
        "reminders":     data.reminders,
        "labReports":    data.labReports,
        "periodCycles":  data.periodCycles,
        "vitalsLog":     data.vitalsLog,
        "isPremium":     data.isPremium,
        "updatedAt":     datetime.utcnow().isoformat(),
    }
    await db.health_data.update_one(
        {"user_id": user_id},
        {"$set": payload},
        upsert=True
    )
    return {"success": True, "message": "Data synced to MongoDB"}
