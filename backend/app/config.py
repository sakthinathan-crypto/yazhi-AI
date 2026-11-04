"""
Application configuration for YAZHI Backend.
Loads environment variables and sets defaults.
"""
from pydantic_settings import BaseSettings
from typing import Optional, List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "YAZHI – Personal AI Call Assistant"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    ENVIRONMENT: str = "development"
    
    # Owner details
    OWNER_NAME: str = "Sakthinathan Jayakumar"
    OWNER_PREFERRED_NAME: str = "Sakthi"
    ASSISTANT_NAME: str = "YAZHI"
    
    # Gemini AI
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_LIVE_MODEL: str = "gemini-3.8-live"
    GEMINI_SUMMARY_MODEL: str = "gemini-3.8-flash"
    
    # Exotel Telephony
    EXOTEL_ACCOUNT_SID: Optional[str] = None
    EXOTEL_API_KEY: Optional[str] = None
    EXOTEL_API_TOKEN: Optional[str] = None
    EXOTEL_SUBDOMAIN: str = "api.exotel.com"
    EXOTEL_PHONE_NUMBER: Optional[str] = None
    EXOTEL_CALL_TIMEOUT: int = 25
    
    # Supabase Database & Auth
    SUPABASE_URL: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    
    # Telegram Bot
    TELEGRAM_BOT_TOKEN: Optional[str] = None
    TELEGRAM_CHAT_ID: Optional[str] = None
    
    # Host / URLs
    APP_URL: str = "http://localhost:8000"
    CORS_ORIGINS: List[str] = ["*"]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

settings = Settings()
