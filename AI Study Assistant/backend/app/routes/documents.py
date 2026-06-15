"""Document upload and management endpoints"""
from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from typing import List
from datetime import datetime
from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import Document, User, get_db
from app.dependencies import get_current_user
from app.services.documents import delete_document as delete_document_service
from app.services.documents import get_document_or_404, process_document as process_document_service
from app.services.documents import save_text_document, save_upload, serialize_document

router = APIRouter()

class DocumentResponse(BaseModel):
    id: int
    filename: str
    upload_date: datetime
    file_size: int
    status: str
    processed_date: datetime | None = None
    text_length: int = 0

class TextDocumentRequest(BaseModel):
    title: str = "Pasted notes"
    content: str

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a document (PDF, DOCX, TXT)"""
    return await save_upload(db, current_user, file)

@router.post("/text", response_model=DocumentResponse)
async def create_text_document(
    request: TextDocumentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a document from pasted article or note text."""
    return save_text_document(db, current_user, request.title, request.content)

@router.get("/", response_model=List[DocumentResponse])
async def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all documents for the current user"""
    documents = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.upload_date.desc())
        .all()
    )
    return [serialize_document(document) for document in documents]

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get document details"""
    return serialize_document(get_document_or_404(db, current_user, document_id))

@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a document"""
    delete_document_service(db, current_user, document_id)
    return {"message": "Document deleted"}

@router.get("/{document_id}/process")
async def process_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Process document (extract text, create embeddings)"""
    return serialize_document(process_document_service(db, current_user, document_id))
