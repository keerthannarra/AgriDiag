from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import Optional

from app.models.user import User
from app.models.diagnosis import Diagnosis
from app.services.auth_service import get_current_user

router = APIRouter()


@router.get("/")
async def get_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
):
    """Get current user's diagnosis history (paginated)."""
    diagnoses = (
        await Diagnosis.find(Diagnosis.user_id == str(current_user.id))
        .sort(-Diagnosis.created_at)
        .skip(skip)
        .limit(limit)
        .to_list()
    )
    total = await Diagnosis.find(Diagnosis.user_id == str(current_user.id)).count()
    return {"total": total, "skip": skip, "limit": limit, "data": diagnoses}


@router.get("/search")
async def search_history(
    q: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user),
):
    """Search user's history by plant name or disease name."""
    diagnoses = await Diagnosis.find(
        {
            "user_id": str(current_user.id),
            "$or": [
                {"plant": {"$regex": q, "$options": "i"}},
                {"disease": {"$regex": q, "$options": "i"}},
            ],
        }
    ).sort(-Diagnosis.created_at).to_list()
    return {"query": q, "count": len(diagnoses), "data": diagnoses}


@router.get("/filter")
async def filter_history(
    plant: Optional[str] = Query(None),
    disease: Optional[str] = Query(None),
    min_confidence: Optional[float] = Query(None, ge=0.0, le=1.0),
    max_confidence: Optional[float] = Query(None, ge=0.0, le=1.0),
    current_user: User = Depends(get_current_user),
):
    """Filter user's history by plant, disease, confidence range."""
    query: dict = {"user_id": str(current_user.id)}

    if plant:
        query["plant"] = {"$regex": plant, "$options": "i"}
    if disease:
        query["disease"] = {"$regex": disease, "$options": "i"}
    if min_confidence is not None:
        query.setdefault("confidence", {})["$gte"] = min_confidence
    if max_confidence is not None:
        query.setdefault("confidence", {})["$lte"] = max_confidence

    diagnoses = await Diagnosis.find(query).sort(-Diagnosis.created_at).to_list()
    return {"count": len(diagnoses), "data": diagnoses}


@router.delete("/{diagnosis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_history(
    diagnosis_id: str,
    current_user: User = Depends(get_current_user),
):
    """Delete a history record."""
    try:
        diagnosis = await Diagnosis.get(diagnosis_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Record not found")

    if not diagnosis or diagnosis.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Record not found")

    await diagnosis.delete()
