import os
import uuid
import aiofiles
from datetime import datetime
from typing import Dict, List, Optional
from fastapi import HTTPException, status, UploadFile

from config import settings
from models import PDFMetadata

# In-memory storage for PDF metadata
# TODO: Replace with actual database implementation
pdf_files_db: Dict[str, PDFMetadata] = {}


def generate_unique_filename(original_filename: str) -> str:
    """Generate a unique filename while preserving the extension"""
    file_id = str(uuid.uuid4())
    file_extension = os.path.splitext(original_filename)[1]
    return f"{file_id}{file_extension}"


def validate_pdf_file(file: UploadFile) -> None:
    """Validate uploaded PDF file"""
    # Check file type
    if file.content_type not in settings.ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Only PDF files are allowed. Got: {file.content_type}"
        )
    
    # Check file size (this is approximate since we haven't read the file yet)
    # The actual size check will happen during upload
    if hasattr(file, 'size') and file.size and file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size allowed: {settings.MAX_FILE_SIZE / (1024*1024):.1f}MB"
        )


async def save_uploaded_file(file: UploadFile, user_id: str) -> PDFMetadata:
    """Save uploaded file to disk and store metadata"""
    # Validate file
    validate_pdf_file(file)
    
    # Generate unique filename
    unique_filename = generate_unique_filename(file.filename)
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    try:
        # Save file to disk
        file_size = 0
        async with aiofiles.open(file_path, 'wb') as buffer:
            while chunk := await file.read(8192):  # Read in 8KB chunks
                file_size += len(chunk)
                
                # Check file size during upload
                if file_size > settings.MAX_FILE_SIZE:
                    # Remove partially uploaded file
                    os.remove(file_path)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File too large. Maximum size allowed: {settings.MAX_FILE_SIZE / (1024*1024):.1f}MB"
                    )
                
                await buffer.write(chunk)
        
        # Create metadata
        file_id = str(uuid.uuid4())
        metadata = PDFMetadata(
            file_id=file_id,
            filename=unique_filename,
            original_filename=file.filename,
            file_size=file_size,
            content_type=file.content_type,
            upload_time=datetime.utcnow(),
            user_id=user_id,
            file_path=file_path
        )
        
        # Store metadata in database
        pdf_files_db[file_id] = metadata
        
        return metadata
        
    except Exception as e:
        # Clean up file if something went wrong
        if os.path.exists(file_path):
            os.remove(file_path)
        
        if isinstance(e, HTTPException):
            raise e
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )


def get_user_files(user_id: str) -> List[PDFMetadata]:
    """Get all files uploaded by a specific user"""
    user_files = []
    for metadata in pdf_files_db.values():
        if metadata.user_id == user_id:
            user_files.append(metadata)
    
    # Sort by upload time (newest first)
    user_files.sort(key=lambda x: x.upload_time, reverse=True)
    return user_files


def get_file_metadata(file_id: str, user_id: str) -> Optional[PDFMetadata]:
    """Get metadata for a specific file"""
    metadata = pdf_files_db.get(file_id)
    
    if not metadata:
        return None
    
    # Check if user owns this file
    if metadata.user_id != user_id:
        return None
    
    return metadata


def delete_file(file_id: str, user_id: str) -> bool:
    """Delete a file and its metadata"""
    metadata = get_file_metadata(file_id, user_id)
    
    if not metadata:
        return False
    
    try:
        # Remove file from disk
        if os.path.exists(metadata.file_path):
            os.remove(metadata.file_path)
        
        # Remove metadata from database
        del pdf_files_db[file_id]
        
        return True
        
    except Exception:
        return False


def get_file_stats() -> Dict[str, int]:
    """Get file statistics (for admin/debugging)"""
    total_files = len(pdf_files_db)
    total_size = sum(metadata.file_size for metadata in pdf_files_db.values())
    
    return {
        "total_files": total_files,
        "total_size_bytes": total_size,
        "total_size_mb": round(total_size / (1024 * 1024), 2)
    }
