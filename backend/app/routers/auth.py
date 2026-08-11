from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

from app.models.user import User, UserRole
from app.services.auth_service import (
    create_access_token,
    get_password_hash,
    verify_password,
    get_current_user,
)

router = APIRouter()


# ── Request / Response schemas ────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.FARMER


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest):
    """Register a new user and return JWT token."""
    existing = await User.find_one(User.email == data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=data.name,
        email=data.email,
        password_hash=get_password_hash(data.password),
        role=data.role,
    )
    await user.insert()

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=str(user.id),
            name=user.name,
            email=str(user.email),
            role=user.role,
            created_at=user.created_at,
        ),
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    """Authenticate user and return JWT token."""
    user = await User.find_one(User.email == data.email)
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=str(user.id),
            name=user.name,
            email=str(user.email),
            role=user.role,
            created_at=user.created_at,
        ),
    )


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user info."""
    return UserResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=str(current_user.email),
        role=current_user.role,
        created_at=current_user.created_at,
    )


@router.post("/logout")
async def logout():
    """Logout (JWT is stateless — client should delete the token)."""
    return {"message": "Logged out successfully"}
