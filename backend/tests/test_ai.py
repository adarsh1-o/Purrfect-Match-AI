import sys
import os
import numpy as np

# Add project root to sys.path so we can import modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.services.ai_pipeline import AIPipelineService

def test_ai_pipeline():
    service = AIPipelineService()

    # 1. Test movement analyzer with high velocity mock coordinates
    # Simulation: 3 frames where cat shifts coordinates from (10, 10) to (50, 50) to (200, 200)
    mock_keyframes = [
        (0.0, np.zeros((640, 640, 3), dtype=np.uint8)),
        (1.0, np.zeros((640, 640, 3), dtype=np.uint8)),
        (2.0, np.zeros((640, 640, 3), dtype=np.uint8))
    ]
    
    # We will override detect_cat on the service instance to return predictable bounding boxes
    boxes = [
        {"detected": True, "bbox": [10.0, 10.0, 50.0, 50.0], "confidence": 0.9, "method": "test"},
        {"detected": True, "bbox": [50.0, 50.0, 90.0, 90.0], "confidence": 0.9, "method": "test"},
        {"detected": True, "bbox": [200.0, 200.0, 260.0, 260.0], "confidence": 0.9, "method": "test"}
    ]
    
    box_iter = iter(boxes)
    service.detect_cat = lambda img: next(box_iter)

    metrics = service.analyze_movement(mock_keyframes)
    print("\n--- AI Pipeline Heuristics Test ---")
    print(f"Calculated Velocity: {metrics['velocity']:.2f}")
    print(f"Activity Level: {metrics['activity_level']}")
    assert metrics["velocity"] > 50.0
    assert metrics["activity_level"] in ["very active", "moderately active"]

    # 2. Test local heuristic fallback parser
    analysis = service.get_local_heuristic_analysis(metrics)
    print(f"Inferred Mood: {analysis['mood']}")
    print(f"Detected Behaviour: {analysis['detected_behaviour']}")
    print(f"Play Recommendation: {analysis['recommendations']['play']}")
    print(f"Friendliness Score: {analysis['personality_scores']['friendliness']}")

    assert "recommendations" in analysis
    assert "play" in analysis["recommendations"]
    assert "personality_scores" in analysis
    assert analysis["personality_scores"]["playfulness"] > 0.5

    print("Test passed: AI behavior detection metrics and structured fallbacks run successfully.")

if __name__ == "__main__":
    test_ai_pipeline()
