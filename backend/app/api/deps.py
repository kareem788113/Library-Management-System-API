from fastapi import Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.core.dependencies import get_current_user


def get_db_dep() -> Session:
    return Depends(get_db)


def get_current_user_dep():
    return Depends(get_current_user)