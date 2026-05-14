from pydantic import BaseModel
from datetime import datetime

class BorrowOut(BaseModel):
    id: int
    user_id: int
    book_id: int
    borrowed_at: datetime
    returned: bool

    class Config:
        from_attributes = True
        
class BorrowAdminOut(BaseModel):
    user_id: int
    username: str
    book_id: int
    book_title: str
    borrowed_at: datetime
    returned: bool