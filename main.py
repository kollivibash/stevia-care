from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import connect_db, close_db, get_db
from app.routes import auth, ai, family, reminders, tracker
import data_routes
import pdf_routes
import ai_routes
from otp_routes import router as otp_router

app = FastAPI(title="Stevia Care API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await connect_db()
    db = get_db()
    data_routes.set_db(db)
    print("[Stevia] All routes connected ✅")

@app.on_event("shutdown")
async def shutdown():
    await close_db()

@app.get("/")
async def root():
    return {"message": "Stevia Care API is running!", "version": "1.0.0"}

# ── Existing routes ───────────────────────────────────────────────────────
app.include_router(auth.router,      prefix="/api/v1")
app.include_router(ai.router,        prefix="/api/v1")
app.include_router(family.router,    prefix="/api/v1")
app.include_router(reminders.router, prefix="/api/v1")
app.include_router(tracker.router,   prefix="/api/v1")

# ── New routes ────────────────────────────────────────────────────────────
app.include_router(data_routes.router)
app.include_router(pdf_routes.router)
app.include_router(ai_routes.router,  prefix="/api/v1")
app.include_router(otp_router)
