from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


# User Models
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: Optional[str] = None
    role: UserRole = UserRole.USER
    created_at: datetime
    is_active: bool = True


class UserInDB(BaseModel):
    id: str
    username: str
    email: str
    full_name: Optional[str] = None
    hashed_password: str
    role: UserRole = UserRole.USER
    created_at: datetime
    is_active: bool = True


# Token Models
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# PDF Upload Models
class PDFUploadResponse(BaseModel):
    file_id: str
    filename: str
    original_filename: str
    file_size: int
    content_type: str
    upload_time: datetime
    user_id: str


class PDFListResponse(BaseModel):
    files: List[PDFUploadResponse]
    total_count: int


class PDFMetadata(BaseModel):
    file_id: str
    filename: str
    original_filename: str
    file_size: int
    content_type: str
    upload_time: datetime
    user_id: str
    file_path: str  # Internal use only


# API Response Models
class APIResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[str] = None
