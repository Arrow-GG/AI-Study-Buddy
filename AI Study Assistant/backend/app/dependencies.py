"""FastAPI dependency helpers."""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import User, get_db
from app.services.auth import get_current_user_from_token, oauth2_scheme


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    return get_current_user_from_token(db, token)
