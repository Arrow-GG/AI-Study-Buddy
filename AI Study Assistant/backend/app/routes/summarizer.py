"""Document summarization endpoints"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session

from app.database import User, get_db
from app.dependencies import get_current_user
from app.services.study import extract_formulas as extract_formulas_from_text
from app.services.study import generate_exam_notes as generate_exam_notes_service
from app.services.study import make_summary
from app.services.documents import all_document_text

class SummaryRequest(BaseModel):
    document_id: int
    summary_type: str = "brief"  # "brief", "detailed", "exam_focused"

class Summary(BaseModel):
    one_liner: str
    key_concepts: List[str]
    important_formulas: List[str]
    exam_tips: List[str]
    quick_revision: str

class NotesRequest(BaseModel):
    document_id: int

router = APIRouter()

@router.post("/summarize", response_model=Summary)
async def summarize_document(
    request: SummaryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate AI summary of document"""
    return make_summary(db, current_user, request.document_id)

@router.post("/exam-notes")
async def generate_exam_notes(
    request: NotesRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate exam-focused notes from document"""
    return generate_exam_notes_service(db, current_user, request.document_id)

@router.post("/key-concepts")
async def extract_key_concepts(
    request: NotesRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Extract and explain key concepts"""
    return {"concepts": make_summary(db, current_user, request.document_id)["key_concepts"]}

@router.post("/formulas")
async def extract_formulas(
    request: NotesRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Extract important formulas from document"""
    return {"formulas": extract_formulas_from_text(all_document_text(db, current_user, request.document_id))}
