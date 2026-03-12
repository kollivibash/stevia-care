from motor.motor_asyncio import AsyncIOMotorClient
import os

client = None
db = None

async def connect_db():
    global client, db
    mongodb_url = os.environ.get("MONGODB_URL")
    print(f"Using MongoDB URL: {mongodb_url[:50] if mongodb_url else 'NOT SET'}...")
    client = AsyncIOMotorClient(mongodb_url)
    db = client.healthpilot
    print(f"Connected to MongoDB successfully!")

async def close_db():
    global client
    if client:
        client.close()

def get_db():
    return db
