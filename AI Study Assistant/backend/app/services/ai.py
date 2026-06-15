"""AI and vector retrieval helpers.

This module keeps external AI dependencies behind graceful fallbacks. In
production, set GOOGLE_API_KEY to enable Gemini generation. Embeddings are
stored in each chunk's metadata so they work with both SQLite and Postgres.
"""

from __future__ import annotations

import json
import logging
import math
import re
from functools import lru_cache
from typing import Any

from sqlalchemy.orm import Session

from app.config import settings
from app.database import DocumentChunk

logger = logging.getLogger(__name__)


def ai_enabled() -> bool:
    return bool(settings.GOOGLE_API_KEY)


@lru_cache(maxsize=1)
def get_embedding_model():
    try:
        from sentence_transformers import SentenceTransformer
    except Exception as exc:
        logger.warning("SentenceTransformer unavailable; falling back to lexical retrieval: %s", exc)
        return None
    try:
        return SentenceTransformer(settings.EMBEDDING_MODEL)
    except Exception as exc:
        logger.warning("Could not load embedding model %s: %s", settings.EMBEDDING_MODEL, exc)
        return None


@lru_cache(maxsize=1)
def get_gemini_model():
    if not settings.GOOGLE_API_KEY:
        return None
    try:
        import google.generativeai as genai
    except Exception as exc:
        logger.warning("google-generativeai unavailable; using local generation: %s", exc)
        return None
    try:
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        return genai.GenerativeModel(settings.GEMINI_MODEL)
    except Exception as exc:
        logger.warning("Could not initialize Gemini model %s: %s", settings.GEMINI_MODEL, exc)
        return None


def embed_texts(texts: list[str]) -> list[list[float]] | None:
    model = get_embedding_model()
    if model is None or not texts:
        return None
    vectors = model.encode(texts, normalize_embeddings=True)
    return [list(map(float, vector)) for vector in vectors]


def embed_query(text: str) -> list[float] | None:
    vectors = embed_texts([text])
    return vectors[0] if vectors else None


def cosine_similarity(a: list[float], b: list[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(left * right for left, right in zip(a, b))
    norm_a = math.sqrt(sum(value * value for value in a))
    norm_b = math.sqrt(sum(value * value for value in b))
    if not norm_a or not norm_b:
        return 0.0
    return dot / (norm_a * norm_b)


def add_embeddings_to_chunks(chunks: list[DocumentChunk]) -> None:
    vectors = embed_texts([chunk.content for chunk in chunks])
    if vectors is None:
        return
    for chunk, vector in zip(chunks, vectors):
        metadata = dict(chunk.chunk_metadata or {})
        metadata["embedding"] = vector
        metadata["embedding_model"] = settings.EMBEDDING_MODEL
        chunk.chunk_metadata = metadata


def semantic_search_chunks(
    db: Session,
    document_id: int,
    query: str,
    limit: int = 4,
) -> list[dict[str, Any]]:
    query_vector = embed_query(query)
    if query_vector is None:
        return []

    chunks = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.document_id == document_id)
        .order_by(DocumentChunk.chunk_index)
        .all()
    )
    scored = []
    for chunk in chunks:
        metadata = chunk.chunk_metadata or {}
        vector = metadata.get("embedding")
        if not isinstance(vector, list):
            continue
        score = cosine_similarity(query_vector, vector)
        if score > 0:
            scored.append((score, chunk))

    scored.sort(key=lambda item: item[0], reverse=True)
    return [
        {
            "id": chunk.id,
            "document_id": chunk.document_id,
            "content": chunk.content,
            "chunk_index": chunk.chunk_index,
            "metadata": {key: value for key, value in (chunk.chunk_metadata or {}).items() if key != "embedding"},
            "score": round(float(score), 4),
        }
        for score, chunk in scored[:limit]
    ]


def generate_text(prompt: str) -> str | None:
    model = get_gemini_model()
    if model is None:
        return None
    try:
        response = model.generate_content(prompt)
        return (getattr(response, "text", None) or "").strip() or None
    except Exception as exc:
        logger.warning("Gemini generation failed; using local fallback: %s", exc)
        return None


def generate_json(prompt: str) -> dict | list | None:
    text = generate_text(
        prompt
        + "\n\nReturn only valid JSON. Do not include Markdown fences, comments, or explanatory text."
    )
    if not text:
        return None
    cleaned = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.IGNORECASE | re.MULTILINE).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"(\{.*\}|\[.*\])", cleaned, flags=re.DOTALL)
        if not match:
            logger.warning("Gemini returned non-JSON content")
            return None
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            logger.warning("Could not parse Gemini JSON response")
            return None
