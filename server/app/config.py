from pydantic_settings import BaseSettings
from typing import List


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
    HF_API_TOKEN: str = ""
    HF_MODEL_NAME: str = "linkanjarad/plant-disease-EfficientNet-B3"

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

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
