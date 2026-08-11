from beanie import Document
from pydantic import Field, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    FARMER = "FARMER"
    SCIENTIST = "SCIENTIST"
    AGRICULTURIST = "AGRICULTURIST"
    ADMIN = "ADMIN"


class User(Document):
    name: str
    email: EmailStr
    password_hash: str
    role: UserRole = UserRole.FARMER
    profile_image: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
        indexes = ["email"]

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "role": "FARMER",
            }
        }
