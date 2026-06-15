"""Pydantic schemas for request/response validation"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# User schemas
class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Document schemas
class DocumentCreate(BaseModel):
    filename: str

class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_size: int
    status: str
    upload_date: datetime
    processed_date: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Chat schemas
class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1)
    document_id: int

class ChatMessageResponse(BaseModel):
    response: str
    sources: List[dict] = []
    confidence: float

# Quiz schemas
class QuestionResponse(BaseModel):
    id: int
    type: str
    question_text: str
    options: Optional[List[str]] = None
    difficulty: str

class QuizResponse(BaseModel):
    id: int
    title: str
    questions: List[QuestionResponse]
    total_questions: int

# Flashcard schemas
class FlashcardResponse(BaseModel):
    id: int
    front: str
    back: str
    status: str
    review_count: int
    created_at: datetime
    last_reviewed: Optional[datetime] = None

class FlashcardDeckResponse(BaseModel):
    id: int
    title: str
    cards: List[FlashcardResponse]
    total_cards: int

# Summary schemas
class SummaryResponse(BaseModel):
    one_liner: str
    key_concepts: List[str]
    important_formulas: List[str]
    exam_tips: List[str]
    quick_revision: str
