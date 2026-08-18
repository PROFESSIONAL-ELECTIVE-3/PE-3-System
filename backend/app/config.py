import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings:
    PROJECT_NAME: str = "Student Academic Attrition Risk Classification & Performance Forecasting"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "academic-attrition-super-secret-jwt-key-2026!#*")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database (Defaults to SQLite for seamless zero-setup local execution, supports PostgreSQL via env)
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/academic_attrition.db")
    
    # ML Models directory
    MODELS_DIR: Path = BASE_DIR / "app" / "saved_models"
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ]
    
    # FERPA Compliance Settings
    FERPA_AUDIT_ENABLED: bool = True
    MINIMAL_PII_LOGGING: bool = True

settings = Settings()
settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)
