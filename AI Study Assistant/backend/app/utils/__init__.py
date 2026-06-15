"""Utility functions"""
import logging
from typing import List
import asyncio
from langchain.text_splitter import RecursiveCharacterTextSplitter
from app.config import settings

logger = logging.getLogger(__name__)

def get_text_splitter():
    """Get configured text splitter for document chunking"""
    return RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        separators=["\n\n", "\n", " ", ""]
    )

async def chunk_text(text: str) -> List[str]:
    """
    Split text into chunks for embedding
    
    Args:
        text: Input text
    
    Returns:
        List of text chunks
    """
    try:
        splitter = get_text_splitter()
        chunks = await asyncio.to_thread(splitter.split_text, text)
        logger.info(f"Text split into {len(chunks)} chunks")
        return chunks
    except Exception as e:
        logger.error(f"Failed to chunk text: {str(e)}")
        raise

def validate_file_type(mime_type: str) -> bool:
    """
    Validate file upload mime type
    
    Args:
        mime_type: MIME type to validate
    
    Returns:
        True if valid, False otherwise
    """
    return mime_type in settings.ALLOWED_FILE_TYPES

def format_sources(source_docs: List) -> List[dict]:
    """
    Format source documents for response
    
    Args:
        source_docs: List of source documents from retrieval
    
    Returns:
        Formatted source list
    """
    formatted = []
    for doc in source_docs:
        formatted.append({
            "content": doc.page_content[:200],
            "metadata": doc.metadata
        })
    return formatted
