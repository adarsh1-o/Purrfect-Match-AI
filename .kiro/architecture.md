# System Architecture

## Component Structure

```mermaid
graph TD
    Client[Next.js Web UI] --> API[FastAPI Backend Server]
    API --> DB[(SQL Database)]
    API --> Gemini[Google Gemini AI]
    API --> Auth[Supabase Auth Proxy]
```

## Architectural Design Pattern
- Monorepo containing segregated `frontend/` (Node/React) and `backend/` (FastAPI/Python) services.
- Clean repository-service pattern separating DB queries from business logics.
