from beanie import Document
from pydantic import Field
from typing import Optional
from datetime import datetime
from enum import Enum


class FeedbackCategory(str, Enum):
    DIAGNOSIS = "diagnosis"
    WEBSITE = "website"
    BUG_REPORT = "bug_report"
    FEATURE_REQUEST = "feature_request"
    GENERAL = "general"


class Feedback(Document):
    user_id: str
    category: FeedbackCategory
    rating: int = Field(ge=1, le=5)  # 1-5 stars
    message: str
    diagnosis_id: Optional[str] = None  # Related diagnosis (optional)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "feedback"
        indexes = ["user_id"]
