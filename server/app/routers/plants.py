from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import String, cast, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.disease import Disease
from app.models.plant import Plant

router = APIRouter()


@router.get("/")
async def get_plants(
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
):
    """List all plants with optional search."""
    statement = select(Plant)
    if search:
        statement = statement.where(
            or_(
                Plant.name.ilike(f"%{search}%"),
                Plant.scientific_name.ilike(f"%{search}%"),
            )
        )
    plants = list(
        (await session.scalars(statement.offset(skip).limit(limit))).all()
    )
    total = await session.scalar(select(func.count()).select_from(Plant))
    return {"total": total, "data": plants}


@router.get("/search")
async def search_plants(
    q: str = Query(..., min_length=1),
    session: AsyncSession = Depends(get_db),
):
    """Search plants by name or scientific name."""
    statement = select(Plant).where(
        or_(
            Plant.name.ilike(f"%{q}%"),
            Plant.scientific_name.ilike(f"%{q}%"),
        )
    )
    plants = list((await session.scalars(statement)).all())
    return {"query": q, "count": len(plants), "data": plants}


@router.get("/diseases/all")
async def get_diseases(
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
):
    """List all diseases with optional search."""
    statement = select(Disease)
    if search:
        statement = statement.where(
            or_(
                Disease.name.ilike(f"%{search}%"),
                cast(Disease.affected_plants, String).ilike(f"%{search}%"),
            )
        )
    diseases = list(
        (await session.scalars(statement.offset(skip).limit(limit))).all()
    )
    total = await session.scalar(select(func.count()).select_from(Disease))
    return {"total": total, "data": diseases}


@router.get("/diseases/{disease_id}")
async def get_disease(
    disease_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Get a single disease by ID."""
    try:
        parsed_id = UUID(disease_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Disease not found")
    disease = await session.get(Disease, parsed_id)
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")
    return disease


@router.get("/{plant_id}")
async def get_plant(
    plant_id: str,
    session: AsyncSession = Depends(get_db),
):
    """Get a single plant by ID."""
    try:
        parsed_id = UUID(plant_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Plant not found")
    plant = await session.get(Plant, parsed_id)
    if not plant:
        raise HTTPException(status_code=404, detail="Plant not found")
    return plant
