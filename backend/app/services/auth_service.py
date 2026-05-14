from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.repositories.user_repo import get_user_by_username, create_user
from app.core.security import hash_password, verify_password, create_access_token


def register_user(db: Session, username: str, password: str):
    existing = get_user_by_username(db, username)
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed = hash_password(password)
    user = create_user(db, username, hashed)
    return user


def login_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user.username})
    return token