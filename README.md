# 📚 Library Management System

A full-stack library management system built with **FastAPI**, **SQLAlchemy**, **JWT Authentication**, and a modern HTML/CSS/JavaScript frontend. The system covers authentication, role-based access, borrowing workflows, admin dashboards, monitoring, caching, and analytics.

---

## ✨ Features

### 👤 Authentication & Authorization

- JWT-based authentication with persistent login
- User registration and login
- Role-based access control (User / Admin)
- Admin-only protected endpoints

### 📖 Books Management

**Users** can browse, search, borrow, and return books, and view their personal borrow history.

**Admins** can add, edit, soft-delete, restore, and permanently delete books, and view all books including inactive ones.

### 🔄 Borrowing System

- Borrow and return available books
- Automatic copy count tracking
- Prevention of borrowing unavailable books
- Personal and admin-wide borrow history

### ⚡ Caching

- GET `/books/` is cached for performance
- Cache is automatically invalidated on create, update, delete, or restore

### 📊 Monitoring Dashboard

Real-time dashboard with auto-refresh every 10 seconds, including:

- Total requests, errors, error rate, and average response time
- Per-endpoint analytics (requests, errors, response times)
- Recent logs viewer
- Charts powered by Chart.js

### 🧾 Logging Middleware

Tracks HTTP requests, response codes, errors, execution time, and endpoint activity.

---

## 🏗️ Project Structure

```
library_system/
│
├── backend/
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Security & dependencies
│   │   ├── database/       # Database connection
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Database operations
│   │   ├── middleware/     # Logging middleware
│   │   ├── cache/          # Caching system
│   │   ├── exceptions/     # Custom exceptions
│   │   ├── logging/        # Logger setup
│   │   ├── monitoring/     # Monitoring logic
│   │   └── main.py         # FastAPI entry point
│   │
│   ├── tests/              # Pytest test cases
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── css/
│   ├── js/
│   ├── images/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── books.html
│   ├── profile.html
│   ├── dashboard.html
│   ├── admin-dashboard.html
│   ├── borrow-history.html
│   ├── admin-history.html
│   ├── monitor.html
│   └── add-book.html
│
└── docker-compose.yml
```

---

## ⚙️ Installation

### 1️⃣ Clone the Repository

```bash
git clone <your-repository-url>
cd library_system
```

### 2️⃣ Create a Virtual Environment

```bash
conda create -n library_env python=3.10
conda activate library_env
```

### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

## ▶️ Running the Project

### 🖥️ Backend

```bash
uvicorn app.main:app --reload
```

The backend runs at `http://127.0.0.1:8000`.

### 🌐 Frontend

Open any HTML file directly in your browser, or use a Live Server extension:

```
frontend/index.html
```

### 🐳 Docker

```bash
docker-compose up --build
```

---

## 📌 API Documentation

| Interface | URL |
|-----------|-----|
| Swagger UI | `http://127.0.0.1:8000/docs` |
| ReDoc | `http://127.0.0.1:8000/redoc` |

---

## 🔌 API Reference

### 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive JWT |
| GET | `/me` | Get current user info |

### 📚 Books

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/books/` | Get active books (cached) |
| GET | `/books/all` | Get all books — admin only |
| POST | `/books/` | Create a new book |
| PUT | `/books/{id}` | Update a book |
| DELETE | `/books/{id}` | Soft delete (deactivate) |
| PUT | `/books/restore/{id}` | Restore an inactive book |
| DELETE | `/books/hard-delete/{id}` | Permanently delete a book |

### 📦 Borrowing

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/borrow/{book_id}` | Borrow a book |
| POST | `/borrow/return/{book_id}` | Return a book |
| GET | `/borrow/my-history` | Personal borrow history |
| GET | `/borrow/all-history` | Full history — admin only |

### 📈 Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/monitor/` | Get monitoring metrics |

---

## 👥 Roles

### 🙋 User

- View and search books
- Borrow and return books
- View personal borrow history
- View profile

### 🛡️ Admin

- All user permissions
- Add, edit, deactivate, restore, and permanently delete books
- View all borrow history
- Access the monitoring dashboard

---

## 🗑️ Soft Delete vs Hard Delete

Books are not immediately removed. A soft delete sets `is_active = False`, hiding the book from regular users while keeping it visible to admins and allowing it to be restored later.

A hard delete permanently removes the book:

```http
DELETE /books/hard-delete/{id}
```

---

## 🧪 Testing

```bash
pytest
```

---

## 🔧 Tech Stack

| Layer | Technologies |
|-------|-------------|
| Backend | FastAPI, SQLAlchemy, Pydantic, JWT, Pytest, Redis |
| Frontend | HTML5, CSS3, Vanilla JavaScript, Chart.js |
| Infrastructure | Docker, Docker Compose |

---

## 🚀 Future Improvements

- 📧 Email notifications
- 📄 Pagination and advanced search/filtering
- 🌙 Dark / Light mode toggle
- 🔁 CI/CD pipeline
- 🔴 WebSocket live monitoring
- 🤖 Book recommendation system
- 🐳 Docker deployment optimizations

---

> ⭐ Built for educational and portfolio purposes. Demonstrates full-stack architecture with monitoring, caching, analytics, authentication, and admin systems.
