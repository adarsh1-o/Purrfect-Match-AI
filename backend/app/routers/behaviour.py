import os
import shutil
import tempfile
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.models.models import User, Cat, PersonalityProfile, BehaviourLog
from backend.app.schemas.schemas import BehaviourLogResponse
from backend.app.routers.auth import get_current_user
from backend.app.services.ai_pipeline import AIPipelineService
from typing import Optional, List

router = APIRouter(tags=["AI Behaviour Intelligence"])

# Instantiate the service
ai_service = AIPipelineService()

@router.post("/behaviour-analysis", response_model=dict)
def upload_behaviour_media(
    cat_id: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Uploads a cat video or image to analyze behavior.
    If the upload specifies a cat_id:
    - Runs OpenCV frame extraction & YOLO tracking.
    - Resolves behavioral mood, actions, and care recommendations via Gemini.
    - If the user is a shelter or admin, updates the cat's primary PersonalityProfile vectors.
    - Saves the run to BehaviourLog database table.
    """
    cat = None
    if cat_id and cat_id not in ["custom", "none", ""]:
        cat = db.query(Cat).filter(Cat.id == cat_id).first()
        if not cat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cat profile not found."
            )

    # Validate file type
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    if ext in [".jpg", ".jpeg", ".png", ".webp"]:
        media_type = "image"
    elif ext in [".mp4", ".avi", ".mov", ".mkv", ".webm"]:
        media_type = "video"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported media format. Please upload standard image or video files."
        )

    # Save uploaded file to a temporary file
    temp_dir = tempfile.gettempdir()
    temp_file_path = os.path.join(temp_dir, f"upload_{uuid.uuid4()}_{filename}")
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run AI media analysis pipeline
        analysis_result = ai_service.analyze_media(temp_file_path, media_type)

        # Extract values from analysis
        detected_behaviour = analysis_result.get("detected_behaviour", "Active behavior")
        mood = analysis_result.get("mood", "calm")
        analysis_text = analysis_result.get("analysis", "")
        recs = analysis_result.get("recommendations", {})
        play_rec = recs.get("play", "")
        rest_rec = recs.get("rest", "")
        feeding_rec = recs.get("feeding", "")
        social_rec = recs.get("social", "")

        # Format recommendations in a readable structure
        recommendations_str = f"Play: {play_rec}\nRest: {rest_rec}\nFeeding: {feeding_rec}\nSocial: {social_rec}"

        # Determine media url (in production, upload to Cloudinary. In local sandbox, use local filename/mock path)
        # We will save a mock/local URL pointing to public upload paths
        media_url = f"/uploads/{filename}"

        # Save Behavior Log to DB
        log_entry = BehaviourLog(
            cat_id=cat.id if cat else None,
            user_id=current_user.id,
            media_url=media_url,
            media_type=media_type,
            detected_behaviour=detected_behaviour,
            analysis=f"[{mood.upper()}] {analysis_text}",
            recommendations=recommendations_str
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)

        # If user is a shelter or admin, update the cat's baseline personality profile!
        if cat and current_user.role in ["shelter", "admin"] and "personality_scores" in analysis_result:
            scores = analysis_result["personality_scores"]
            profile = db.query(PersonalityProfile).filter(PersonalityProfile.cat_id == cat.id).first()
            if not profile:
                profile = PersonalityProfile(cat_id=cat.id)
                db.add(profile)
            
            # Map personality scores
            profile.playfulness = scores.get("playfulness", profile.playfulness)
            profile.curiosity = scores.get("curiosity", profile.curiosity)
            profile.energy = scores.get("energy", profile.energy)
            profile.confidence = scores.get("confidence", profile.confidence)
            profile.friendliness = scores.get("friendliness", profile.friendliness)
            profile.independence = scores.get("independence", profile.independence)
            profile.explanation = f"Updated via AI Behaviour Analysis on video upload. Inferred mood: {mood.upper()}. " + analysis_text
            
            db.commit()

        return {
            "id": log_entry.id,
            "cat_id": cat_id,
            "detected_behaviour": detected_behaviour,
            "mood": mood,
            "analysis": analysis_text,
            "recommendations": {
                "play": play_rec,
                "rest": rest_rec,
                "feeding": feeding_rec,
                "social": social_rec
            },
            "media_url": media_url,
            "media_type": media_type,
            "personality_scores_updated": bool(cat and current_user.role in ["shelter", "admin"])
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Pipeline analysis failed: {str(e)}"
        )
    finally:
        # Clean up local file copy
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@router.get("/behaviour-logs/{cat_id}", response_model=List[BehaviourLogResponse])
def get_behaviour_logs(
    cat_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves the history of behavior analysis logs for a specific cat."""
    logs = db.query(BehaviourLog).filter(BehaviourLog.cat_id == cat_id).order_by(BehaviourLog.timestamp.desc()).all()
    return logs
