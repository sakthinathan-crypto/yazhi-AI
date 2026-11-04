"""
Main FastAPI Application Entry Point for YAZHI.
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.endpoints import router as api_router
from app.api.websocket import ws_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Telephony AI Call Assistant for Sakthinathan Jayakumar (Sakthi). Integrates Gemini Live API, Exotel Voicebot, Supabase PostgreSQL, and Telegram Notifications."
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API
app.include_router(api_router, prefix=settings.API_PREFIX)

# Mount WebSocket routes
app.include_router(ws_router)

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "tagline": "Your Personal AI. Your Calls. Your Control.",
        "owner": settings.OWNER_NAME,
        "assistant": settings.ASSISTANT_NAME,
        "docs_url": "/docs",
        "api_health": f"{settings.API_PREFIX}/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
