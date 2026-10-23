from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.database import close_db, init_db
from app.routers import auth, diagnosis, history, plants, feedback


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    await init_db()
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    try:
        yield
    finally:
        await close_db()


app = FastAPI(
    title="AgriDiag API",
    description="AI-Powered Plant Disease Diagnosis & Agricultural Knowledge Platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploaded images
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(diagnosis.router, prefix="/api/diagnosis", tags=["Diagnosis"])
app.include_router(history.router, prefix="/api/history", tags=["History"])
app.include_router(plants.router, prefix="/api/plants", tags=["Plants & Diseases"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["Feedback"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "message": "AgriDiag API is running",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
