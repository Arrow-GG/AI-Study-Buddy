"""Health check endpoints"""
from fastapi import APIRouter
from datetime import datetime
from app.config import settings
from app.services.ai import get_embedding_model, get_gemini_model

router = APIRouter()

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "AI Study Assistant API"
    }

@router.get("/ready")
async def readiness_check():
    """Readiness check endpoint"""
    return {
        "ready": True,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/capabilities")
async def capabilities():
    """Report optional AI capabilities available in this deployment."""
    return {
        "gemini": get_gemini_model() is not None,
        "embeddings": get_embedding_model() is not None,
        "gemini_model": settings.GEMINI_MODEL,
        "embedding_model": settings.EMBEDDING_MODEL,
        "vector_storage": "document_chunks.chunk_metadata.embedding",
    }
