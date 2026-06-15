"""Authentication endpoints"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.auth import authenticate_user, issue_tokens, refresh_access_token, register_user

router = APIRouter()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

@router.post("/register", response_model=dict)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user"""
    return register_user(db, request.name, request.email, request.password)

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login user and return JWT tokens"""
    return issue_tokens(authenticate_user(db, request.email, request.password))

@router.post("/refresh")
async def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    """Refresh access token using refresh token"""
    return refresh_access_token(db, refresh_token)

@router.post("/logout")
async def logout():
    """Logout user"""
    return {"message": "Logged out successfully"}
