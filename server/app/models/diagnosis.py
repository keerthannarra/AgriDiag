import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, JSON, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    image_url: Mapped[str] = mapped_column(String, nullable=False)
    plant: Mapped[str] = mapped_column(String(255), nullable=False)
    disease: Mapped[str] = mapped_column(String(255), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    is_healthy: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_low_confidence: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    symptoms: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    causes: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    treatment: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    prevention: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    management: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    raw_predictions: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True, nullable=False
    )
