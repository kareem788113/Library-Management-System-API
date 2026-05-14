from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.user_model import User
from app.database.connection import get_db
from app.schemas.user_schema import UserCreate, UserLogin, UserOut
from app.schemas.auth_schema import Token
from app.services.auth_service import register_user, login_user
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    new_user = register_user(db, user.username, user.password)
    return new_user


@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    token = login_user(db, user.username, user.password)
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    return current_user