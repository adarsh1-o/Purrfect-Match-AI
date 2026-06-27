import sys
import os

# Add project root to sys.path so we can import modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.models.models import Cat, PersonalityProfile, Questionnaire
from backend.app.services.matching_engine import MatchingEngineService

def test_matching_algorithm():
    # 1. Mock Cats
    quiet_cat = Cat(id="quiet-1", name="Oliver", breed="British Shorthair")
    quiet_profile = PersonalityProfile(
        cat_id="quiet-1",
        playfulness=0.2,
        curiosity=0.3,
        energy=0.1,
        confidence=0.8,
        friendliness=0.6,
        independence=0.9,
        explanation="Calm and independent."
    )

    active_cat = Cat(id="active-1", name="Milo", breed="Bengal Mix")
    active_profile = PersonalityProfile(
        cat_id="active-1",
        playfulness=0.9,
        curiosity=0.95,
        energy=0.95,
        confidence=0.7,
        friendliness=0.7,
        independence=0.4,
        explanation="Highly active and playful."
    )

    # 2. Case A: Busy professional working 10 hours, living in a studio apartment, first-time cat owner, wants a calm/independent cat
    questionnaire_busy = Questionnaire(
        user_id="user-busy",
        house_type="studio",
        kids=False,
        other_pets=False,
        experience="beginner",
        working_hours=10,
        preferred_traits="calm,independent"
    )

    # Run Oliver (should score high due to high independence and low energy)
    oliver_score, oliver_reasons = MatchingEngineService.calculate_match(questionnaire_busy, quiet_profile, quiet_cat)
    # Run Milo (should score lower because Milo is too energetic for a studio and working long hours)
    milo_score, milo_reasons = MatchingEngineService.calculate_match(questionnaire_busy, active_profile, active_cat)

    print(f"\n--- Matching Algorithm Test ---")
    print(f"Oliver Match Score: {oliver_score}%")
    print(f"Oliver Reasons: {oliver_reasons[:2]}")
    print(f"Milo Match Score: {milo_score}%")
    print(f"Milo Reasons: {milo_reasons[:2]}")

    assert oliver_score > milo_score, "Quiet independent cat should match busy studio owner better than active hybrid cat."
    print("Test passed: Compatibility logic is mathematically sound.")

if __name__ == "__main__":
    test_matching_algorithm()
