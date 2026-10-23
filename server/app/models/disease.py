import uuid
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import DateTime, JSON, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Disease(Base):
    __tablename__ = "diseases"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    affected_plants: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    symptoms: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    causes: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    treatment: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    prevention: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    management: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    severity: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
