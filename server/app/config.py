from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Project root is two parents up from this file (server/app/config.py -> root).
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = ROOT_DIR / ".env"

# Load the root .env regardless of the current working directory.
load_dotenv(ENV_FILE)


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:agridiag_dev_password@localhost:5432/agridiag"

    # JWT Auth
    SECRET_KEY: str = "change-this-to-a-strong-random-secret-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS — stored as comma-separated string in .env, parsed below
    ALLOWED_ORIGINS_STR: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    # Hugging Face
    HF_MODEL_NAME: str = ""

    # ML Config
    CONFIDENCE_THRESHOLD: float = 0.60
    MAX_IMAGE_SIZE_MB: int = 10

    # File Upload
    UPLOAD_DIR: str = "uploads"

    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS_STR.split(",") if o.strip()]

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        if self.DATABASE_URL.startswith("postgres://"):
            return self.DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
        if self.DATABASE_URL.startswith("postgresql://"):
            return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
        return self.DATABASE_URL

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


settings = Settings()
