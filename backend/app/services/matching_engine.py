from typing import Dict, Any, List, Tuple
from backend.app.models.models import PersonalityProfile, Questionnaire, Cat

class MatchingEngineService:
    @staticmethod
    def calculate_match(questionnaire: Questionnaire, profile: PersonalityProfile, cat: Cat) -> Tuple[float, List[str]]:
        """
        Calculates compatibility score (0.0 to 100.0) between user questionnaire and cat personality.
        Returns compatibility score and a list of detailed reason strings (Explainable AI).
        """
        score = 100.0
        reasons = []

        # Extract values
        playfulness = profile.playfulness
        curiosity = profile.curiosity
        energy = profile.energy
        confidence = profile.confidence
        friendliness = profile.friendliness
        independence = profile.independence

        # 1. House Type Constraints
        if questionnaire.house_type == "studio":
            if energy > 0.75:
                penalty = (energy - 0.75) * 35
                score -= penalty
                reasons.append(f"Luna is an energetic Bengal Mix/hybrid type, which might feel restricted in a compact studio environment.")
            else:
                score += 5
                reasons.append(f"Your studio is a great match for {cat.name}'s moderate-to-low energy profile.")
        elif questionnaire.house_type == "apartment":
            if energy > 0.85:
                penalty = (energy - 0.85) * 20
                score -= penalty
                reasons.append(f"Since you live in an apartment, {cat.name}'s extremely high energy levels will require dedicated exercise areas or toys.")
            else:
                reasons.append(f"Your apartment layout fits {cat.name}'s indoor activity profile.")
        else:  # house
            score += 5
            reasons.append(f"Your spacious house provides plenty of room for {cat.name} to roam and play.")

        # 2. Kids Compatibility
        if questionnaire.kids:
            # Need friendly and confident cats
            if friendliness < 0.6:
                penalty = (0.6 - friendliness) * 40
                score -= penalty
                reasons.append(f"{cat.name} can be a bit reserved and might find a busy home with children overwhelming.")
            if confidence < 0.5:
                penalty = (0.5 - confidence) * 30
                score -= penalty
                reasons.append(f"{cat.name} has a sensitive nature and may startle around high-activity kids.")
            if friendliness >= 0.75 and confidence >= 0.6:
                score += 8
                reasons.append(f"Highly kid-friendly! {cat.name} is outgoing, confident, and very gentle, making them excellent for families.")
        else:
            # Single or couple without kids
            if independence > 0.7:
                score += 5
                reasons.append(f"Since you have no children in the household, {cat.name}'s independent streak will be fully respected.")

        # 3. Other Pets Compatibility
        if questionnaire.other_pets:
            # Need friendly, non-aggressive cats
            if friendliness < 0.5:
                penalty = (0.5 - friendliness) * 30
                score -= penalty
                reasons.append(f"{cat.name} prefers being the center of attention and may struggle sharing space with other pets.")
            elif friendliness >= 0.8:
                score += 8
                reasons.append(f"Sociable and peace-loving. {cat.name} gets along very well with other animal companions.")
        else:
            if independence > 0.6:
                reasons.append(f"Perfect fit for a single-pet household, letting {cat.name} occupy their favorite spots in peace.")

        # 4. Experience Levels
        if questionnaire.experience == "beginner":
            if friendliness < 0.6:
                penalty = (0.6 - friendliness) * 30
                score -= penalty
                reasons.append(f"As a first-time cat owner, {cat.name}'s shy or introverted personality may require advanced patience and boundary setting.")
            if independence > 0.8:
                score -= 10
                reasons.append(f"{cat.name} is highly independent, which can sometimes make bonding a bit slower for beginners.")
            if friendliness >= 0.8 and confidence >= 0.7:
                score += 10
                reasons.append(f"Beginner friendly: {cat.name}'s affectionate, predictable temperament makes them a delightful first companion.")
        elif questionnaire.experience == "expert":
            score += 5
            reasons.append(f"Your extensive pet experience makes you perfectly suited for {cat.name}'s unique behavioral nuances.")

        # 5. Working Hours & Isolation tolerance
        if questionnaire.working_hours >= 8:
            # Need independent cats who don't get separation anxiety
            if independence < 0.4:
                penalty = (0.4 - independence) * 45
                score -= penalty
                reasons.append(f"Because you are away for work 8+ hours, {cat.name}'s high need for human contact could lead to separation distress.")
            elif independence >= 0.7:
                score += 12
                reasons.append(f"Great fit for busy schedules. {cat.name} is highly self-sufficient and comfortable staying home alone during work hours.")
        else:
            # User is home often
            if independence < 0.4:
                score += 10
                reasons.append(f"Since you are home frequently, you will be able to provide the close companionship and lap time {cat.name} craves.")

        # 6. Preferred Traits Matching
        preferred = [t.strip().lower() for t in questionnaire.preferred_traits.split(",") if t.strip()]
        trait_matches = 0
        for trait in preferred:
            if trait == "playful" and playfulness >= 0.7:
                trait_matches += 1
            elif trait == "curious" and curiosity >= 0.7:
                trait_matches += 1
            elif trait == "calm" and energy <= 0.4:
                trait_matches += 1
            elif trait == "independent" and independence >= 0.7:
                trait_matches += 1
            elif trait == "friendly" and friendliness >= 0.7:
                trait_matches += 1
            elif trait == "affectionate" and friendliness >= 0.8:
                trait_matches += 1
            elif trait == "confident" and confidence >= 0.7:
                trait_matches += 1

        if preferred:
            match_rate = trait_matches / len(preferred)
            score += match_rate * 15
            if trait_matches > 0:
                reasons.append(f"Matched {trait_matches} of your preferred personality expectations (e.g., traits you selected).")

        # 7. Play Budget Matching
        if hasattr(questionnaire, "play_budget") and questionnaire.play_budget:
            if questionnaire.play_budget == "quick":
                if playfulness > 0.75:
                    score -= 15
                    reasons.append(f"{cat.name} is highly playful and energetic, which might exceed your quick play schedule.")
                else:
                    score += 5
                    reasons.append(f"{cat.name}'s moderate energy levels fit well with a quick play routine.")
            elif questionnaire.play_budget == "extensive":
                if playfulness >= 0.75:
                    score += 10
                    reasons.append(f"Excellent fit! {cat.name} thrives on active interaction and matches your extensive play budget.")
                elif playfulness <= 0.4:
                    score -= 10
                    reasons.append(f"{cat.name} is calmer and might not engage as actively during your planned long play sessions.")

        # 8. Vocal Tolerance Matching
        if hasattr(questionnaire, "vocal_tolerance") and questionnaire.vocal_tolerance:
            breed_lower = cat.breed.lower()
            if questionnaire.vocal_tolerance == "silent":
                if "siamese" in breed_lower or curiosity > 0.8:
                    score -= 15
                    reasons.append(f"{cat.name} belongs to a vocal breed or exhibits talkative tendencies, which conflicts with your preference for quiet.")
                else:
                    score += 5
            elif questionnaire.vocal_tolerance == "talkative":
                if "siamese" in breed_lower or curiosity >= 0.7:
                    score += 10
                    reasons.append(f"You'll love chatting with {cat.name}! They are very vocal and communicative.")

        # 9. Grooming Preference Matching
        if hasattr(questionnaire, "grooming_preference") and questionnaire.grooming_preference:
            breed_lower = cat.breed.lower()
            is_longhair = any(lh in breed_lower for lh in ["ragdoll", "persian", "main", "forest", "longhair"])
            if questionnaire.grooming_preference == "low_maintenance":
                if is_longhair:
                    score -= 15
                    reasons.append(f"{cat.name} has a long or high-maintenance coat that requires more frequent grooming than preferred.")
                else:
                    score += 5
            elif questionnaire.grooming_preference == "comfortable_daily":
                if is_longhair:
                    score += 10
                    reasons.append(f"{cat.name}'s luxury long coat matches your interest in daily grooming and brushing.")

        # 10. Keyword Search on Ideal Description
        if hasattr(questionnaire, "ideal_description") and questionnaire.ideal_description:
            desc_lower = questionnaire.ideal_description.lower()
            keyword_matches = 0
            if any(w in desc_lower for w in ["active", "play", "run", "toy", "high"]):
                if playfulness >= 0.7 or energy >= 0.7:
                    keyword_matches += 1
            if any(w in desc_lower for w in ["lap", "cuddle", "snuggle", "sweet", "friendly"]):
                if friendliness >= 0.75:
                    keyword_matches += 1
            if any(w in desc_lower for w in ["quiet", "calm", "chill", "peaceful"]):
                if energy <= 0.4:
                    keyword_matches += 1
            
            if keyword_matches > 0:
                score += keyword_matches * 5
                reasons.append(f"Your description matched {cat.name}'s behavioral profile characteristics.")

        # Clamp score between 0.0 and 100.0
        final_score = float(max(10.0, min(100.0, score)))
        return round(final_score, 1), reasons
