# AI Processing Pipeline

## Pipeline Workflow

```mermaid
graph TD
    Input[Cat Video/Image] --> CV[OpenCV Frame Sampling]
    CV --> Movement[Centroid Distance Velocity Calculation]
    Movement --> Classify[Mood & Speed Heuristics]
    Classify --> Gemini[Gemini Multimodal Analysis]
    Gemini --> DB[Write BehaviourLog]
```

## CV Velocity Equations
Velocity is calculated as the centroid coordinates displacement divided by the timestamp delta between frames:
$$V = rac{\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}}{t_2 - t_1}$$
