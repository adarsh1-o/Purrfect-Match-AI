from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from backend.app.database.connection import get_db
from backend.app.models.models import Questionnaire, User, Cat, Match, PersonalityProfile
from backend.app.schemas.schemas import QuestionnaireCreate, QuestionnaireResponse, MatchResponse
from backend.app.routers.auth import get_current_user
from backend.app.services.matching_engine import MatchingEngineService
from typing import List

router = APIRouter(tags=["Matching Engine"])

@router.post("/questionnaire", response_model=QuestionnaireResponse)
def submit_questionnaire(
    data: QuestionnaireCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits or updates the lifestyle questionnaire for the logged-in user.
    Triggers re-evaluation of compatibility scores for all available cats.
    """
    # Check if a questionnaire already exists
    questionnaire = db.query(Questionnaire).filter(Questionnaire.user_id == current_user.id).first()
    
    if questionnaire:
        # Update existing
        questionnaire.house_type = data.house_type
        questionnaire.kids = data.kids
        questionnaire.other_pets = data.other_pets
        questionnaire.experience = data.experience
        questionnaire.working_hours = data.working_hours
        questionnaire.preferred_traits = data.preferred_traits
    else:
        # Create new
        questionnaire = Questionnaire(
            user_id=current_user.id,
            house_type=data.house_type,
            kids=data.kids,
            other_pets=data.other_pets,
            experience=data.experience,
            working_hours=data.working_hours,
            preferred_traits=data.preferred_traits
        )
        db.add(questionnaire)
    
    db.commit()
    db.refresh(questionnaire)

    # Automatically trigger compatibility matching across all available cats and cache results
    cats = db.query(Cat).options(joinedload(Cat.personality_profile)).filter(Cat.status == "available").all()
    for cat in cats:
        if cat.personality_profile:
            score, reasons = MatchingEngineService.calculate_match(questionnaire, cat.personality_profile, cat)
            
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
    return questionnaire

@router.post("/match", response_model=dict)
def calculate_match_profile(
    cat_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Calculates compatibility score and reasons explicitly for a given cat and user."""
    questionnaire = db.query(Questionnaire).filter(Questionnaire.user_id == current_user.id).first()
    if not questionnaire:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please submit your lifestyle compatibility questionnaire first."
        )

    cat = db.query(Cat).options(joinedload(Cat.personality_profile)).filter(Cat.id == cat_id).first()
    if not cat or not cat.personality_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cat profile or personality traits not found."
        )

    score, reasons = MatchingEngineService.calculate_match(questionnaire, cat.personality_profile, cat)
    return {
        "user_id": current_user.id,
        "cat_id": cat_id,
        "compatibility": score,
        "reasons": reasons
    }

@router.get("/results", response_model=List[MatchResponse])
def get_match_results(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves all matched cats for the current user, sorted by compatibility percentage."""
    matches = db.query(Match).options(joinedload(Match.cat).joinedload(Cat.personality_profile)).filter(
        Match.user_id == current_user.id
    ).order_by(Match.compatibility.desc()).all()

    # If no matches, calculate them on the fly (just in case they submitted questionnaire but records missed)
    if not matches:
        questionnaire = db.query(Questionnaire).filter(Questionnaire.user_id == current_user.id).first()
        if questionnaire:
            cats = db.query(Cat).options(joinedload(Cat.personality_profile)).filter(Cat.status == "available").all()
            for cat in cats:
                if cat.personality_profile:
                    score, reasons = MatchingEngineService.calculate_match(questionnaire, cat.personality_profile, cat)
                    match_entry = Match(
                        user_id=current_user.id,
                        cat_id=cat.id,
                        compatibility=score,
                        reasons=", ".join(reasons[:3])
                    )
                    db.add(match_entry)
            db.commit()
            
            # Fetch again
            matches = db.query(Match).options(joinedload(Match.cat).joinedload(Cat.personality_profile)).filter(
                Match.user_id == current_user.id
            ).order_by(Match.compatibility.desc()).all()

    return matches
