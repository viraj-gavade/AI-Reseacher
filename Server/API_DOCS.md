# FastAPI PDF Chat Backend - API Documentation

## Overview

This FastAPI backend provides JWT authentication and PDF upload functionality for a chat application. It includes user management, file handling, and a foundation for chat functionality.

## Quick Start

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Access the API documentation:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

## Authentication

The API uses JWT (JSON Web Tokens) for authentication with two types of tokens:
- **Access Token**: Short-lived (30 minutes) for API access
- **Refresh Token**: Long-lived (7 days) for refreshing access tokens

### Demo Users

For testing, the following users are pre-created:
- **Username:** `testuser`, **Password:** `testpass123`
- **Username:** `admin`, **Password:** `admin123`

## API Endpoints

### Authentication Endpoints

#### POST `/api/v1/auth/register`
Register a new user.

**Request Body:**
```json
{
  "username": "string",
  "email": "user@example.com",
  "password": "string",
  "full_name": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user-uuid",
    "username": "string",
    "email": "user@example.com",
    "full_name": "string",
    "role": "user",
    "created_at": "2024-01-01T00:00:00",
    "is_active": true
  }
}
```

#### POST `/api/v1/auth/login`
Login and receive JWT tokens.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "access_token": "jwt-token",
  "refresh_token": "jwt-refresh-token",
  "token_type": "bearer"
}
```

#### POST `/api/v1/auth/refresh`
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "jwt-refresh-token"
}
```

**Response:**
```json
{
  "access_token": "new-jwt-token",
  "refresh_token": "new-jwt-refresh-token",
  "token_type": "bearer"
}
```

#### GET `/api/v1/auth/me`
Get current user information (requires authentication).

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "id": "user-uuid",
  "username": "string",
  "email": "user@example.com",
  "full_name": "string",
  "role": "user",
  "created_at": "2024-01-01T00:00:00",
  "is_active": true
}
```

### File Upload Endpoints

#### POST `/api/v1/uploads/pdf`
Upload a PDF file (requires authentication).

**Headers:**
```
Authorization: Bearer <access-token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: PDF file (max 10MB)

**Response:**
```json
{
  "file_id": "file-uuid",
  "filename": "generated-filename.pdf",
  "original_filename": "user-uploaded-file.pdf",
  "file_size": 1024000,
  "content_type": "application/pdf",
  "upload_time": "2024-01-01T00:00:00",
  "user_id": "user-uuid"
}
```

#### GET `/api/v1/uploads/pdfs`
List all uploaded PDFs for the current user (requires authentication).

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "files": [
    {
      "file_id": "file-uuid",
      "filename": "generated-filename.pdf",
      "original_filename": "user-uploaded-file.pdf",
      "file_size": 1024000,
      "content_type": "application/pdf",
      "upload_time": "2024-01-01T00:00:00",
      "user_id": "user-uuid"
    }
  ],
  "total_count": 1
}
```

#### GET `/api/v1/uploads/pdf/{file_id}`
Get metadata for a specific PDF file (requires authentication).

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "file_id": "file-uuid",
  "filename": "generated-filename.pdf",
  "original_filename": "user-uploaded-file.pdf",
  "file_size": 1024000,
  "content_type": "application/pdf",
  "upload_time": "2024-01-01T00:00:00",
  "user_id": "user-uuid"
}
```

#### GET `/api/v1/uploads/pdf/{file_id}/download`
Download a PDF file (requires authentication).

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:** File download

#### DELETE `/api/v1/uploads/pdf/{file_id}`
Delete a PDF file (requires authentication).

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

#### GET `/api/v1/uploads/stats`
Get upload statistics for the current user (requires authentication).

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "total_files": 5,
  "total_size_bytes": 5120000,
  "total_size_mb": 4.88,
  "recent_files": [
    {
      "file_id": "file-uuid",
      "filename": "document.pdf",
      "upload_time": "2024-01-01T00:00:00",
      "file_size": 1024000
    }
  ]
}
```

### Chat Endpoints

#### POST `/api/v1/chat/message`
Send a chat message (requires authentication).

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "message": "Tell me about this document",
  "file_id": "file-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chat message processed",
  "data": {
    "message": "AI response here",
    "timestamp": "2024-01-01T00:00:00",
    "file_context": "Referenced file: file-uuid"
  }
}
```

#### GET `/api/v1/chat/history`
Get chat history (requires authentication).

**Headers:**
```
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `limit`: Number of messages to return (default: 50)

**Response:**
```json
{
  "success": true,
  "message": "Chat history retrieved",
  "data": {
    "messages": [],
    "note": "Chat history feature not yet implemented"
  }
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message",
  "status_code": 400
}
```

Common HTTP status codes:
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `413`: Request Entity Too Large (file too big)
- `422`: Validation Error
- `500`: Internal Server Error

## Configuration

The application can be configured using environment variables in `.env`:

```env
SECRET_KEY=your-super-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

## File Storage

- Uploaded files are stored in the `uploads/` directory
- Files are renamed with UUIDs to prevent conflicts
- File metadata is stored in memory (replace with database in production)

## Security Features

- Password hashing using bcrypt
- JWT token-based authentication
- File type validation (PDF only)
- File size limits (10MB max)
- User-based file access control
- CORS protection

## Production Considerations

### Database Integration
Replace in-memory storage with a proper database:

1. **User Storage (`auth.py`):**
   ```python
   # Replace users_db dictionary with database queries
   # Example: SQLAlchemy, MongoDB, PostgreSQL
   ```

2. **File Metadata Storage (`file_utils.py`):**
   ```python
   # Replace pdf_files_db dictionary with database queries
   # Store file metadata in database tables
   ```

### Security Enhancements
- Use proper secret key management
- Implement token blacklisting for logout
- Add rate limiting
- Enable HTTPS in production
- Add input sanitization

### Scalability
- Implement file storage with cloud services (AWS S3, Google Cloud Storage)
- Add caching layer (Redis)
- Use background tasks for file processing
- Add logging and monitoring

## Testing

Run the test script to verify API functionality:

```bash
python test_api.py
```

This will test:
- Health check
- User registration
- User login
- Authenticated endpoints
- File operations
- Chat functionality
