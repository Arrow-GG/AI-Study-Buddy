"""Chat and RAG endpoints"""
from fastapi import APIRouter, Depends, WebSocket, status
from pydantic import BaseModel, Field
from typing import List
from sqlalchemy.orm import Session

from app.database import ChatMessage as ChatMessageModel, User, get_db
from app.dependencies import get_current_user
from app.services.study import answer_question

router = APIRouter()

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    document_id: int
    conversation_history: List[ChatMessage] = Field(default_factory=list)

class ChatResponse(BaseModel):
    response: str
    sources: List[dict] = Field(default_factory=list)
    confidence: float

@router.post("/ask", response_model=ChatResponse)
async def ask_question(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ask a question about uploaded documents using RAG"""
    return answer_question(db, current_user, request.document_id, request.message)

@router.websocket("/ws/{document_id}")
async def websocket_chat(websocket: WebSocket, document_id: str):
    """WebSocket endpoint for real-time chat"""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            response = {"response": "WebSocket chat requires authenticated HTTP requests in production.", "sources": [], "confidence": 0}
            await websocket.send_json(response)
    except Exception as e:
        await websocket.close(code=status.WS_1000_NORMAL_CLOSURE)

@router.get("/history/{document_id}")
async def get_chat_history(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get chat history for a document"""
    messages = (
        db.query(ChatMessageModel)
        .filter(ChatMessageModel.document_id == document_id, ChatMessageModel.user_id == current_user.id)
        .order_by(ChatMessageModel.created_at.asc())
        .all()
    )
    return [
        {
            "id": message.id,
            "role": message.role,
            "content": message.content,
            "sources": message.sources,
            "created_at": message.created_at.isoformat(),
        }
        for message in messages
    ]
