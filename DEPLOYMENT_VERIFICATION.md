# Deployment Verification Instructions

This document guides the validation and staging deployments of the Purrfect Match AI platform.

---

## 1. Local Staging with Docker Compose

Launch both container services inside a single environment:
```bash
docker-compose up --build
```

### Verification Checks:
1. **Frontend Landing Page**: Access [http://localhost:3000](http://localhost:3000) using a browser. Ensure the landing page animations display, and navigation buttons respond.
2. **Backend API Swagger Interface**: Access [http://localhost:8000/docs](http://localhost:8000/docs). Validate that the interactive Swagger endpoints show routes for auth, matching, behaviour-analysis, and dashboard.
3. **Database Seeding Verification**: Ensure the database generates the SQLite fallback file `purrfect_match.db` dynamically in the root. Verify that cats (Luna, Oliver, etc.) load on the `/browse` page.

---

## 2. Cloud Staging Architecture

For production-grade SaaS scaling:

```
[Next.js Frontend] ──HTTPS──> [FastAPI Backend Server] ──SQL──> [Supabase Database Instance]
  (Vercel App)                  (Render Web Service)
```

### Staging Checklist:
1. **Supabase Database**:
   - Create a project on [Supabase](https://supabase.com).
   - Grab the connection string URL from Database settings.
   - Inject the URL into the backend container's `DATABASE_URL` environment variable.
2. **Backend Web Service (Render / AWS ECS)**:
   - Create a Web Service linked to the repository.
   - Set start command to `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
   - Expose port `8000`.
   - Configure the environment variables:
     - `DATABASE_URL` (Supabase Connection string)
     - `GEMINI_API_KEY` (Your Google Generative AI API Key)
3. **Frontend Serverless Web App (Vercel)**:
   - Create a new project linked to the `/frontend` subfolder.
   - Inject the environment variable:
     - `NEXT_PUBLIC_API_URL` (Pointing to your deployed Render URL: e.g. `https://purrfect-match-api.onrender.com`)
   - Vercel automatically deploys the pages statically.
