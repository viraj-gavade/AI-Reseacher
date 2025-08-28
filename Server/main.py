from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn

from config import settings
from routes import auth, uploads, chat
from auth import init_dummy_users


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    print("🚀 Starting PDF Chat API...")
    
    # Initialize dummy users for testing
    init_dummy_users()
    print("👥 Dummy users initialized")
    print("   - Username: testuser, Password: testpass123")
    print("   - Username: admin, Password: admin123")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down PDF Chat API...")


# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions globally"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "status_code": exc.status_code
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc) if settings.SECRET_KEY == "fallback-secret-key-change-in-production" else "An error occurred"
        }
    )


# Health check endpoint
@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint"""
    return {
        "message": "PDF Chat API is running!",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "ok"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check"""
    import os
    
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "upload_dir_exists": os.path.exists(settings.UPLOAD_DIR),
        "upload_dir_writable": os.access(settings.UPLOAD_DIR, os.W_OK),
        "environment": "development" if settings.SECRET_KEY == "fallback-secret-key-change-in-production" else "production"
    }


# Include routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(uploads.router, prefix=settings.API_V1_PREFIX)
app.include_router(chat.router, prefix=settings.API_V1_PREFIX)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
