# AI Researcher - Full Stack Setup Guide

This project consists of a React + Vite frontend and a FastAPI backend for PDF chat functionality.

## Project Structure

```
AI Reseacher/
├── Client/          # React + Vite frontend
└── Server/          # FastAPI backend
```

## Quick Start

### 1. Backend Setup (FastAPI)

```bash
cd Server
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at:
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### 2. Frontend Setup (React + Vite)

```bash
cd Client
npm install
npm run dev
```

The frontend will be available at: http://localhost:5173

## Features Implemented

### Frontend (React + Vite + Tailwind CSS)
- ✅ Modern chat interface with real-time messaging
- ✅ PDF upload with drag & drop support
- ✅ Responsive design (mobile-first)
- ✅ Dark/light mode toggle
- ✅ Loading states and error handling
- ✅ Clean, modern UI with shadcn/ui inspired components
- ✅ File management (upload history)

### Backend (FastAPI)
- ✅ JWT authentication (access + refresh tokens)
- ✅ User registration and login
- ✅ PDF upload with validation (10MB max, PDF only)
- ✅ File metadata storage
- ✅ User-specific file access
- ✅ CORS configuration for frontend
- ✅ Comprehensive error handling
- ✅ API documentation with Swagger UI

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get tokens
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user info

### File Upload
- `POST /api/v1/uploads/pdf` - Upload PDF file
- `GET /api/v1/uploads/pdfs` - List user's uploaded PDFs
- `GET /api/v1/uploads/pdf/{file_id}` - Get PDF metadata
- `GET /api/v1/uploads/pdf/{file_id}/download` - Download PDF
- `DELETE /api/v1/uploads/pdf/{file_id}` - Delete PDF

### Chat (Foundation)
- `POST /api/v1/chat/message` - Send chat message
- `GET /api/v1/chat/history` - Get chat history

## Demo Users

For testing, these users are pre-created:
- **Username:** `testuser`, **Password:** `testpass123`
- **Username:** `admin`, **Password:** `admin123`

## Technology Stack

### Frontend
- React 19.1.1
- Vite 7.1.2
- TypeScript
- Tailwind CSS 3.4.17
- Lucide React (icons)
- Axios (HTTP client)

### Backend
- FastAPI 0.104.1
- Python-JOSE (JWT handling)
- Passlib (password hashing)
- Uvicorn (ASGI server)
- Pydantic (data validation)
- Aiofiles (async file operations)

## Current Status

### ✅ Completed
- Full authentication system with JWT
- PDF upload and management
- Modern, responsive frontend
- API documentation
- Error handling and validation
- File security and validation

### 🚧 Next Steps (for production)
1. **Database Integration**: Replace in-memory storage with PostgreSQL/MongoDB
2. **PDF Processing**: Integrate PDF text extraction and AI chat
3. **Chat Persistence**: Store chat history in database
4. **Real-time Chat**: Add WebSocket support
5. **File Storage**: Migrate to cloud storage (AWS S3, etc.)
6. **Advanced Auth**: Add email verification, password reset
7. **Rate Limiting**: Implement API rate limiting
8. **Monitoring**: Add logging and health monitoring

## Testing

### Backend Testing
```bash
cd Server
python test_api.py
```

### Frontend Testing
Open http://localhost:5173 and test:
1. Chat interface
2. PDF upload functionality
3. Responsive design
4. Dark/light mode toggle

## Production Deployment

### Backend
- Use environment variables for secrets
- Enable HTTPS
- Set up proper database
- Configure logging
- Add monitoring

### Frontend
- Build for production: `npm run build`
- Deploy to CDN or static hosting
- Configure environment variables
- Enable HTTPS

## Architecture Notes

### Modular Design
- **Frontend**: Component-based architecture with reusable UI components
- **Backend**: Router-based structure for clean API organization
- **Authentication**: JWT with refresh token strategy
- **File Storage**: Configurable storage backend (local for dev, cloud for prod)

### Security Features
- Password hashing with bcrypt
- JWT token expiration
- File type and size validation
- User-based access control
- CORS protection

This is a production-ready foundation that can be extended with AI capabilities, real-time features, and advanced file processing.
