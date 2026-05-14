from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.book_model import Book
from app.repositories.borrow_repo import *
from app.utils.constants import MAX_BORROW_LIMIT
from sqlalchemy.orm import Session
from app.models.borrow_model import BorrowRecord as Borrow
from app.models.user_model import User
from app.models.book_model import Book


def borrow_book(db: Session, user):
    def inner(book_id: int):
        book = db.query(Book).filter(Book.id == book_id).first()

        if not book:
            raise HTTPException(status_code=404, detail="Book not found")

        if book.available_copies <= 0:
            raise HTTPException(status_code=400, detail="Book not available")

        borrows = get_user_borrows(db, user.id)
        active = [b for b in borrows if not b.returned]

        if len(active) >= MAX_BORROW_LIMIT:
            raise HTTPException(status_code=400, detail="Borrow limit reached")

        book.available_copies -= 1
        db.commit()

        return create_borrow(db, user.id, book_id)

    return inner


def return_book(db: Session, user):
    def inner(book_id: int):
        record = get_active_borrow(db, user.id, book_id)

        if not record:
            raise HTTPException(status_code=404, detail="No active borrow found")

        record.returned = True

        book = db.query(Book).filter(Book.id == book_id).first()
        book.available_copies += 1

        db.commit()

        return {"message": "Returned successfully"}

    return inner


def get_my_history(db: Session, user):
    return get_user_borrows(db, user.id)


def get_all_borrow_history(db: Session):
    records = db.query(Borrow, User, Book) \
        .join(User, Borrow.user_id == User.id) \
        .join(Book, Borrow.book_id == Book.id) \
        .all()

    result = []

    for borrow, user, book in records:
        result.append({
            "user_id": user.id,
            "username": user.username,
            "book_id": book.id,
            "book_title": book.title,
            "borrowed_at": borrow.borrowed_at,
            "returned": borrow.returned
        })

    return result