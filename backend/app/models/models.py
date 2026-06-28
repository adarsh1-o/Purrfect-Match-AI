import datetime
import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    role = Column(String(50), default="adopter")  # adopter, shelter, admin
    password_hash = Column(String(200), nullable=True)
    address = Column(String(200), nullable=True)
    phone = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    questionnaire = relationship("Questionnaire", back_populates="user", uselist=False)
    matches = relationship("Match", back_populates="user", cascade="all, delete-orphan")
    adoption_requests = relationship("AdoptionRequest", back_populates="user")
    behaviour_logs = relationship("BehaviourLog", back_populates="user")
    owned_cats = relationship("Cat", back_populates="owner", foreign_keys="[Cat.owner_id]")

class Cat(Base):
    __tablename__ = "cats"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    breed = Column(String(100), nullable=False)
    gender = Column(String(50), nullable=False)  # male, female
    description = Column(String(1000), nullable=True)
    image_url = Column(String(500), nullable=True)
    shelter_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="available")  # available, pending, adopted, passed_away, transferred
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    personality_profile = relationship("PersonalityProfile", back_populates="cat", uselist=False, cascade="all, delete-orphan")
    matches = relationship("Match", back_populates="cat", cascade="all, delete-orphan")
    adoption_requests = relationship("AdoptionRequest", back_populates="cat", cascade="all, delete-orphan")
    behaviour_logs = relationship("BehaviourLog", back_populates="cat", cascade="all, delete-orphan")
    owner = relationship("User", back_populates="owned_cats", foreign_keys=[owner_id])
    shelter = relationship("User", foreign_keys=[shelter_id])

class PersonalityProfile(Base):
    __tablename__ = "personality_profiles"

    cat_id = Column(String(36), ForeignKey("cats.id", ondelete="CASCADE"), primary_key=True)
    playfulness = Column(Float, default=0.5)  # 0.0 to 1.0
    curiosity = Column(Float, default=0.5)
    energy = Column(Float, default=0.5)
    confidence = Column(Float, default=0.5)
    friendliness = Column(Float, default=0.5)
    independence = Column(Float, default=0.5)
    explanation = Column(String(1000), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    cat = relationship("Cat", back_populates="personality_profile")

class Questionnaire(Base):
    __tablename__ = "questionnaires"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    house_type = Column(String(50), nullable=False)  # apartment, house, studio
    kids = Column(Boolean, default=False)
    other_pets = Column(Boolean, default=False)
    experience = Column(String(50), nullable=False)  # beginner, intermediate, expert
    working_hours = Column(Integer, default=8)
    preferred_traits = Column(String(500), default="")  # comma separated list
    play_budget = Column(String(50), nullable=True)  # quick, active, extensive
    vocal_tolerance = Column(String(50), nullable=True)  # silent, talkative, any
    grooming_preference = Column(String(50), nullable=True)  # low_maintenance, comfortable_daily, any
    ideal_description = Column(String(1000), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="questionnaire")

class Match(Base):
    __tablename__ = "matches"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    cat_id = Column(String(36), ForeignKey("cats.id", ondelete="CASCADE"), primary_key=True)
    compatibility = Column(Float, nullable=False)  # 0 to 100 percentage
    reasons = Column(String(2000), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="matches")
    cat = relationship("Cat", back_populates="matches")

class AdoptionRequest(Base):
    __tablename__ = "adoption_requests"

    request_id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    cat_id = Column(String(36), ForeignKey("cats.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="pending")  # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="adoption_requests")
    cat = relationship("Cat", back_populates="adoption_requests")

class BehaviourLog(Base):
    __tablename__ = "behaviour_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    cat_id = Column(String(36), ForeignKey("cats.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    media_url = Column(String(500), nullable=False)
    media_type = Column(String(50), nullable=False)  # image, video
    detected_behaviour = Column(String(200), nullable=True)
    analysis = Column(String(2000), nullable=True)
    recommendations = Column(String(2000), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    cat = relationship("Cat", back_populates="behaviour_logs")
    user = relationship("User", back_populates="behaviour_logs")
