from pydantic import BaseModel

class BookCreate(BaseModel):
    title: str
    author: str
    available_copies: int


class BookUpdate(BaseModel):
    title: str | None = None
    author: str | None = None
    available_copies: int | None = None


class BookOut(BaseModel):
    id: int
    title: str
    author: str
    available_copies: int
    is_active: bool
    class Config:
        from_attributes = True