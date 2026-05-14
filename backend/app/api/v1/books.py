from app.database.connection import get_db
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.book_model import Book
from app.schemas.book_schema import BookCreate, BookUpdate, BookOut
from app.services.book_service import *
from app.core.dependencies import require_admin
from app.api.deps import get_db_dep


router = APIRouter(prefix="/books", tags=["Books"])


@router.get("/", response_model=list[BookOut])
def get_books_route(db: Session = get_db_dep()):
    return get_books(db)


@router.post("/", response_model=BookOut)
def create_book_route(
    data: BookCreate,
    db: Session = get_db_dep(),
    user = Depends(require_admin)
):
    return create_new_book(db, data)


@router.put("/{book_id}", response_model=BookOut)
def update_book_route(
    book_id: int,
    data: BookUpdate,
    db: Session = get_db_dep(),
    user = Depends(require_admin)
):
    return update_existing_book(db, book_id, data)


@router.delete("/{book_id}")
def delete_book_route(
    book_id: int,
    db: Session = get_db_dep(),
    user = Depends(require_admin)
):
    delete_existing_book(db, book_id)
    return {"message": "Deleted"}


@router.put("/restore/{book_id}", response_model=BookOut)
def restore_book_route(
    book_id: int,
    db: Session = get_db_dep(),
    user = Depends(require_admin)
):
    return restore_book(db, book_id)


@router.get("/all", response_model=list[BookOut])
def get_all_books_route_admin(
    db: Session = get_db_dep(),
    user = Depends(require_admin)
):
    return get_all_books_admin(db)

@router.delete("/hard-delete/{book_id}")
def hard_delete_book(
    book_id: int,
    db: Session = get_db_dep(),
    user = Depends(require_admin)
):
    book = db.query(Book).filter(Book.id == book_id).first()

    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    db.delete(book)
    db.commit()

    return {"message": "Book deleted permanently"}