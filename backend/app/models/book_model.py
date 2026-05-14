from sqlalchemy import Column, Integer, String
from app.database.base import Base
from sqlalchemy import Boolean

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    author = Column(String(100), nullable=False)
    available_copies = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
