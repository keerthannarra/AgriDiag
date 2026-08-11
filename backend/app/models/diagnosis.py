from beanie import Document
from pydantic import Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class Diagnosis(Document):
    user_id: str
    image_url: str
    plant: str
    disease: str
    confidence: float  # 0.0 - 1.0
    is_healthy: bool = False
    is_low_confidence: bool = False

    # Disease information
    description: Optional[str] = None
    symptoms: List[str] = []
    causes: List[str] = []
    treatment: List[str] = []
    prevention: List[str] = []
    management: Optional[str] = None

    # Raw model output
    raw_predictions: Optional[List[Dict[str, Any]]] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "diagnoses"
        indexes = ["user_id", "created_at"]
