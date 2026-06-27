from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# --- USER SCHEMAS ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "adopter"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- PERSONALITY SCHEMAS ---
class PersonalityBase(BaseModel):
    playfulness: float = Field(0.5, ge=0.0, le=1.0)
    curiosity: float = Field(0.5, ge=0.0, le=1.0)
    energy: float = Field(0.5, ge=0.0, le=1.0)
    confidence: float = Field(0.5, ge=0.0, le=1.0)
    friendliness: float = Field(0.5, ge=0.0, le=1.0)
    independence: float = Field(0.5, ge=0.0, le=1.0)

class PersonalityCreate(PersonalityBase):
    explanation: Optional[str] = None

class PersonalityResponse(PersonalityBase):
    cat_id: str
    explanation: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- CAT SCHEMAS ---
class CatBase(BaseModel):
    name: str
    age: int
    breed: str
    gender: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    status: str = "available"

class CatCreate(CatBase):
    pass

class CatResponse(CatBase):
    id: str
    shelter_id: Optional[str] = None
    created_at: datetime
    personality_profile: Optional[PersonalityResponse] = None

    class Config:
        from_attributes = True

# --- QUESTIONNAIRE SCHEMAS ---
class QuestionnaireBase(BaseModel):
    house_type: str  # apartment, house, studio
    kids: bool
    other_pets: bool
    experience: str  # beginner, intermediate, expert
    working_hours: int
    preferred_traits: str  # comma-separated string list

class QuestionnaireCreate(QuestionnaireBase):
    pass

class QuestionnaireResponse(QuestionnaireBase):
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- MATCH SCHEMAS ---
class MatchResponse(BaseModel):
    user_id: str
    cat_id: str
    compatibility: float
    reasons: Optional[str] = None
    cat: Optional[CatResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- ADOPTION SCHEMAS ---
class AdoptionCreate(BaseModel):
    cat_id: str

class AdoptionResponse(BaseModel):
    request_id: str
    user_id: str
    cat_id: str
    status: str
    created_at: datetime
    cat: Optional[CatResponse] = None

    class Config:
        from_attributes = True

# --- BEHAVIOUR LOG SCHEMAS ---
class BehaviourLogCreate(BaseModel):
    cat_id: str
    media_url: str
    media_type: str

class BehaviourLogResponse(BaseModel):
    id: str
    cat_id: str
    user_id: str
    media_url: str
    media_type: str
    detected_behaviour: Optional[str] = None
    analysis: Optional[str] = None
    recommendations: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

# --- CONSOLIDATED DASHBOARD SCHEMA ---
class DashboardResponse(BaseModel):
    user: UserResponse
    questionnaire: Optional[QuestionnaireResponse] = None
    adopted_cats: List[CatResponse] = []
    active_requests: List[AdoptionResponse] = []
    behaviour_logs: List[BehaviourLogResponse] = []

# --- PROFILE & PET LIFECYCLE SCHEMAS ---
class UserProfileUpdate(BaseModel):
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None

class PetCreate(BaseModel):
    name: str
    age: int
    breed: str
    gender: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class PetStatusUpdate(BaseModel):
    status: str

class PetTransfer(BaseModel):
    new_owner_email: EmailStr
