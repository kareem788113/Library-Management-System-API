from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.core.dependencies import get_current_user
from app.services.borrow_service import *

from app.services.borrow_service import get_all_borrow_history
from app.core.dependencies import require_admin
from app.schemas.borrow_schema import BorrowAdminOut

router = APIRouter(prefix="/borrow", tags=["Borrow"])


@router.post("/{book_id}")
def borrow(book_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return borrow_book(db, user)(book_id)


@router.post("/return/{book_id}")
def return_book_route(book_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return return_book(db, user)(book_id)


@router.get("/my-history")
def my_history(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return get_my_history(db, user)

@router.get("/all-history", response_model=list[BorrowAdminOut])
def get_all_history(
    db: Session = Depends(get_db),
    user = Depends(require_admin)
):
    return get_all_borrow_history(db)