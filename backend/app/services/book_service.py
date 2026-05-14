from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.repositories.book_repo import *
from app.models.book_model import Book
from app.exceptions.custom_exceptions import NotFoundException

from app.cache.cache_service import (
    get_books_cache,
    set_books_cache,
    invalidate_books_cache
)
from app.logging.logger import logger   

#  GET books (with cache)
def get_books(db: Session):
    cached = get_books_cache()

    if cached:
        logger.info("FROM CACHE")
        return cached

    books = get_all_books(db)

    result = [{
        "id": b.id,
        "title": b.title,
        "author": b.author,
        "available_copies": b.available_copies,
        "is_active": b.is_active
    } for b in books]
    
    set_books_cache(result)

    return result


#  CREATE
def create_new_book(db: Session, data):
    book = create_book(db, data.title, data.author, data.available_copies)

    invalidate_books_cache()  

    return book


#  UPDATE
def update_existing_book(db: Session, book_id: int, data):
    book = db.query(Book).filter(Book.id == book_id).first()

    if not book:
        raise NotFoundException("Book not found")

    updated = update_book(db, book, data.dict(exclude_unset=True))

    invalidate_books_cache() 

    return updated


#  DELETE (soft delete)
def delete_existing_book(db: Session, book_id: int):
    book = db.query(Book).filter(Book.id == book_id).first()

    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    book.is_active = False
    db.commit()

    invalidate_books_cache() 

    return {"message": "Book deactivated"}


#  RESTORE
def restore_book(db: Session, book_id: int):
    book = db.query(Book).filter(Book.id == book_id).first()

    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    book.is_active = True
    db.commit()

    invalidate_books_cache()  

    return book


#  ADMIN VIEW
def get_all_books_admin(db: Session):
    return get_all_books_with_inactive(db)