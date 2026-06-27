from fastapi import APIRouter, Depends, HTTPException, status, Query, Form, File, UploadFile
from sqlalchemy.orm import Session, joinedload
from backend.app.database.connection import get_db
from backend.app.models.models import Cat, PersonalityProfile, User, Questionnaire, Match
from backend.app.schemas.schemas import CatResponse
from backend.app.routers.auth import get_current_user
from backend.app.services.matching_engine import MatchingEngineService
from typing import List, Optional
import shutil
import uuid
import os

router = APIRouter(prefix="/cats", tags=["Cats"])

@router.get("/", response_model=List[dict])
def get_cats(
    gender: Optional[str] = Query(None),
    breed: Optional[str] = Query(None),
    min_age: Optional[int] = Query(None),
    max_age: Optional[int] = Query(None),
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lists available cats. If the user has completed their compatibility questionnaire,
    returns their live compatibility score and details for each cat, sorted by compatibility.
    """
    query = db.query(Cat).options(joinedload(Cat.personality_profile)).filter(Cat.status == "available")

    # Apply filters
    if gender:
        query = query.filter(Cat.gender == gender.lower())
    if breed:
        query = query.filter(Cat.breed.like(f"%{breed}%"))
    if min_age is not None:
        query = query.filter(Cat.age >= min_age)
    if max_age is not None:
        query = query.filter(Cat.age <= max_age)
    if q:
        query = query.filter((Cat.name.like(f"%{q}%")) | (Cat.description.like(f"%{q}%")))

    cats = query.all()

    # Load user's questionnaire to calculate compatibility
    user_questionnaire = db.query(Questionnaire).filter(Questionnaire.user_id == current_user.id).first()

    cats_with_compatibility = []
    for cat in cats:
        cat_data = {
            "id": cat.id,
            "name": cat.name,
            "age": cat.age,
            "breed": cat.breed,
            "gender": cat.gender,
            "description": cat.description,
            "image_url": cat.image_url,
            "status": cat.status,
            "shelter_id": cat.shelter_id,
            "created_at": cat.created_at,
            "personality_profile": {
                "playfulness": cat.personality_profile.playfulness,
                "curiosity": cat.personality_profile.curiosity,
                "energy": cat.personality_profile.energy,
                "confidence": cat.personality_profile.confidence,
                "friendliness": cat.personality_profile.friendliness,
                "independence": cat.personality_profile.independence,
                "explanation": cat.personality_profile.explanation
            } if cat.personality_profile else None,
            "compatibility": None,
            "reasons": []
        }

        if user_questionnaire and cat.personality_profile:
            score, reasons = MatchingEngineService.calculate_match(user_questionnaire, cat.personality_profile, cat)
            cat_data["compatibility"] = score
            cat_data["reasons"] = reasons
            
            # Save or update match in the database for persistence
            match_entry = db.query(Match).filter(Match.user_id == current_user.id, Match.cat_id == cat.id).first()
            if not match_entry:
                match_entry = Match(
                    user_id=current_user.id,
                    cat_id=cat.id,
                    compatibility=score,
                    reasons=", ".join(reasons[:3])
                )
                db.add(match_entry)
            else:
                match_entry.compatibility = score
                match_entry.reasons = ", ".join(reasons[:3])
            db.commit()

        cats_with_compatibility.append(cat_data)

    # Sort by compatibility if questionnaire was completed
    if user_questionnaire:
        cats_with_compatibility.sort(key=lambda x: x["compatibility"] or 0.0, reverse=True)

    return cats_with_compatibility

@router.get("/{id}", response_model=dict)
def get_cat(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves a single cat profile with its personality profile details."""
    cat = db.query(Cat).options(joinedload(Cat.personality_profile)).filter(Cat.id == id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cat profile not found."
        )

    user_questionnaire = db.query(Questionnaire).filter(Questionnaire.user_id == current_user.id).first()
    compatibility_score = None
    reasons = []

    if user_questionnaire and cat.personality_profile:
        compatibility_score, reasons = MatchingEngineService.calculate_match(user_questionnaire, cat.personality_profile, cat)

    cat_data = {
        "id": cat.id,
        "name": cat.name,
        "age": cat.age,
        "breed": cat.breed,
        "gender": cat.gender,
        "description": cat.description,
        "image_url": cat.image_url,
        "status": cat.status,
        "shelter_id": cat.shelter_id,
        "created_at": cat.created_at,
        "personality_profile": {
            "playfulness": cat.personality_profile.playfulness,
            "curiosity": cat.personality_profile.curiosity,
            "energy": cat.personality_profile.energy,
            "confidence": cat.personality_profile.confidence,
            "friendliness": cat.personality_profile.friendliness,
            "independence": cat.personality_profile.independence,
            "explanation": cat.personality_profile.explanation
        } if cat.personality_profile else None,
        "compatibility": compatibility_score,
        "reasons": reasons
    }
    return cat_data

@router.post("/", response_model=CatResponse)
def create_cat(
    name: str = Form(...),
    age: int = Form(...),
    breed: str = Form(...),
    gender: str = Form(...),
    description: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Creates a new cat profile. Restricted to shelter workers/admin roles."""
    if current_user.role not in ["shelter", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to shelters and admins."
        )

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
        shelter_id=current_user.id,
        status="available"
    )
    db.add(new_cat)
    db.commit()
    db.refresh(new_cat)

    # Initialize a default balanced personality profile for the new cat
    default_profile = PersonalityProfile(
        cat_id=new_cat.id,
        playfulness=0.5,
        curiosity=0.5,
        energy=0.5,
        confidence=0.5,
        friendliness=0.5,
        independence=0.5,
        explanation=f"{new_cat.name}'s behavioral profile is initialized. Detailed video analysis is pending."
    )
    db.add(default_profile)
    db.commit()
    db.refresh(new_cat)

    return new_cat

@router.delete("/{id}", response_model=dict)
def delete_cat(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletes a cat profile. Restricted to the shelter owner who registered it (or admin)."""
    if current_user.role not in ["shelter", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to shelters and admins."
        )

    cat = db.query(Cat).filter(Cat.id == id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cat profile not found."
        )

    # Verify ownership restriction: shelter can only delete their own cats!
    if current_user.role == "shelter" and cat.shelter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only delete cats registered under your own shelter profile."
        )

    db.delete(cat)
    db.commit()
    return {"message": f"Cat '{cat.name}' successfully deleted.", "cat_id": id}
