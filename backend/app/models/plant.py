from beanie import Document
from pydantic import Field
from typing import List, Optional
from datetime import datetime


class Plant(Document):
    name: str
    scientific_name: Optional[str] = None
    description: str
    diseases: List[str] = []        # List of disease names
    symptoms: List[str] = []
    treatment: List[str] = []
    prevention: List[str] = []
    management: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "plants"
        indexes = ["name"]
