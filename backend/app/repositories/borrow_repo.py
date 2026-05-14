from sqlalchemy.orm import Session
from app.models.borrow_model import BorrowRecord


def create_borrow(db: Session, user_id: int, book_id: int):
    record = BorrowRecord(user_id=user_id, book_id=book_id)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_user_borrows(db: Session, user_id: int):
    return db.query(BorrowRecord).filter(BorrowRecord.user_id == user_id).all()


def get_active_borrow(db: Session, user_id: int, book_id: int):
    return db.query(BorrowRecord).filter(
        BorrowRecord.user_id == user_id,
        BorrowRecord.book_id == book_id,
        BorrowRecord.returned == False
    ).first()