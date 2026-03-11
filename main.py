from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import connect_db, close_db
from app.routes import auth, ai, family, reminders, tracker

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()

app = FastAPI(title="Health Copilot API", version="1.0.0", lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(auth.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")
app.include_router(family.router, prefix="/api/v1")
app.include_router(reminders.router, prefix="/api/v1")
app.include_router(tracker.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Health Copilot API is running!", "version": "1.0.0", "docs": "/docs"}
