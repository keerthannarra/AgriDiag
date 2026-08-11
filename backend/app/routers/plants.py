from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.models.plant import Plant
from app.models.disease import Disease

router = APIRouter()


# ── Plant endpoints ───────────────────────────────────────────────────────────

@router.get("/")
async def get_plants(
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """List all plants with optional search."""
    if search:
        plants = await Plant.find(
            {"$or": [
                {"name": {"$regex": search, "$options": "i"}},
                {"scientific_name": {"$regex": search, "$options": "i"}},
            ]}
        ).skip(skip).limit(limit).to_list()
    else:
        plants = await Plant.find_all().skip(skip).limit(limit).to_list()

    total = await Plant.count()
    return {"total": total, "data": plants}


@router.get("/search")
async def search_plants(q: str = Query(..., min_length=1)):
    """Search plants by name or scientific name."""
    plants = await Plant.find(
        {"$or": [
            {"name": {"$regex": q, "$options": "i"}},
            {"scientific_name": {"$regex": q, "$options": "i"}},
        ]}
    ).to_list()
    return {"query": q, "count": len(plants), "data": plants}


@router.get("/{plant_id}")
async def get_plant(plant_id: str):
    """Get a single plant by ID."""
    try:
        plant = await Plant.get(plant_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Plant not found")
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return plant


# ── Disease endpoints ─────────────────────────────────────────────────────────

@router.get("/diseases/all")
async def get_diseases(
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """List all diseases with optional search."""
    if search:
        diseases = await Disease.find(
            {"$or": [
                {"name": {"$regex": search, "$options": "i"}},
                {"affected_plants": {"$elemMatch": {"$regex": search, "$options": "i"}}},
            ]}
        ).skip(skip).limit(limit).to_list()
    else:
        diseases = await Disease.find_all().skip(skip).limit(limit).to_list()

    total = await Disease.count()
    return {"total": total, "data": diseases}


@router.get("/diseases/{disease_id}")
async def get_disease(disease_id: str):
    """Get a single disease by ID."""
    try:
        disease = await Disease.get(disease_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Disease not found")
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")
    return disease
