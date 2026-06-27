from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.models.models import User, Cat, PersonalityProfile
from backend.app.routers.auth import get_current_user
from backend.app.schemas.schemas import UserProfileUpdate, PetStatusUpdate, PetTransfer
from typing import List
import shutil
import uuid
import os

router = APIRouter(prefix="/users", tags=["User Profiles"])

@router.get("/profile", response_model=dict)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves the profile of the current logged-in user and their registered pets."""
    # Load user's owned cats
    cats = db.query(Cat).filter(Cat.owner_id == current_user.id).all()
    
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "address": current_user.address or "",
        "phone": current_user.phone or "",
        "owned_cats": [
            {
                "id": c.id,
                "name": c.name,
                "age": c.age,
                "breed": c.breed,
                "gender": c.gender,
                "status": c.status,
                "description": c.description or "",
                "image_url": c.image_url or ""
            } for c in cats
        ]
    }

@router.put("/profile", response_model=dict)
def update_profile(
    profile_data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Updates contact information for the current user."""
    current_user.name = profile_data.name
    current_user.address = profile_data.address
    current_user.phone = profile_data.phone
    db.commit()
    db.refresh(current_user)
    return {"message": "Profile updated successfully.", "name": current_user.name}

@router.post("/pets", response_model=dict)
def add_custom_pet(
    name: str = Form(...),
    age: int = Form(...),
    breed: str = Form(...),
    gender: str = Form(...),
    description: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Registers a personal pet cat owned directly by the adopter/user."""
    # Save uploaded file
    filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = f"static/uploads/{filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    image_url = f"http://localhost:8000/static/uploads/{filename}"

    new_cat = Cat(
        name=name,
        age=age,
        breed=breed,
        gender=gender.lower(),
        description=description,
        image_url=image_url,
        owner_id=current_user.id,
        status="active"
    )
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)
    
    # Initialize basic personality structure
    profile = PersonalityProfile(
        cat_id=new_cat.id,
        playfulness=0.5,
        curiosity=0.5,
        energy=0.5,
        confidence=0.5,
        friendliness=0.5,
        independence=0.5,
        explanation="Pet profile initialized. Upload videos to run behavioral metrics."
    )
    db.add(profile)
    db.commit()
    
    return {
        "message": "Pet registered successfully.",
        "cat_id": new_cat.id,
        "name": new_cat.name
    }

@router.post("/pets/{cat_id}/status", response_model=dict)
def update_pet_status(
    cat_id: str,
    status_data: PetStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Updates the status of a pet (e.g. active, passed_away)."""
    cat = db.query(Cat).filter(Cat.id == cat_id, Cat.owner_id == current_user.id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet profile not found or access denied."
        )
    
    cat.status = status_data.status
    db.commit()
    return {"message": f"Pet status updated to '{status_data.status}'."}

@router.post("/pets/{cat_id}/transfer", response_model=dict)
def transfer_pet_ownership(
    cat_id: str,
    transfer_data: PetTransfer,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Transfers the ownership of a custom pet to another user by email."""
    cat = db.query(Cat).filter(Cat.id == cat_id, Cat.owner_id == current_user.id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet profile not found or access denied."
        )
    
    # Find new owner
    new_owner = db.query(User).filter(User.email == transfer_data.new_owner_email).first()
    if not new_owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipient email '{transfer_data.new_owner_email}' is not registered on Kizuna Paws."
        )
    
    if new_owner.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot transfer ownership to yourself."
        )
    
    # Transfer ownership
    cat.owner_id = new_owner.id
    cat.status = "active"  # Reset status to active under new owner
    db.commit()
    
    return {
        "message": f"Successfully transferred ownership of '{cat.name}' to {new_owner.name} ({new_owner.email})."
    }
