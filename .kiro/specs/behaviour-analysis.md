# Behaviour Analysis Module Spec
- **Objective**: Process user-uploaded pet clips and return care summaries.
- **Design**: API calls Gemini API with frames and activity logs.
- **Implementation**: Managed in `routers/behaviour.py`.
- **Future Enhancements**: Async queues using Celery/Redis for large video file pipelines.
