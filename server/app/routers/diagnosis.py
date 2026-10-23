from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.models.diagnosis import Diagnosis
from app.services.auth_service import get_current_user
from app.services.diagnosis_service import process_diagnosis

router = APIRouter()

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png"}


@router.post("/predict", status_code=status.HTTP_201_CREATED)
async def predict(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Upload a leaf image and get an AI diagnosis."""
    # Validate content type
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload a JPEG or PNG image.",
        )

    image_bytes = await file.read()

    # Validate file size
    max_bytes = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
    if len(image_bytes) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"Image too large. Maximum size is {settings.MAX_IMAGE_SIZE_MB}MB.",
        )

    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded.")

    result = await process_diagnosis(
        image_bytes=image_bytes,
        filename=file.filename or "upload.jpg",
        user_id=current_user.id,
        session=session,
    )
    return result


@router.get("/{diagnosis_id}")
async def get_diagnosis(
    diagnosis_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Get a single diagnosis by ID (must belong to current user)."""
    try:
        parsed_id = UUID(diagnosis_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Diagnosis not found")

    diagnosis = await session.get(Diagnosis, parsed_id)
    if not diagnosis or diagnosis.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Diagnosis not found")

    return diagnosis


@router.delete("/{diagnosis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_diagnosis(
    diagnosis_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Delete a diagnosis by ID (must belong to current user)."""
    try:
        parsed_id = UUID(diagnosis_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Diagnosis not found")

    diagnosis = await session.get(Diagnosis, parsed_id)
    if not diagnosis or diagnosis.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Diagnosis not found")

    await session.delete(diagnosis)
    await session.commit()
