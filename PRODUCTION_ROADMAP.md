# Production Readiness Roadmap
*Purrfect Match AI - Kizuna Paws*

To transition the platform from a local hackathon sandbox to a resilient, production-grade SaaS application, several key architectural components need upgrading. Below is the technical roadmap for production readiness:

---

## 1. Database Layer: From SQLite to Hosted PostgreSQL
Currently, the application uses local SQLite files (`purrfect_match.db`). While perfect for local development, SQLite is serverless and does not handle high-concurrency writes, connection pooling, or automated backups.

### Recommendations
* **Database Target**: Deploy a managed PostgreSQL database (e.g., Supabase, Neon, or AWS RDS).
* **Connection Dialect**: Update `backend/app/database/connection.py` to dynamically switch drivers based on environment variables:
  ```python
  import os
  DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./purrfect_match.db")
  # Convert 'postgres://' to 'postgresql://' for SQLAlchemy compatibility
  if DATABASE_URL.startswith("postgres://"):
      DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
  ```
* **Migrations**: Introduce **Alembic** to manage database schema updates incrementally without resetting or deleting user data.

---

## 2. Media Hosting: From Local Storage to Cloud Buckets
The application now saves uploaded cat profile photos and diagnostic videos directly to the local filesystem (`backend/static/uploads/`). In a deployed environment (like Heroku, Vercel, or AWS ECS), the server filesystem is **ephemeral** (files disappear when the container restarts) and does not scale across multiple server instances.

### Recommendations
* **Cloud Storage Buckets**: Use **AWS S3** or **Supabase Storage** to save uploaded files.
* **Upload Utility**: Implement an async file writer utilizing `boto3` (for S3) or the Supabase Python SDK:
  ```python
  import boto3
  s3 = boto3.client('s3')
  s3.upload_fileobj(file.file, "purrfect-match-bucket", f"uploads/{filename}")
  image_url = f"https://purrfect-match-bucket.s3.amazonaws.com/uploads/{filename}"
  ```

---

## 3. Environment Secrets Management
Several settings are currently hardcoded (e.g., frontend API calls hitting `http://localhost:8000`, backend JWT credentials keys, etc.).

### Recommendations
* **Frontend Configs**: Create `.env.local` and `.env.production` files:
  ```env
  NEXT_PUBLIC_API_URL=https://api.purrfectmatch.ai
  ```
  Update `frontend/lib/api.ts` to reference `process.env.NEXT_PUBLIC_API_URL` instead of the hardcoded localhost string.
* **Backend Configurations**: Use Pydantic Settings to load secrets from environment variables:
  ```python
  from pydantic_settings import BaseSettings

  class Settings(BaseSettings):
      database_url: str
      jwt_secret: str
      gemini_api_key: Optional[str] = None
      aws_access_key_id: Optional[str] = None
      aws_secret_access_key: Optional[str] = None

      class Config:
          env_file = ".env"
  ```

---

## 4. Production AI Diagnostics
The AI diagnostics system uses an OpenCV contour bounding-box fallback when YOLOv8 (`ultralytics`) or Gemini models are unavailable. 

### Recommendations
* **Hosted Inference**: Deploy the YOLOv8 model as a dedicated microservice (e.g., on Roboflow, AWS SageMaker, or RunPod) or provision a container with a GPU instance for fast real-time video parsing.
* **OpenAI/Gemini Vision API**: Provide an active API key to feed video frame samplings to a multimodal model (like `gemini-1.5-flash`), extracting highly detailed behavioral insights.

---

## 5. Security & Session Enhancements
* **Token Expiration**: Implement JWT expiration checks and refresh token flows to automatically log out inactive users.
* **HTTPS**: Enforce SSL encryption on both the frontend and API servers.
* **Password Constraints**: Add validation checks on registration (e.g., minimum 8 characters, numbers, and special symbols).
