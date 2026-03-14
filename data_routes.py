from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import os
from jose import jwt, JWTError

SECRET_KEY = os.getenv("SECRET_KEY", "stevia-secret-key-2024")
ALGORITHM  = "HS256"

router = APIRouter(prefix="/api/v1/data", tags=["Health Data"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

_db = None

def set_db(database):
    global _db
    _db = database

def get_db():
    if _db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    return _db

async def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

class HealthData(BaseModel):
    familyMembers: Optional[List[dict]] = []
    reminders:     Optional[List[dict]] = []
    labReports:    Optional[List[dict]] = []
    periodCycles:  Optional[List[dict]] = []
    vitalsLog:     Optional[List[dict]] = []
    isPremium:     Optional[bool] = False

@router.get("/all")
async def get_all_data(user_id: str = Depends(get_current_user_id)):
    db = get_db()
    doc = await db.health_data.find_one({"user_id": user_id})
    if not doc:
        return {"familyMembers": [], "reminders": [], "labReports": [],
                "periodCycles": [], "vitalsLog": [], "isPremium": False}
    doc.pop("_id", None)
    doc.pop("user_id", None)
    return doc

@router.post("/sync")
async def sync_all_data(data: HealthData, user_id: str = Depends(get_current_user_id)):
    db = get_db()
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
        {"user_id": user_id}, {"$set": payload}, upsert=True
    )
    return {"success": True, "message": "Synced to MongoDB"}
