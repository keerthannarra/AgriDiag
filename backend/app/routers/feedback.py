from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Optional

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
):
    """Submit feedback from authenticated user."""
    if not 1 <= data.rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    feedback = Feedback(
        user_id=str(current_user.id),
        category=data.category,
        rating=data.rating,
        message=data.message,
        diagnosis_id=data.diagnosis_id,
    )
    await feedback.insert()
    return {"message": "Feedback submitted. Thank you!", "id": str(feedback.id)}


@router.get("/my")
async def get_my_feedback(current_user: User = Depends(get_current_user)):
    """Get all feedback submitted by the current user."""
    feedback_list = (
        await Feedback.find(Feedback.user_id == str(current_user.id))
        .sort(-Feedback.created_at)
        .to_list()
    )
    return {"count": len(feedback_list), "data": feedback_list}
