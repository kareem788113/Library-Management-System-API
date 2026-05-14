from fastapi import FastAPI, Depends
from fastapi.responses import HTMLResponse
from app.database.connection import engine
from app.database.base import Base
from app.models import user_model, book_model, borrow_model

from app.api.v1.auth import router as auth_router
from app.core.dependencies import get_current_user
from app.schemas.user_schema import UserOut
from app.api.v1.books import router as books_router
from app.api.v1.borrow import router as borrow_router
from app.middleware.logging_middleware import LoggingMiddleware
from app.api.v1.monitoring import router as monitor_router
from fastapi.middleware.cors import CORSMiddleware

from pathlib import Path

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth_router)

app.include_router(books_router)

app.include_router(borrow_router)

app.add_middleware(LoggingMiddleware)

app.include_router(monitor_router)

@app.get("/me", response_model=UserOut)
def get_me(user = Depends(get_current_user)):
    return user

def require_admin(user = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    return user

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"Request: {request.method} {request.url}")

    response = await call_next(request)

    print(f"Response status: {response.status_code}")

    return response


def dashboard_page():
    html = Path("app/templates/monitor.html").read_text(encoding="utf-8")
    return html