from fastapi import APIRouter, Depends, HTTPException, status, Form, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from backend.app.database.connection import get_db
from backend.app.models.models import User, Cat, AdoptionRequest, Questionnaire, BehaviourLog
from backend.app.schemas.schemas import AdoptionResponse, AdoptionCreate, DashboardResponse
from backend.app.routers.auth import get_current_user
from backend.app.services.email_service import EmailService
from typing import List, Optional

router = APIRouter(tags=["Adoption & Dashboard"])

@router.post("/adoption-request", response_model=AdoptionResponse)
def submit_adoption_request(
    data: AdoptionCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submits a new adoption request for a cat."""
    # Check if the cat is available
    cat = db.query(Cat).filter(Cat.id == data.cat_id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cat profile not found."
        )
    if cat.status == "adopted":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This cat has already been adopted."
        )

    # Check for existing request by the same user
    existing_request = db.query(AdoptionRequest).filter(
        AdoptionRequest.user_id == current_user.id,
        AdoptionRequest.cat_id == data.cat_id
    ).first()
    
    if existing_request:
        return existing_request

    # Create new adoption request
    new_request = AdoptionRequest(
        user_id=current_user.id,
        cat_id=data.cat_id,
        status="pending"
    )
    
    # Update cat status to pending
    cat.status = "pending"
    
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    # Reload request with join to cat for schema validation
    request_loaded = db.query(AdoptionRequest).options(joinedload(AdoptionRequest.cat)).filter(
        AdoptionRequest.request_id == new_request.request_id
    ).first()
    
    # Trigger notification emails
    shelter = db.query(User).filter(User.id == cat.shelter_id).first()
    shelter_email = shelter.email if shelter else "shelter@kizunapaws.com"
    background_tasks.add_task(
        EmailService.send_adoption_filed_email,
        current_user.email,
        current_user.name,
        cat.name,
        shelter_email
    )
    
    return request_loaded

@router.post("/adoption-request/{request_id}/status", response_model=dict)
def update_adoption_request_status(
    request_id: str,
    background_tasks: BackgroundTasks,
    action: str = Form(...),  # approve, reject
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Allows shelter workers/admins to approve or reject adoption requests."""
    if current_user.role not in ["shelter", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only shelters and administrators can update application statuses."
        )

    request = db.query(AdoptionRequest).filter(AdoptionRequest.request_id == request_id).first()
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Adoption request not found."
        )

    cat = db.query(Cat).filter(Cat.id == request.cat_id).first()
    
    if action == "approve":
        request.status = "approved"
        if cat:
            cat.status = "adopted"
    elif action == "reject":
        request.status = "rejected"
        if cat:
            # Revert cat back to available
            cat.status = "available"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid action. Please specify 'approve' or 'reject'."
        )

    db.commit()

    # Trigger email notifications
    adopter = db.query(User).filter(User.id == request.user_id).first()
    if adopter and cat:
        background_tasks.add_task(
            EmailService.send_adoption_status_email,
            adopter.email,
            adopter.name,
            cat.name,
            request.status
        )

    return {"message": f"Application status updated to {request.status}.", "request_id": request_id, "status": request.status}

@router.get("/dashboard")
def get_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns consolidated dashboard records based on the user's role.
    Adopters see questionnaire states, pending application queues, adopted cats, behavior logs, and shelter directory.
    Shelters see shelter cats, pending adoption applications, and successful placed adopters log.
    """
    if current_user.role == "shelter":
        # Shelter Dashboard Payload
        shelter_cats = db.query(Cat).options(joinedload(Cat.personality_profile)).filter(
            Cat.shelter_id == current_user.id
        ).all()

        pending_requests = db.query(AdoptionRequest).join(Cat).options(
            joinedload(AdoptionRequest.cat),
            joinedload(AdoptionRequest.user)
        ).filter(
            Cat.shelter_id == current_user.id,
            AdoptionRequest.status == "pending"
        ).all()

        # Placed Adopters Log: Successful placements from this shelter
        placements = db.query(AdoptionRequest).join(Cat).options(
            joinedload(AdoptionRequest.cat),
            joinedload(AdoptionRequest.user)
        ).filter(
            Cat.shelter_id == current_user.id,
            AdoptionRequest.status == "approved"
        ).all()

        placed_adopters = [
            {
                "request_id": r.request_id,
                "approved_at": r.created_at.isoformat(),
                "cat": {
                    "id": r.cat.id,
                    "name": r.cat.name,
                    "breed": r.cat.breed,
                    "image_url": r.cat.image_url
                },
                "adopter": {
                    "id": r.user.id,
                    "name": r.user.name,
                    "email": r.user.email,
                    "phone": r.user.phone,
                    "address": r.user.address
                }
            } for r in placements
        ]

        return {
            "role": "shelter",
            "cats": [
                {
                    "id": c.id,
                    "name": c.name,
                    "age": c.age,
                    "breed": c.breed,
                    "gender": c.gender,
                    "status": c.status,
                    "image_url": c.image_url,
                    "personality_profile": c.personality_profile
                } for c in shelter_cats
            ],
            "pending_applications": [
                {
                    "request_id": r.request_id,
                    "status": r.status,
                    "created_at": r.created_at,
                    "cat": r.cat,
                    "user": {
                        "id": r.user.id,
                        "name": r.user.name,
                        "email": r.user.email
                    }
                } for r in pending_requests
            ],
            "placed_adopters": placed_adopters
        }

    # Adopter Dashboard Payload
    questionnaire = db.query(Questionnaire).filter(Questionnaire.user_id == current_user.id).first()
    
    requests = db.query(AdoptionRequest).options(
        joinedload(AdoptionRequest.cat).joinedload(Cat.personality_profile)
    ).filter(AdoptionRequest.user_id == current_user.id).all()

    # Find cats this user has successfully adopted
    adopted_cats_query = db.query(Cat).join(AdoptionRequest).filter(
        AdoptionRequest.user_id == current_user.id,
        AdoptionRequest.status == "approved"
    ).all()

    # Extract all behavior analysis logs uploaded by this user
    behaviour_logs = db.query(BehaviourLog).filter(BehaviourLog.user_id == current_user.id).order_by(
        BehaviourLog.timestamp.desc()
    ).all()

    # Shelter Directory: List all shelters and their available cats
    shelters = db.query(User).filter(User.role == "shelter").all()
    shelter_directory = []
    for s in shelters:
        cats = db.query(Cat).filter(Cat.shelter_id == s.id, Cat.status == "available").all()
        shelter_directory.append({
            "id": s.id,
            "name": s.name,
            "email": s.email,
            "phone": s.phone,
            "address": s.address,
            "cats": [
                {
                    "id": c.id,
                    "name": c.name,
                    "breed": c.breed,
                    "age": c.age,
                    "gender": c.gender,
                    "image_url": c.image_url
                } for c in cats
            ]
        })

    return {
        "role": "adopter",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role
        },
        "questionnaire": questionnaire,
        "active_requests": requests,
        "adopted_cats": adopted_cats_query,
        "behaviour_logs": behaviour_logs,
        "shelter_directory": shelter_directory
    }
