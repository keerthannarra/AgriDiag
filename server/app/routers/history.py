from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.diagnosis import Diagnosis
from app.models.user import User
from app.services.auth_service import get_current_user

router = APIRouter()


@router.get("/")
async def get_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Get current user's diagnosis history (paginated)."""
    statement = (
        select(Diagnosis)
        .where(Diagnosis.user_id == current_user.id)
        .order_by(Diagnosis.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    diagnoses = list((await session.scalars(statement)).all())
    total = await session.scalar(
        select(func.count()).select_from(Diagnosis).where(Diagnosis.user_id == current_user.id)
    )
    return {"total": total, "skip": skip, "limit": limit, "data": diagnoses}


@router.get("/search")
async def search_history(
    q: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Search user's history by plant name or disease name."""
    statement = (
        select(Diagnosis)
        .where(
            Diagnosis.user_id == current_user.id,
            (Diagnosis.plant.ilike(f"%{q}%")) | (Diagnosis.disease.ilike(f"%{q}%")),
        )
        .order_by(Diagnosis.created_at.desc())
    )
    diagnoses = list((await session.scalars(statement)).all())
    return {"query": q, "count": len(diagnoses), "data": diagnoses}


@router.get("/filter")
async def filter_history(
    plant: Optional[str] = Query(None),
    disease: Optional[str] = Query(None),
    min_confidence: Optional[float] = Query(None, ge=0.0, le=1.0),
    max_confidence: Optional[float] = Query(None, ge=0.0, le=1.0),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Filter user's history by plant, disease, confidence range."""
    conditions = [Diagnosis.user_id == current_user.id]
    if plant:
        conditions.append(Diagnosis.plant.ilike(f"%{plant}%"))
    if disease:
        conditions.append(Diagnosis.disease.ilike(f"%{disease}%"))
    if min_confidence is not None:
        conditions.append(Diagnosis.confidence >= min_confidence)
    if max_confidence is not None:
        conditions.append(Diagnosis.confidence <= max_confidence)

    diagnoses = list(
        (
            await session.scalars(
                select(Diagnosis)
                .where(*conditions)
                .order_by(Diagnosis.created_at.desc())
            )
        ).all()
    )
    return {"count": len(diagnoses), "data": diagnoses}


@router.delete("/{diagnosis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_history(
    diagnosis_id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Delete a history record."""
    try:
        parsed_id = UUID(diagnosis_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Record not found")

    diagnosis = await session.get(Diagnosis, parsed_id)
    if not diagnosis or diagnosis.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Record not found")

    await session.delete(diagnosis)
    await session.commit()
