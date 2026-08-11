from beanie import Document
from pydantic import Field
from typing import List, Optional
from datetime import datetime


class Disease(Document):
    name: str
    affected_plants: List[str] = []
    description: str
    symptoms: List[str] = []
    causes: List[str] = []
    treatment: List[str] = []
    prevention: List[str] = []
    management: Optional[str] = None
    severity: Optional[str] = None   # Low / Medium / High
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "diseases"
        indexes = ["name"]
