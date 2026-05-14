# 📚 Library System API

A full-featured **Library Management System** built using **FastAPI**.
This project demonstrates RESTful API design, authentication, role-based access, caching, logging, and monitoring.

---

## 🚀 Features

* 📖 Manage books (CRUD operations)
* 👤 User authentication (JWT)
* 🔐 Role-based authorization (Admin / User)
* 🔄 Borrow & return system
* ⚡ Redis caching (performance optimization)
* 📊 Monitoring dashboard (requests, errors, logs)
* 🧪 Automated testing with pytest
* 🧾 Structured logging system

---

## 🏗️ Project Structure

```
backend/
│
├── app/
│   ├── api/                # Routes
│   ├── core/               # Security & dependencies
│   ├── database/           # DB connection
│   ├── models/             # SQLAlchemy models
│   ├── schemas/            # Pydantic schemas
│   ├── services/           # Business logic
│   ├── repositories/       # DB operations
│   ├── middleware/         # Logging middleware
│   ├── cache/              # Redis caching
│   ├── exceptions/         # Custom exceptions
│   ├── templates/          # HTML dashboard
│   └── main.py             # Entry point
│
├── tests/                  # Test cases
├── requirements.txt
└── README.md
```

---

## ⚙️ Installation

### 1️⃣ Clone the repository

```
git clone <your-repo-url>
cd backend
```

---

### 2️⃣ Create virtual environment

```
conda create -n library_env python=3.10
conda activate library_env
```

---

### 3️⃣ Install dependencies

```
pip install -r requirements.txt
```

---

## ▶️ Run the Application

```
uvicorn app.main:app --reload
```

---

## 📌 API Documentation

* Swagger UI:
  👉 http://127.0.0.1:8000/docs

* Redoc:
  👉 http://127.0.0.1:8000/redoc

---

## 🔐 Authentication

### Register

```
POST /auth/register
```

### Login

```
POST /auth/login
```

👉 Returns JWT token

---

## 📚 Books Endpoints

| Method | Endpoint            | Description           |
| ------ | ------------------- | --------------------- |
| GET    | /books/             | Get all active books  |
| GET    | /books/all          | Get all books (admin) |
| POST   | /books/             | Create book (admin)   |
| PUT    | /books/{id}         | Update book (admin)   |
| DELETE | /books/{id}         | Soft delete (admin)   |
| PUT    | /books/restore/{id} | Restore book (admin)  |

---

## 📦 Borrow System

| Method | Endpoint                 |
| ------ | ------------------------ |
| POST   | /borrow/{book_id}        |
| POST   | /borrow/return/{book_id} |
| GET    | /borrow/my-history       |

---

## ⚡ Caching (Redis)

* Cache GET `/books/`
* Cache invalidation on:

  * Create
  * Update
  * Delete

---

## 📊 Monitoring Dashboard

### API

```
GET /monitor/
```

### Dashboard UI

```
http://127.0.0.1:8000/monitor/dashboard
```

### Includes:

* Request count
* Error rate
* Response time
* Logs

---

## 🧪 Testing

Run tests:

```
python -m pytest
```

---

## 📝 Logging

* Logs all requests & responses
* Tracks errors
* Shows response time

---

## 🐳 Docker (Optional)

```
docker-compose up --build
```

## ⭐ Notes

* This project is built for educational purposes.
* Demonstrates backend best practices using FastAPI.

---
