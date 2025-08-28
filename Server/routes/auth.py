from datetime import timedelta
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials

from models import (
    UserCreate, 
    UserLogin, 
    UserResponse, 
    Token, 
    RefreshTokenRequest,
    APIResponse
)
from auth import (
    create_user, 
    authenticate_user, 
    create_access_token, 
    create_refresh_token,
    verify_token,
    get_current_active_user,
    security,
    UserInDB
)
from config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate):
    """
    Register a new user
    
    - **username**: Unique username (3-50 characters)
    - **email**: Valid email address
    - **password**: Password (minimum 6 characters)
    - **full_name**: Optional full name
    """
    try:
        # Create new user
        user = create_user(
            username=user_data.username,
            email=user_data.email,
            password=user_data.password,
            full_name=user_data.full_name
        )
        
        # Convert to response model
        user_response = UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            created_at=user.created_at,
            is_active=user.is_active
        )
        
        return APIResponse(
            success=True,
            message="User registered successfully",
            data=user_response.dict()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=Token)
async def login_user(user_credentials: UserLogin):
    """
    Login user and return JWT tokens
    
    - **username**: User's username
    - **password**: User's password
    
    Returns access token (30 min) and refresh token (7 days)
    """
    # Authenticate user
    user = authenticate_user(user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is inactive"
        )
    
    # Create tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    token_data = {"sub": user.username, "user_id": user.id}
    
    access_token = create_access_token(
        data=token_data, 
        expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data=token_data,
        expires_delta=refresh_token_expires
    )
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


@router.post("/refresh", response_model=Token)
async def refresh_access_token(refresh_request: RefreshTokenRequest):
    """
    Refresh access token using refresh token
    
    - **refresh_token**: Valid refresh token
    
    Returns new access token and refresh token
    """
    try:
        # Verify refresh token
        token_data = verify_token(refresh_request.refresh_token, "refresh")
        
        # Get user
        from auth import get_user_by_username
        user = get_user_by_username(token_data.username)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Create new tokens
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        token_data_dict = {"sub": user.username, "user_id": user.id}
        
        new_access_token = create_access_token(
            data=token_data_dict,
            expires_delta=access_token_expires
        )
        new_refresh_token = create_refresh_token(
            data=token_data_dict,
            expires_delta=refresh_token_expires
        )
        
        return Token(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserInDB = Depends(get_current_active_user)):
    """
    Get current user information
    
    Requires valid access token in Authorization header
    """
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        created_at=current_user.created_at,
        is_active=current_user.is_active
    )


@router.post("/logout")
async def logout_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Logout user (token blacklisting would be implemented here in production)
    
    For now, this is a placeholder endpoint.
    In production, you would add the token to a blacklist.
    """
    # TODO: Implement token blacklisting
    # For now, just return success message
    return APIResponse(
        success=True,
        message="Logged out successfully. Please remove the token from client storage."
    )
