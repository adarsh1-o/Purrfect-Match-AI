# Deployment Plan

- **Containerization**: Mapped via `docker-compose.yml` exposing port 3000 (UI) and port 8000 (API).
- **Staging Cloud Mappings**:
  - Frontend: Vercel serverless triggers.
  - Backend: Render container service.
  - Database: Supabase PostgreSQL instance.
