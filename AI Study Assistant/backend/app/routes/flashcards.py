"""Flashcard endpoints"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from enum import Enum
from sqlalchemy.orm import Session

from app.database import FlashcardDeck as FlashcardDeckModel, User, get_db
from app.dependencies import get_current_user
from app.services.study import generate_flashcards as generate_flashcards_service
from app.services.study import get_deck_or_404, next_card, serialize_deck, update_card_status as update_card_status_service

class CardStatus(str, Enum):
    MASTERED = "mastered"
    LEARNING = "learning"
    DIFFICULT = "difficult"

class Flashcard(BaseModel):
    id: int
    front: str
    back: str
    status: CardStatus = CardStatus.LEARNING
    review_count: int = 0
    created_at: str
    last_reviewed: str | None = None

class FlashcardDeck(BaseModel):
    id: int
    document_id: int
    title: str
    cards: List[Flashcard]
    total_cards: int

class FlashcardGenerateRequest(BaseModel):
    document_id: int
    num_cards: int = 20

class CardStatusRequest(BaseModel):
    status: CardStatus

router = APIRouter()

@router.post("/generate", response_model=FlashcardDeck)
async def generate_flashcards(
    request: FlashcardGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate flashcards from a document"""
    return generate_flashcards_service(db, current_user, request.document_id, request.num_cards)

@router.get("/document/{document_id}")
async def get_document_flashcards(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get all flashcard decks for a document"""
    decks = (
        db.query(FlashcardDeckModel)
        .join(FlashcardDeckModel.document)
        .filter(
            FlashcardDeckModel.document_id == document_id,
            FlashcardDeckModel.document.has(user_id=current_user.id),
        )
        .all()
    )
    return [serialize_deck(deck) for deck in decks]

@router.put("/{card_id}/status")
async def update_card_status(
    card_id: int,
    request: CardStatusRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update flashcard mastery status"""
    return update_card_status_service(db, current_user, card_id, request.status.value)

@router.get("/{deck_id}", response_model=FlashcardDeck)
async def get_flashcard_deck(
    deck_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get flashcard deck"""
    return serialize_deck(get_deck_or_404(db, current_user, deck_id))

@router.get("/{deck_id}/next")
async def get_next_card(
    deck_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get next card for review (spaced repetition)"""
    return next_card(db, current_user, deck_id)
