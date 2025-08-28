from typing import List
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from fastapi.responses import FileResponse

from models import (
    PDFUploadResponse, 
    PDFListResponse, 
    APIResponse,
    UserInDB
)
from auth import get_current_active_user
from file_utils import (
    save_uploaded_file,
    get_user_files,
    get_file_metadata,
    delete_file,
    get_file_stats
)

router = APIRouter(prefix="/uploads", tags=["File Uploads"])


@router.post("/pdf", response_model=PDFUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_pdf(
    file: UploadFile = File(..., description="PDF file to upload"),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Upload a PDF file
    
    - **file**: PDF file (max 10MB)
    
    Requires authentication. Returns file metadata including file_id for future reference.
    """
    try:
        # Save file and get metadata
        metadata = await save_uploaded_file(file, current_user.id)
        
        # Return response
        return PDFUploadResponse(
            file_id=metadata.file_id,
            filename=metadata.filename,
            original_filename=metadata.original_filename,
            file_size=metadata.file_size,
            content_type=metadata.content_type,
            upload_time=metadata.upload_time,
            user_id=metadata.user_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )


@router.get("/pdfs", response_model=PDFListResponse)
async def list_user_pdfs(current_user: UserInDB = Depends(get_current_active_user)):
    """
    Get list of uploaded PDFs for the current user
    
    Requires authentication. Returns all PDFs uploaded by the current user.
    """
    try:
        # Get user's files
        user_files = get_user_files(current_user.id)
        
        # Convert to response format
        pdf_responses = [
            PDFUploadResponse(
                file_id=metadata.file_id,
                filename=metadata.filename,
                original_filename=metadata.original_filename,
                file_size=metadata.file_size,
                content_type=metadata.content_type,
                upload_time=metadata.upload_time,
                user_id=metadata.user_id
            )
            for metadata in user_files
        ]
        
        return PDFListResponse(
            files=pdf_responses,
            total_count=len(pdf_responses)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve files: {str(e)}"
        )


@router.get("/pdf/{file_id}", response_model=PDFUploadResponse)
async def get_pdf_metadata(
    file_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Get metadata for a specific PDF file
    
    - **file_id**: ID of the PDF file
    
    Requires authentication. Only returns metadata for files owned by the current user.
    """
    # Get file metadata
    metadata = get_file_metadata(file_id, current_user.id)
    
    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found or you don't have permission to access it"
        )
    
    return PDFUploadResponse(
        file_id=metadata.file_id,
        filename=metadata.filename,
        original_filename=metadata.original_filename,
        file_size=metadata.file_size,
        content_type=metadata.content_type,
        upload_time=metadata.upload_time,
        user_id=metadata.user_id
    )


@router.get("/pdf/{file_id}/download")
async def download_pdf(
    file_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Download a PDF file
    
    - **file_id**: ID of the PDF file
    
    Requires authentication. Only allows downloading files owned by the current user.
    """
    # Get file metadata
    metadata = get_file_metadata(file_id, current_user.id)
    
    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found or you don't have permission to access it"
        )
    
    # Check if file exists on disk
    import os
    if not os.path.exists(metadata.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on server"
        )
    
    # Return file
    return FileResponse(
        path=metadata.file_path,
        filename=metadata.original_filename,
        media_type=metadata.content_type
    )


@router.delete("/pdf/{file_id}", response_model=APIResponse)
async def delete_pdf(
    file_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Delete a PDF file
    
    - **file_id**: ID of the PDF file to delete
    
    Requires authentication. Only allows deleting files owned by the current user.
    """
    # Delete file
    success = delete_file(file_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found or you don't have permission to delete it"
        )
    
    return APIResponse(
        success=True,
        message="File deleted successfully"
    )


@router.get("/stats")
async def get_upload_stats(current_user: UserInDB = Depends(get_current_active_user)):
    """
    Get file upload statistics for the current user
    
    Requires authentication. Returns statistics about the user's uploaded files.
    """
    try:
        # Get user's files
        user_files = get_user_files(current_user.id)
        
        # Calculate statistics
        total_files = len(user_files)
        total_size = sum(metadata.file_size for metadata in user_files)
        
        # Get recent files (last 5)
        recent_files = user_files[:5]
        
        return {
            "total_files": total_files,
            "total_size_bytes": total_size,
            "total_size_mb": round(total_size / (1024 * 1024), 2),
            "recent_files": [
                {
                    "file_id": metadata.file_id,
                    "filename": metadata.original_filename,
                    "upload_time": metadata.upload_time,
                    "file_size": metadata.file_size
                }
                for metadata in recent_files
            ]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get statistics: {str(e)}"
        )
