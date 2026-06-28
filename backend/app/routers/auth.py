import os
from fastapi import APIRouter, Depends, HTTPException, status, Header, BackgroundTasks
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.models.models import User
from backend.app.schemas.schemas import UserResponse, UserCreate, UserLogin
from backend.app.services.auth_utils import hash_password, verify_password, create_access_token, decode_access_token
from backend.app.services.email_service import EmailService
from typing import Optional

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=UserResponse)
def signup(user_data: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Registers a new adopter or shelter user with hashed passwords."""
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )
    
    # Hash password before storage
    hashed_pwd = hash_password(user_data.password)
    
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        role=user_data.role,
        password_hash=hashed_pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    background_tasks.add_task(EmailService.send_welcome_email, new_user.email, new_user.name, new_user.role)
    
    return new_user

@router.post("/login", response_model=dict)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Logs in an existing user, verifies password, and returns a JWT access token."""
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please sign up."
        )
    
    # Verify password (allow passwordless bypass only for seeded accounts with null hashes)
    if user.password_hash:
        if not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password. Please try again."
            )
    
    # Generate JWT
    token_data = {"sub": user.id, "email": user.email, "role": user.role}
    access_token = create_access_token(data=token_data)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }

def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to resolve the currently logged-in user.
    Handles JWT decoding. Falls back to seeded adopter if header is empty.
    """
    # Fallback to default user if no authorization header is supplied (hackathon staging flow)
    if not authorization:
        user = db.query(User).filter(User.id == "adopter-12345").first()
        if not user:
            user = User(id="adopter-12345", name="Ananya Kota", email="adopter@kizunapaws.com", role="adopter")
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    try:
        # Expected header: 'Bearer <jwt_token>'
        token = authorization.split(" ")[1] if " " in authorization else authorization
        
        # 1. Attempt to decode token as a valid JWT
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            user_id = payload["sub"]
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                return user
        
        # 2. Fallback to query database directly (backward compatibility for local raw tokens)
        user = db.query(User).filter((User.id == token) | (User.email == token)).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid session token or expired authentication."
            )
        return user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials."
        )
