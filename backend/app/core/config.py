import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    APP_NAME: str = "Community Donation System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # SQLite for local dev; PostgreSQL (e.g. Supabase) in production
    DATABASE_URL: str = "sqlite:///./community_donation.db"

    # JWT
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # CORS (JSON array, e.g. ["https://app.vercel.app"])
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # Supabase (project URL + service role key)
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Supabase Storage buckets
    STORAGE_BUCKET_PHOTOS: str = "photos"
    STORAGE_BUCKET_VIDEOS: str = "videos"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
