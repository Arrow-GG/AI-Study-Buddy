"""Quiz generation and management endpoints"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import List
from enum import Enum
from sqlalchemy.orm import Session

from app.database import Quiz as QuizModel, User, get_db
from app.dependencies import get_current_user
from app.services.study import generate_quiz as generate_quiz_service
from app.services.study import get_quiz_or_404, serialize_quiz, submit_quiz as submit_quiz_service

class QuestionType(str, Enum):
    MCQ = "mcq"
    TRUE_FALSE = "true_false"
    FILL_BLANK = "fill_blank"
    SHORT_ANSWER = "short_answer"

class Question(BaseModel):
    id: int
    type: QuestionType
    question_text: str
    question: str
    options: List[str] = Field(default_factory=list)
    correct_answer: str
    difficulty: str

class Quiz(BaseModel):
    id: int
    document_id: int
    title: str
    questions: List[Question]
    total_questions: int

class QuizResponse(BaseModel):
    id: int
    score: int
    total: int
    percentage: float
    answers: List[dict]

class QuizGenerateRequest(BaseModel):
    document_id: int
    num_questions: int = 10
    question_type: str = "mcq"

class QuizSubmitRequest(BaseModel):
    answers: List[dict]

router = APIRouter()

@router.post("/generate", response_model=Quiz)
async def generate_quiz(
    request: QuizGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate quiz from a document"""
    return generate_quiz_service(db, current_user, request.document_id, request.num_questions, request.question_type)

@router.get("/document/{document_id}")
async def get_document_quizzes(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all quizzes for a document"""
    quizzes = (
        db.query(QuizModel)
        .join(QuizModel.document)
        .filter(QuizModel.document_id == document_id, QuizModel.document.has(user_id=current_user.id))
        .all()
    )
    return [serialize_quiz(quiz) for quiz in quizzes]

@router.get("/{quiz_id}", response_model=Quiz)
async def get_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get quiz details"""
    return serialize_quiz(get_quiz_or_404(db, current_user, quiz_id))

@router.post("/{quiz_id}/submit", response_model=QuizResponse)
async def submit_quiz(
    quiz_id: int,
    request: QuizSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit quiz answers and get results"""
    return submit_quiz_service(db, current_user, quiz_id, request.answers)
