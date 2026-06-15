import os
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Optional

class Settings(BaseSettings):
    """Application configuration from environment variables."""
    
    # API Configuration
    API_TITLE: str = "AI Study Assistant API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "An intelligent study companion powered by AI"
    DEBUG: bool = False
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = False
    
    # Database Configuration
    DATABASE_URL: str = "sqlite:///./data/app.db"
    SQLALCHEMY_ECHO: bool = False
    
    # Redis Configuration
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT Configuration
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Google Gemini API
    GOOGLE_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-pro"
    
    # File Upload Configuration
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_FILE_TYPES: list = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"]
    UPLOAD_DIR: str = "./uploads"
    DATA_DIR: str = "./data"
    
    # Embedding Configuration
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    EMBEDDING_DIMENSION: int = 384
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    
    # Vector Database Configuration
    CHROMA_PERSIST_DIR: str = "./chroma_data"
    VECTOR_DB_TYPE: str = "chroma"  # "chroma" or "faiss"
    
    # Feature Flags
    ENABLE_OCR: bool = False
    ENABLE_VOICE_QA: bool = False
    ENABLE_ANALYTICS: bool = True
    
    # CORS Configuration
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    # Logging Configuration
    LOG_LEVEL: str = "INFO"

    @property
    def database_url_for_sqlalchemy(self) -> str:
        if self.DATABASE_URL.startswith("postgres://"):
            return self.DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
        if self.DATABASE_URL.startswith("postgresql://"):
            return self.DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
        return self.DATABASE_URL

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS string into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @field_validator("DEBUG", "RELOAD", mode="before")
    @classmethod
    def parse_boolish_mode(cls, value):
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"release", "production", "prod", "false", "0", "no", "off", "warn", "warning", "info", "error"}:
                return False
            if normalized in {"debug", "development", "dev", "true", "1", "yes", "on"}:
                return True
        return value

    def validate_production_settings(self) -> None:
        if not self.DEBUG and self.SECRET_KEY == "your-secret-key-change-in-production":
            raise RuntimeError("SECRET_KEY must be set to a strong value when DEBUG is false")
        if not self.DEBUG and "*" in self.CORS_ORIGINS:
            raise RuntimeError("CORS_ORIGINS must not contain '*' when DEBUG is false")
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
