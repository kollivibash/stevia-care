
from motor.motor_asyncio import AsyncIOMotorClient

import os

client = None

db = None

async def connect_db():

    global client, db

    mongodb_url = os.environ.get("MONGODB_URL", "mongodb+srv://healthpilot:Health2024@cluster0.y7no71s.mongodb.net/healthpilot?appName=Cluster0")

    client = AsyncIOMotorClient(mongodb_url)

    db = client.healthpilot

    print(f"Connected to MongoDB successfully!")

async def close_db():

    global client

    if client:

        client.close()

def get_db():

    return db

