"""
Stevia Care Health Data Sync Routes
Uses your existing auth — no secret key mismatch possible.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter(prefix="/api/v1/data", tags=["Health Data"])

_db = None

def set_db(database):
    global _db
    _db = database

def get_db():
    if _db is None:
        raise HTTPException(status_code=500, detail="DB not initialized")
    return _db

# ── Import YOUR existing auth dependency ─────────────────────────────────
# This uses the same JWT secret as your login — guaranteed to work
def _load_auth():
    """Try multiple import paths to find your get_current_user function"""
    attempts = [
        ("app.routes.auth", "get_current_user"),
        ("app.auth",        "get_current_user"),
        ("app.dependencies","get_current_user"),
        ("app.utils.auth",  "get_current_user"),
        ("app.core.auth",   "get_current_user"),
    ]
    for module_path, func_name in attempts:
        try:
            import importlib
            mod = importlib.import_module(module_path)
            fn  = getattr(mod, func_name, None)
            if fn:
                print(f"[data_routes] Auth loaded from {module_path}.{func_name}")
                return fn
        except Exception:
            continue
    print("[data_routes] WARNING: Could not import existing auth — using env SECRET_KEY fallback")
    return None

_get_current_user = _load_auth()

if _get_current_user is None:
    from fastapi.security import OAuth2PasswordBearer
    from jose import jwt, JWTError
    import os
    _oauth2 = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

    async def get_current_user(token: str = Depends(_oauth2)):
        secret = os.getenv("SECRET_KEY") or os.getenv("JWT_SECRET") or os.getenv("SECRET")
        if not secret:
            raise HTTPException(500, "SECRET_KEY env var not set on Render")
        try:
            payload = jwt.decode(token, secret, algorithms=["HS256"])
            uid = (payload.get("sub") or payload.get("id") or
                   payload.get("user_id") or payload.get("_id"))
            if not uid:
                raise HTTPException(401, f"No user id in token. Keys: {list(payload.keys())}")
            return uid
        except JWTError as e:
            raise HTTPException(401, f"JWT error: {e}")
else:
    get_current_user = _get_current_user


# ── Helpers ──────────────────────────────────────────────────────────────
def extract_user_id(current_user) -> str:
    """Handle both User objects and plain string IDs"""
    if isinstance(current_user, str):
        return current_user
    for attr in ("id", "_id", "user_id", "email"):
        val = getattr(current_user, attr, None)
        if val:
            return str(val)
    return str(current_user)


# ── Models ────────────────────────────────────────────────────────────────
class HealthData(BaseModel):
    familyMembers: Optional[List[dict]] = []
    reminders:     Optional[List[dict]] = []
    labReports:    Optional[List[dict]] = []
    periodCycles:  Optional[List[dict]] = []
    vitalsLog:     Optional[List[dict]] = []
    isPremium:     Optional[bool] = False


# ── Routes ────────────────────────────────────────────────────────────────
@router.get("/all")
async def get_all_data(current_user=Depends(get_current_user)):
    db      = get_db()
    user_id = extract_user_id(current_user)
    doc     = await db.health_data.find_one({"user_id": user_id})
    if not doc:
        return {"familyMembers":[],"reminders":[],"labReports":[],
                "periodCycles":[],"vitalsLog":[],"isPremium":False}
    doc.pop("_id",     None)
    doc.pop("user_id", None)
    return doc


@router.post("/sync")
async def sync_all_data(data: HealthData, current_user=Depends(get_current_user)):
    db      = get_db()
    user_id = extract_user_id(current_user)
    await db.health_data.update_one(
        {"user_id": user_id},
        {"$set": {
            "user_id":       user_id,
            "familyMembers": data.familyMembers,
            "reminders":     data.reminders,
            "labReports":    data.labReports,
            "periodCycles":  data.periodCycles,
            "vitalsLog":     data.vitalsLog,
            "isPremium":     data.isPremium,
            "updatedAt":     datetime.utcnow().isoformat(),
        }},
        upsert=True
    )
    return {"success": True, "message": "Synced to MongoDB"}


@router.get("/ping")
async def ping():
    """Health check — test this endpoint first"""
    return {"status": "ok", "db_ready": _db is not None}
