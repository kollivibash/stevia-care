from fastapi import APIRouter, Depends
from app.routes.auth import get_current_user
from app.models.health import CycleLog
from app.database import get_db
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/tracker", tags=["Tracker"])

@router.get("/cycles")
async def get_cycles(current_user = Depends(get_current_user)):
    db = get_db()
    cycles = await db.period_cycles.find({"user_id": str(current_user["_id"])}).sort("period_start", -1).to_list(50)
    for c in cycles:
        c["id"] = str(c["_id"])
        del c["_id"]
    return {"cycles": cycles}

@router.post("/cycles")
async def log_cycle(data: CycleLog, current_user = Depends(get_current_user)):
    db = get_db()
    cycle = {**data.dict(), "user_id": str(current_user["_id"]), "created_at": datetime.utcnow()}
    result = await db.period_cycles.insert_one(cycle)
    return {"id": str(result.inserted_id), "message": "Cycle logged"}

@router.delete("/cycles/{cycle_id}")
async def delete_cycle(cycle_id: str, current_user = Depends(get_current_user)):
    db = get_db()
    await db.period_cycles.delete_one({"_id": ObjectId(cycle_id), "user_id": str(current_user["_id"])})
    return {"message": "Cycle deleted"}
