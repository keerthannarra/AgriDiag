from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

from app.config import settings
from app.models.user import User
from app.models.diagnosis import Diagnosis
from app.models.plant import Plant
from app.models.disease import Disease
from app.models.feedback import Feedback


async def init_db():
    """Initialize MongoDB connection and Beanie ODM."""
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client[settings.DB_NAME],
        document_models=[User, Diagnosis, Plant, Disease, Feedback],
    )
    print(f"[OK] Connected to MongoDB: {settings.DB_NAME}")
