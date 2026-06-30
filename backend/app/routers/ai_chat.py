import os
import shutil
import tempfile
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.models.models import User, Cat, PersonalityProfile
from backend.app.services.ai_pipeline import AIPipelineService
import logging

logger = logging.getLogger("purrfect_match_ai")

# Check if Gemini Generative AI package is installed
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

router = APIRouter(tags=["AI Behavior Advisor"])

# Pydantic schemas for response
class AIChatResponse(BaseModel):
    reply: str
    cat_id: Optional[str] = None
    detected_behaviour: Optional[str] = None
    mood: Optional[str] = None

@router.post("/ai/chat", response_model=AIChatResponse)
def get_ai_behavior_advice(
    message: str = Form(...),
    cat_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Kizuna AI: Feline Behavior Advisor (Supports optional media uploads)
    Provides behavior and care recommendations tailored to a cat's database personality profile and video analysis.
    """
    message_lower = message.lower()
    
    # 1. Handle optional file upload
    detected_behaviour = None
    mood = None
    vision_context = ""
    
    if file:
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
            
        temp_dir = tempfile.gettempdir()
        temp_file_path = os.path.join(temp_dir, f"chat_upload_{uuid.uuid4()}{ext}")
        
        try:
            with open(temp_file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
                
            ai_pipeline = AIPipelineService()
            analysis_result = ai_pipeline.analyze_media(temp_file_path, media_type)
            
            detected_behaviour = analysis_result.get("detected_behaviour")
            mood = analysis_result.get("mood")
            
            recs = analysis_result.get("recommendations", {})
            play_rec = recs.get("play", "")
            social_rec = recs.get("social", "")
            
            vision_context = f"\n[Visual Diagnostics: Our CV pipeline analyzed the photo/video of this cat. Behavior detected: '{detected_behaviour}', Mood: '{mood}'. Play advice: {play_rec}. Social advice: {social_rec}.]"
        except Exception as e:
            logger.error(f"Failed to run vision diagnostics inside chatbot: {e}")
        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)

    # 2. Fetch Cat Profile if cat_id is provided
    cat = None
    profile = None
    if cat_id and cat_id not in ["", "none", "null"]:
        cat = db.query(Cat).filter(Cat.id == cat_id).first()
        if cat:
            profile = cat.personality_profile

    # 3. Extract values for context
    cat_name = cat.name if cat else "this cat"
    breed = cat.breed if cat else "Mixed Breed"
    age = cat.age if cat else 2
    playfulness = profile.playfulness if profile else 0.5
    curiosity = profile.curiosity if profile else 0.5
    energy = profile.energy if profile else 0.5
    confidence = profile.confidence if profile else 0.5
    friendliness = profile.friendliness if profile else 0.5
    independence = profile.independence if profile else 0.5

    # 4. Check for Gemini Key and attempt real AI generation
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key and GEMINI_AVAILABLE:
        try:
            genai.configure(api_key=api_key)
            model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
            model = genai.GenerativeModel(model_name)
            
            prompt = f"""
            You are 'Kizuna AI', a certified feline behavioral specialist. You are advising the owner of a cat.
            
            Cat Profile context:
            - Name: {cat_name}
            - Breed: {breed}
            - Age: {age} years old
            - Playfulness: {playfulness}/1.0
            - Curiosity: {curiosity}/1.0
            - Energy: {energy}/1.0
            - Confidence: {confidence}/1.0
            - Friendliness: {friendliness}/1.0
            - Independence: {independence}/1.0
            {vision_context}
            
            Answer the user's message: "{message}"
            Make your response warm, friendly, concise (maximum 3-4 sentences), and refer specifically to their profile values or the detected visual mood/behavior when relevant.
            """
            
            response = model.generate_content(prompt)
            if response and response.text:
                return AIChatResponse(
                    reply=response.text.strip(),
                    cat_id=cat_id,
                    detected_behaviour=detected_behaviour,
                    mood=mood
                )
        except Exception as e:
            logger.error(f"Gemini chat API failed: {e}. Falling back to local heuristics.")

    # 5. Local Expert Fallback Parser (Deterministic rule-based heuristics)
    reply = ""
    
    # Hide / Shy keywords
    if any(w in message_lower for w in ["hide", "shy", "scared", "fearful", "run away", "under"]):
        if confidence <= 0.45:
            reply = f"{cat_name} has lower confidence (rated {confidence}/1.0). In new environments, they will naturally hide. Provide a quiet, enclosed 'safe room' with their litter box and food. Sit quietly near them without forcing contact to build trust over time."
        else:
            reply = f"{cat_name} is generally confident ({confidence}/1.0). If they are hiding, it is likely due to sudden loud noises or a major household change. Make sure they have vertical perches to climb and observe safely from a distance."
            
    # Play / Active keywords
    elif any(w in message_lower for w in ["play", "toy", "active", "bore", "energetic", "hyper"]):
        if playfulness >= 0.75:
            reply = f"{cat_name} is highly playful ({playfulness}/1.0) and energetic! They require active daily engagement. I recommend at least 30-40 minutes of play using wand toys, laser pointers, or puzzle treat dispensers to redirect their energy positively."
        else:
            reply = f"{cat_name} is relatively calm and has low play requirements ({playfulness}/1.0). Instead of intense chasing, engage them with slow-moving string toys or catnip kickers. Respect their boundaries when they want to relax."
            
    # Cuddle / Affection keywords
    elif any(w in message_lower for w in ["cuddle", "affection", "lap", "love", "pet", "friendly"]):
        if friendliness >= 0.75:
            reply = f"{cat_name} is highly social and affectionate ({friendliness}/1.0)! They will actively seek lap time, follow you around, and love chin scratches. Ensure you set aside dedicated bonding times to satisfy their social needs."
        else:
            reply = f"{cat_name} is independent and has moderate friendliness ({friendliness}/1.0). They show affection in subtle ways, like hanging out in the same room. Avoid forcing physical hold; let them approach you on their own terms."
            
    # Scratch / Bite keywords
    elif any(w in message_lower for w in ["scratch", "bite", "aggressive", "attack", "hiss"]):
        reply = f"If {cat_name} is scratching furniture, place sturdy vertical scratching posts near their favorite spots. If they nip or bite during play, immediately stop moving, redirect their focus to a toy, and never use your hands or fingers as toys."
        
    # Food keywords
    elif any(w in message_lower for w in ["food", "eat", "hungry", "diet", "feed"]):
        if energy >= 0.7:
            reply = f"Since {cat_name} is high-energy, puzzle feeders are excellent for slowing down their eating while providing mental stimulation. Keep their feeding schedule consistent."
        else:
            reply = f"Establish structured feeding times rather than free feeding. This will help you manage {cat_name}'s weight and maintain a strong routine."

    # Help / Capabilities keywords
    elif any(w in message_lower for w in ["help me", "what can you", "how can you help", "capabilities", "features", "what do you do"]):
        reply = f"I can help you understand {cat_name}'s unique personality metrics (like energy, confidence, and playfulness). I can also advise on issues like hiding, scratching, biting, and diet. Feel free to upload a picture or video of them for visual diagnostics!" if cat else "I can help you evaluate general cat behavior, suggest play schedules, explain shyness traits, and advise on diet or scratching habits. You can also upload files for automated mood diagnostics!"

    # Who are you / Identity
    elif any(w in message_lower for w in ["who are you", "your name", "what is your name"]):
        reply = "I am Kizuna AI, your feline behavioral specialist! I specialize in decoding cat habits, moods, and compatibility metrics."

    # Greetings keywords
    elif any(w in message_lower for w in ["hello", "hi", "hey", "greetings", "g'day", "yo"]):
        if cat:
            reply = f"Hello there! 🐾 I am ready to help you with {cat_name}. You can ask me about their play habits, shyness, or how to make them comfortable!"
        else:
            reply = "Hello! 🐾 I am your Kizuna AI Behavior Advisor. I'm here to help you understand feline behavior, play requirements, and body language. What's on your mind today?"

    # Appreciation / Thanks
    elif any(w in message_lower for w in ["thank", "thanks", "awesome", "great", "perfect", "good job"]):
        reply = "You're very welcome! 🐾 Let me know if you have any other questions about keeping your cat happy and healthy."

    # General / Default response
    else:
        if cat:
            reply = f"I am reviewing {cat_name}'s profile. As a {breed} with playfulness rated {playfulness}/1.0 and friendliness rated {friendliness}/1.0, they thrive best in environments matching their natural pacing. Try establishing a daily routine of feeding, play, and quiet time!"
        else:
            reply = "I'm your Kizuna AI Behavior Advisor! Ask me about managing cat habits, resolving shyness, play schedules, or how to read your feline's body language."

    # Append visual diagnostics details if a file was uploaded and processed in local fallback
    if detected_behaviour and mood:
        reply = f"I've analyzed the uploaded media! 🐾 I detected a **{detected_behaviour}** behavior, with a **{mood}** mood. Based on this, here is my advice:\n\n{reply}"

    return AIChatResponse(
        reply=reply,
        cat_id=cat_id,
        detected_behaviour=detected_behaviour,
        mood=mood
    )
