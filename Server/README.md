# FastAPI PDF Chat Backend

A FastAPI backend for PDF upload and chat functionality with JWT authentication.

## Features

- JWT Authentication (access + refresh tokens)
- PDF Upload with metadata storage
- User management (in-memory for now)
- Clean API structure with routers
- Error handling and validation

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get tokens
- `POST /auth/refresh` - Refresh access token

### PDF Management
- `POST /uploads/pdf` - Upload a PDF file
- `GET /uploads/pdfs` - List user's uploaded PDFs
- `GET /uploads/pdf/{file_id}` - Get specific PDF metadata

## Environment Variables

Create a `.env` file with:
```
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```
