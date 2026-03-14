from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.routes.auth import get_current_user

router = APIRouter(prefix="/api/v1/data", tags=["Health Data"])
_db = None

def set_db(database):
    global _db
    _db = database

def get_db():
    if _db is None:
        raise HTTPException(status_code=500, detail="DB not initialized")
    return _db

class HealthData(BaseModel):
    familyMembers: Optional[List[dict]] = []
    reminders:     Optional[List[dict]] = []
    labReports:    Optional[List[dict]] = []
    periodCycles:  Optional[List[dict]] = []
    vitalsLog:     Optional[List[dict]] = []
    isPremium:     Optional[bool] = False

@router.get("/ping")
async def ping():
    return {"status": "ok", "db_ready": _db is not None}

@router.get("/all")
async def get_all_data(current_user=Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    doc = await db.health_data.find_one({"user_id": user_id})
    if not doc:
        return {"familyMembers":[],"reminders":[],"labReports":[],
                "periodCycles":[],"vitalsLog":[],"isPremium":False}
    doc.pop("_id", None)
    doc.pop("user_id", None)
    return doc

@router.post("/sync")
async def sync_all_data(data: HealthData, current_user=Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])
    await db.health_data.update_one(
        {"user_id": user_id},
        {"$set": {
            "user_id": user_id,
            "familyMembers": data.familyMembers,
            "reminders": data.reminders,
            "labReports": data.labReports,
            "periodCycles": data.periodCycles,
            "vitalsLog": data.vitalsLog,
            "isPremium": data.isPremium,
            "updatedAt": datetime.utcnow().isoformat(),
        }},
        upsert=True
    )
    return {"success": True, "message": "Synced to MongoDB"}
