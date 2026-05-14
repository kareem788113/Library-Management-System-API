from sqlalchemy.orm import Session
from app.models.book_model import Book


def get_all_books(db: Session):
    return db.query(Book).filter(Book.is_active == True).all()

def create_book(db: Session, title: str, author: str, available_copies: int):
    book = Book(
        title=title,
        author=author,
        available_copies=available_copies
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


def update_book(db: Session, book, data):
    for key, value in data.items():
        setattr(book, key, value)
    db.commit()
    db.refresh(book)
    return book


def delete_book(db: Session, book):
    db.delete(book)
    db.commit()
    
def get_all_books_with_inactive(db: Session):
    return db.query(Book).all()