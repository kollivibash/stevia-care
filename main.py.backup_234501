from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import connect_db, close_db
from app.routes import auth, ai, family, reminders, tracker
import os
from data_routes import router as data_router

app = FastAPI(title="HealthPilot API", version="1.0.0")
app.include_router(data_router)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await close_db()

app.include_router(auth.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")
app.include_router(family.router, prefix="/api/v1")
app.include_router(reminders.router, prefix="/api/v1")
app.include_router(tracker.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "HealthPilot API is running!", "version": "1.0.0"}
