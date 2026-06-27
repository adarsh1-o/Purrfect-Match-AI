import sys
import os
from sqlalchemy.orm import Session

# Add project root to sys.path so we can import modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

from backend.app.database.connection import engine, Base, SessionLocal
from backend.app.models.models import User, Cat, PersonalityProfile, Questionnaire

def seed_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if database is already seeded
        if db.query(User).first() is not None:
            print("Database already seeded.")
            return

        print("Seeding database...")

        # 1. Create Users
        adopter_user = User(
            id="adopter-12345",
            name="Ananya Kota",
            email="adopter@kizunapaws.com",
            role="adopter"
        )
        shelter_user = User(
            id="shelter-12345",
            name="Kizuna Shelter",
            email="shelter@kizunapaws.com",
            role="shelter"
        )
        admin_user = User(
            id="admin-12345",
            name="Nakka Adarsh",
            email="admin@kizunapaws.com",
            role="admin"
        )

        db.add_all([adopter_user, shelter_user, admin_user])
        db.commit()

        # 2. Create Cats
        cat1 = Cat(
            id="cat-luna-001",
            name="Luna",
            age=2,
            breed="Domestic Shorthair",
            gender="female",
            description="Luna is a social butterfly who loves interactive games and thrives in family environments. Highly confident and eager to greet guests.",
            image_url="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop",
            shelter_id=shelter_user.id,
            status="available"
        )
        cat2 = Cat(
            id="cat-oliver-002",
            name="Oliver",
            age=4,
            breed="British Shorthair",
            gender="male",
            description="Oliver is an independent observer who prefers quiet spaces and self-guided play. Perfect for busy professionals and peaceful apartments.",
            image_url="https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&auto=format&fit=crop",
            shelter_id=shelter_user.id,
            status="available"
        )
        cat3 = Cat(
            id="cat-milo-003",
            name="Milo",
            age=1,
            breed="Bengal Mix",
            gender="male",
            description="Milo is an energetic adventurer who loves high perches, puzzle toys, and exploring every corner of your home. Needs an active owner who can engage him in daily training.",
            image_url="https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&auto=format&fit=crop",
            shelter_id=shelter_user.id,
            status="available"
        )
        cat4 = Cat(
            id="cat-bella-004",
            name="Bella",
            age=3,
            breed="Ragdoll",
            gender="female",
            description="Bella is a gentle giant who loves cuddles and thrives on human companionship. Extremely affectionate and ideal for families with children or other friendly pets.",
            image_url="https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=600&auto=format&fit=crop",
            shelter_id=shelter_user.id,
            status="available"
        )
        cat5 = Cat(
            id="cat-cleo-005",
            name="Cleo",
            age=5,
            breed="Siamese",
            gender="female",
            description="Cleo is a vocal communicator who enjoys participating in household activities, chatting with her owners, and curling up on warm laps.",
            image_url="https://images.unsplash.com/photo-1513360309081-36f5e878fc9e?w=600&auto=format&fit=crop",
            shelter_id=shelter_user.id,
            status="available"
        )

        db.add_all([cat1, cat2, cat3, cat4, cat5])
        db.commit()

        # 3. Create Personality Profiles
        profile1 = PersonalityProfile(
            cat_id=cat1.id,
            playfulness=0.8,
            curiosity=0.7,
            energy=0.6,
            confidence=0.8,
            friendliness=0.9,
            independence=0.3,
            explanation="Luna scored highly in friendliness and confidence. She actively approaches human observers, engages eagerly with feather toys, and shows little hesitation in new environments."
        )
        profile2 = PersonalityProfile(
            cat_id=cat2.id,
            playfulness=0.3,
            curiosity=0.4,
            energy=0.2,
            confidence=0.7,
            friendliness=0.5,
            independence=0.8,
            explanation="Oliver showed highly independent behavior. He spends most of his time perched high or napping. He appreciates physical affection on his own terms and prefers quiet areas."
        )
        profile3 = PersonalityProfile(
            cat_id=cat3.id,
            playfulness=0.95,
            curiosity=0.9,
            energy=0.9,
            confidence=0.7,
            friendliness=0.6,
            independence=0.5,
            explanation="Milo exhibits Bengal characteristics with very high playfulness and energy. He is constantly on the move, interacts strongly with moving targets, and displays active curiosity about new objects."
        )
        profile4 = PersonalityProfile(
            cat_id=cat4.id,
            playfulness=0.4,
            curiosity=0.5,
            energy=0.3,
            confidence=0.8,
            friendliness=0.95,
            independence=0.2,
            explanation="Bella is exceptionally friendly and gentle. She seeks out physical contact, relaxes completely when held, and does not show territorial or reactive behaviors."
        )
        profile5 = PersonalityProfile(
            cat_id=cat5.id,
            playfulness=0.6,
            curiosity=0.8,
            energy=0.5,
            confidence=0.6,
            friendliness=0.75,
            independence=0.6,
            explanation="Cleo exhibits high vocal curiosity. She responds actively to human speech and visual cues. She maintains a moderate balance between playfulness and affectionate lounging."
        )

        db.add_all([profile1, profile2, profile3, profile4, profile5])
        db.commit()

        # 4. Create a default questionnaire for the adopter
        questionnaire = Questionnaire(
            user_id=adopter_user.id,
            house_type="apartment",
            kids=False,
            other_pets=False,
            experience="beginner",
            working_hours=8,
            preferred_traits="friendly,calm,affectionate",
            play_budget="active",
            vocal_tolerance="any",
            grooming_preference="any",
            ideal_description="Looking for a friendly and calm companion to hang out with after work."
        )
        db.add(questionnaire)
        db.commit()

        print("Database seeded successfully.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
