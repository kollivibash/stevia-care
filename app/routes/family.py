from fastapi import APIRouter, Depends
from app.routes.auth import get_current_user
from app.models.health import FamilyMember
from app.database import get_db
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/family", tags=["Family"])

@router.get("/members")
async def get_members(current_user = Depends(get_current_user)):
    db = get_db()
    members = await db.family_members.find({"user_id": str(current_user["_id"])}).to_list(20)
    for m in members:
        m["id"] = str(m["_id"])
        del m["_id"]
    return {"members": members}

@router.post("/members")
async def add_member(data: FamilyMember, current_user = Depends(get_current_user)):
    db = get_db()
    member = {**data.dict(), "user_id": str(current_user["_id"]), "created_at": datetime.utcnow()}
    result = await db.family_members.insert_one(member)
    return {"id": str(result.inserted_id), "message": "Member added"}

@router.delete("/members/{member_id}")
async def delete_member(member_id: str, current_user = Depends(get_current_user)):
    db = get_db()
    await db.family_members.delete_one({"_id": ObjectId(member_id), "user_id": str(current_user["_id"])})
    return {"message": "Member deleted"}
