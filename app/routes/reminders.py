from fastapi import APIRouter, Depends
from app.routes.auth import get_current_user
from app.database import get_db
from pydantic import BaseModel
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/reminders", tags=["Reminders"])

class Medicine(BaseModel):
    name: str
    times: List[str]
    with_food: bool = False
    color: Optional[str] = "#0057B8"

class ReminderCreate(BaseModel):
    member_id: str
    member_name: str
    medicines: List[Medicine]

@router.get("/")
async def get_reminders(current_user = Depends(get_current_user)):
    db = get_db()
    reminders = await db.reminders.find({"user_id": str(current_user["_id"])}).to_list(50)
    for r in reminders:
        r["id"] = str(r["_id"])
        del r["_id"]
    return {"reminders": reminders}

@router.post("/")
async def add_reminder(data: ReminderCreate, current_user = Depends(get_current_user)):
    db = get_db()
    reminder = {**data.dict(), "user_id": str(current_user["_id"]), "created_at": datetime.utcnow()}
    result = await db.reminders.insert_one(reminder)
    return {"id": str(result.inserted_id), "message": "Reminder added"}

@router.delete("/{reminder_id}")
async def delete_reminder(reminder_id: str, current_user = Depends(get_current_user)):
    db = get_db()
    await db.reminders.delete_one({"_id": ObjectId(reminder_id), "user_id": str(current_user["_id"])})
    return {"message": "Reminder deleted"}

@router.post("/log")
async def log_adherence(data: dict, current_user = Depends(get_current_user)):
    db = get_db()
    log = {**data, "user_id": str(current_user["_id"]), "logged_at": datetime.utcnow()}
    await db.adherence_logs.insert_one(log)
    return {"message": "Logged successfully"}
