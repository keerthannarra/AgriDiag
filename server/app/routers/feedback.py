from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.feedback import Feedback, FeedbackCategory
from app.services.auth_service import get_current_user

router = APIRouter()


class FeedbackRequest(BaseModel):
    category: FeedbackCategory
    rating: int
    message: str
    diagnosis_id: Optional[str] = None


@router.post("/", status_code=status.HTTP_201_CREATED)
async def submit_feedback(
    data: FeedbackRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Submit feedback from authenticated user."""
    if not 1 <= data.rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    feedback = Feedback(
        user_id=current_user.id,
        category=data.category,
        rating=data.rating,
        message=data.message,
        diagnosis_id=data.diagnosis_id,
    )
    session.add(feedback)
    await session.commit()
    return {"message": "Feedback submitted. Thank you!", "id": str(feedback.id)}

@router.get("/my")
async def get_my_feedback(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Get all feedback submitted by the current user."""
    feedback_list = (
        await session.scalars(
            select(Feedback)
            .where(Feedback.user_id == current_user.id)
            .order_by(Feedback.created_at.desc())
        )
    )
    feedback_list = list(feedback_list.all())
    return {"count": len(feedback_list), "data": feedback_list}
