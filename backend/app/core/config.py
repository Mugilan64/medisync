from pydantic_settings import BaseSettings
from typing import List
from urllib.parse import quote_plus
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "MediSync"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database — individual parts (safe, no URL-encoding issues)
    MYSQL_USER: str = "medisync_user"
    MYSQL_PASSWORD: str = "MediSync@Pass2024"
    MYSQL_HOST: str = "mysql"
    MYSQL_PORT: int = 3306
    MYSQL_DATABASE: str = "medisync_db"

    # Optional: override full URL directly
    DATABASE_URL: str = ""

    # JWT
    SECRET_KEY: str = "supersecretkey_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    # Redis
    REDIS_URL: str = "redis://redis:6379"

    # Upload
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB

    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    FROM_EMAIL: str = "noreply@medisync.health"

    @property
    def database_url(self) -> str:
        # If explicit DATABASE_URL set, use it
        if self.DATABASE_URL:
            return self.DATABASE_URL
        # Build from parts — quote_plus handles @, #, etc. safely
        pwd = quote_plus(self.MYSQL_PASSWORD)
        return f"mysql+pymysql://{self.MYSQL_USER}:{pwd}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DATABASE}"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()