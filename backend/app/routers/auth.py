import os
from fastapi import APIRouter, Depends, HTTPException, status, Header, BackgroundTasks
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.models.models import User
from backend.app.schemas.schemas import UserResponse, UserCreate, UserLogin, ForgotPasswordRequest, ResetPasswordRequest
from backend.app.services.auth_utils import hash_password, verify_password, create_access_token, decode_access_token
from backend.app.services.email_service import EmailService
from typing import Optional
import logging
import datetime

logger = logging.getLogger("purrfect_match_ai")

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=UserResponse)
def signup(user_data: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Registers a new adopter or shelter user with hashed passwords."""
    logger.info(f"[AUTH] Signup attempt for email: {user_data.email}")
    
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        logger.warning(f"[AUTH] Signup failed - email already registered: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )
    
    try:
        # Hash password before storage
        logger.debug(f"[AUTH] Hashing password for {user_data.email}")
        hashed_pwd = hash_password(user_data.password)
        
        # Generate verification token
        verification_token = EmailService.generate_verification_token()
        verification_token_expires = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        logger.info(f"[AUTH] Generated verification token for {user_data.email}, expires at {verification_token_expires}")
        
        new_user = User(
            name=user_data.name,
            email=user_data.email,
            role=user_data.role,
            password_hash=hashed_pwd,
            verification_token=verification_token,
            verification_token_expires=verification_token_expires,
            email_verified=False  # Email not verified until verification link clicked
        )
        
        logger.info(f"[AUTH] Creating new user in database: {user_data.email}")
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        logger.info(f"[AUTH] User created successfully: {new_user.id}")
        
        # Schedule welcome email with verification token
        logger.info(f"[AUTH] Adding welcome email task to background queue for {user_data.email}")
        background_tasks.add_task(
            EmailService.send_welcome_email, 
            new_user.email, 
            new_user.name, 
            new_user.role,
            verification_token  # Pass token to welcome email
        )
        logger.info(f"[AUTH] Background task scheduled successfully for {user_data.email}")
        
        return new_user
        
    except Exception as e:
        logger.error(f"[AUTH] Unexpected error during signup for {user_data.email}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating account: {str(e)}"
        )

@router.post("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    """
    Verify a user's email using the verification token sent via email.
    
    Args:
        token: The verification token from the email link
        
    Returns:
        dict: Success message if email verified
    """
    logger.info(f"[AUTH] Email verification attempt with token: {token[:20]}...")
    
    try:
        # Find user with this verification token
        user = db.query(User).filter(User.verification_token == token).first()
        
        if not user:
            logger.warning(f"[AUTH] Email verification failed - invalid token")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification token."
            )
        
        # Check if token has expired
        if user.verification_token_expires and user.verification_token_expires < datetime.datetime.utcnow():
            logger.warning(f"[AUTH] Email verification failed - token expired for {user.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification token has expired. Please request a new one."
            )
        
        # Mark email as verified
        user.email_verified = True
        user.verification_token = None  # Clear token after use
        user.verification_token_expires = None
        db.commit()
        
        logger.info(f"[AUTH] Email verified successfully for {user.email}")
        return {
            "message": "Email verified successfully! You can now log in.",
            "email": user.email
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[AUTH] Unexpected error verifying email: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error verifying email."
        )

@router.post("/resend-verification-email")
def resend_verification_email(
    email: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Resend verification email if user hasn't verified yet.
    
    Args:
        email: User's email address
        
    Returns:
        dict: Success message
    """
    logger.info(f"[AUTH] Resend verification email request for: {email}")
    
    try:
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            # Don't reveal if email exists
            logger.warning(f"[AUTH] Resend verification failed - email not found: {email}")
            return {"message": "If the email exists, a verification link has been sent."}
        
        # Check if already verified
        if user.email_verified:
            logger.info(f"[AUTH] Email already verified for {email}")
            return {"message": "Email is already verified."}
        
        # Generate new verification token
        verification_token = EmailService.generate_verification_token()
        verification_token_expires = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        
        user.verification_token = verification_token
        user.verification_token_expires = verification_token_expires
        db.commit()
        
        logger.info(f"[AUTH] Generated new verification token for {email}")
        
        # Send verification email
        background_tasks.add_task(
            EmailService.send_email_verification_reminder,
            user.email,
            user.name,
            verification_token
        )
        logger.info(f"[AUTH] Verification reminder email scheduled for {email}")
        
        return {"message": "Verification email has been sent."}
        
    except Exception as e:
        logger.error(f"[AUTH] Error resending verification email: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error resending verification email."
        )

@router.post("/send-test-email")
def send_test_email(
    to_email: str,
    background_tasks: BackgroundTasks
):
    """
    Test endpoint to manually send a test email (for debugging).
    
    Args:
        to_email: Recipient email address
        
    Returns:
        dict: Status of email sending
    """
    logger.info(f"[TEST] Test email endpoint called for: {to_email}")
    
    try:
        background_tasks.add_task(
            EmailService.send_email,
            to_email,
            "Test Email from Purrfect Match AI 🐾",
            "<html><body><h1>Test Email</h1><p>This is a test email from Purrfect Match AI.</p></body></html>",
            "Test Email\n\nThis is a test email from Purrfect Match AI."
        )
        logger.info(f"[TEST] Test email task scheduled for {to_email}")
        return {
            "message": "Test email has been scheduled for sending.",
            "recipient": to_email,
            "note": "Check email_logs.txt or your email inbox depending on SMTP configuration."
        }
    except Exception as e:
        logger.error(f"[TEST] Error scheduling test email: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error scheduling test email: {str(e)}"
        )
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

import random

@router.post("/forgot-password")
def forgot_password(
    data: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Initiates password reset process: generates code, stores in database, sends code via email.
    """
    logger.info(f"[AUTH] Forgot password request for: {data.email}")
    
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        logger.warning(f"[AUTH] Forgot password failed - email not found: {data.email}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account associated with this email address."
        )

    # Generate 6-digit numeric verification code
    code = f"{random.randint(100000, 999999)}"
    user.reset_code = code
    db.commit()
    logger.info(f"[AUTH] Generated password reset code for {data.email}")

    # Send reset code email in background
    logger.info(f"[AUTH] Scheduling password reset email for {data.email}")
    background_tasks.add_task(EmailService.send_password_reset_email, user.email, code)

    return {"message": "Verification code dispatched to your email."}

@router.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Verifies code and updates user's password.
    """
    logger.info(f"[AUTH] Reset password request for: {data.email}")
    
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        logger.warning(f"[AUTH] Reset password failed - email not found: {data.email}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account associated with this email address."
        )

    if not user.reset_code or user.reset_code != data.code:
        logger.warning(f"[AUTH] Reset password failed - invalid code for {data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code."
        )

    # Reset password
    logger.info(f"[AUTH] Resetting password for {data.email}")
    hashed_pwd = hash_password(data.new_password)
    user.password_hash = hashed_pwd
    user.reset_code = None  # Clear code
    db.commit()
    logger.info(f"[AUTH] Password reset successfully for {data.email}")

    return {"message": "Password updated successfully. You can now log in."}
