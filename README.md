# Purrfect Match AI — Behavioural Intelligence Platform

Developed by **Kizuna Paws** for the **#hackthekitty 2026** Hackathon.
*Team Members: Ananya Kota, Nakka Adarsh*

---

## 1. Executive Summary

### One-Line Pitch
Purrfect Match AI is an AI-powered behavioral intelligence platform that helps people adopt cats based on personality instead of appearance and continues supporting owners after adoption through behavioral insights and personalized care recommendations.

### The Problem
Today, most adoption platforms display grids of cats filtered solely by aesthetic traits: appearance, breed, color, and age. This appearance-first approach ignores compatibility, leading to:
- Frequent adoption mismatches.
- High shelter return rates (over 35% historically).
- Stressed pets and frustrated, confused first-time owners.
- Lack of ongoing, post-adoption support to help new owners understand what their cat is trying to communicate.

### Our Solution
Purrfect Match AI shifts the focus from **appearance to compatibility** and expands pet support across the **entire companionship journey**.
- **Before Adoption**: Analyze cat videos in the shelter using OpenCV and YOLO to track movement metrics, feed keyframes into Gemini AI to construct behavioral personality vectors (Playfulness, Curiosity, Confidence, Friendliness, Independence), and match them against adopter lifestyle profiles.
- **After Adoption**: A dedicated care dashboard allows owners to upload videos of their adopted cats, getting back real-time mood interpretation and care tips.

---

## 2. Core Value Proposition & Signature Lines

- **The Appearance Gap**: *People adopt cats based on appearance. We help them adopt based on personality.*
- **Welfare Mission**: *Every cat deserves the right human, and every human deserves the right companion.*
- **Beyond the Adoption Line**: *Most adoption platforms stop at adoption. Purrfect Match AI supports the entire companionship journey.*
- **Bonding over Selection**: *We're not just helping people find a cat—we're helping them build a lifelong bond.*

---

## 3. System & Component Architecture

```
                       USER
                        │
                        ▼
              Next.js Frontend (UI)
                        │
                  REST API Requests
                        │
                        ▼
                 FastAPI Backend
             ┌──────────┼──────────┐
             ▼          ▼          ▼
      Matching Engine   AI Service   Authentication
             │    (OpenCV+Gemini fallback)  (Supabase Auth proxy)
             └──────────┬──────────┘
                        ▼
                PostgreSQL Database (SQLite Fallback)
```

### AI Pipeline Workflow
1. **Video/Image Upload**: Shelter uploads cat behavior video; adopter uploads cat photo/video for analysis.
2. **Frame Preprocessing**: OpenCV samples frames at 1 frame per second.
3. **Cat Detection**: YOLOv8 extracts target bounding boxes. (Local contour fallback active if libraries are uncompiled).
4. **Behavior Extraction**: Motion vectors, velocity, and box coordinates are computed.
5. **Generative Modeling**: Keyframes and metrics are fed into Gemini to output a structured JSON personality and mood analysis.

---

## 4. Technical Stack

- **Frontend**: Next.js App Router (React, TypeScript, Tailwind CSS v4, Framer Motion, Lucide icons)
- **Backend**: FastAPI (Python 3.11+, SQLAlchemy ORM)
- **Database**: Supabase PostgreSQL (with a local zero-config SQLite fallback for sandbox execution)
- **AI/ML**: OpenCV (headless frame extraction), Scikit-Learn (distance algorithms), google-generativeai (Gemini API)
- **Deployment**: Multi-container Docker & Docker Compose configuration

---

## 5. Database Schema & ERD

```
    [Users] ──1:1── [Questionnaires]
       │
      1:N
       │
    [Adoption Requests] ──N:1── [Cats] ──1:1── [Personality Profiles]
                                 │
                                1:N
                                 │
                            [Behaviour Logs]
```

- **`users`**: `id` (PK), `name`, `email`, `role` (adopter/shelter/admin), `created_at`
- **`cats`**: `id` (PK), `name`, `age`, `breed`, `gender`, `description`, `image_url`, `shelter_id`, `status` (available/pending/adopted)
- **`personality_profiles`**: `cat_id` (PK, FK), `playfulness`, `curiosity`, `energy`, `confidence`, `friendliness`, `independence`, `explanation`
- **`questionnaires`**: `user_id` (PK, FK), `house_type`, `kids` (bool), `other_pets` (bool), `experience` (beginner/expert), `working_hours`, `preferred_traits`
- **`matches`**: `user_id` (PK, FK), `cat_id` (PK, FK), `compatibility` (float), `reasons`
- **`behaviour_logs`**: `id` (PK), `cat_id` (FK), `user_id` (FK), `media_url`, `media_type`, `detected_behaviour`, `analysis`, `recommendations`, `timestamp`

---

## 6. API Reference (Core Endpoints)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/signup` | Register a new adopter, shelter, or admin user. | No |
| **POST** | `/auth/login` | Simple login using email. | No |
| **GET** | `/cats/` | List all available cats with automatic compatibility scores. | Adopter Header |
| **GET** | `/cats/{id}` | Retrieve single cat profile and detailed personality traits. | Adopter Header |
| **POST** | `/cats/` | Register a new cat (Restricted to Shelter/Admin). | Shelter Header |
| **POST** | `/questionnaire` | Submit lifestyle profile questionnaire. | Adopter Header |
| **GET** | `/results` | Fetch top compatibility matches sorted by match rating. | Adopter Header |
| **POST** | `/adoption-request` | File an application to adopt a companion. | Adopter Header |
| **POST** | `/adoption-request/{id}/status`| Approve or reject pending applications. | Shelter Header |
| **POST** | `/behaviour-analysis` | Upload video/image to perform behavior and mood parsing. | Any Auth Header |
| **GET** | `/dashboard` | Retrieve consolidated role-based dashboard metrics. | Any Auth Header |

---

## 7. Sandbox Fallback & Zero-Config Execution

To guarantee judges can inspect the platform out-of-the-box without requiring database clusters, Cloudinary credentials, or Gemini API keys, the codebase implements a **Zero-Config Sandbox Fallback Mode**:
1. **Database Fallback**: If no `DATABASE_URL` is set, the system automatically initializes a local SQLite file (`purrfect_match.db`) and executes all migrations and seeds on startup.
2. **AI Fallback**: If no `GEMINI_API_KEY` is present, the AI pipeline executes an OpenCV movement velocity parser. It maps movement indices onto deterministic behavioral heuristics, returning high-fidelity, highly realistic care recommendations and personality scores.
3. **Authentication Fallback**: If no token header is provided, the API proxy resolves requests using the default seeded test adopter user.

---

## 8. Run Locally

### Option A: Using Docker Compose (Recommended)
Launch the entire frontend web UI, backend REST API, and SQLite database in one command:
```bash
docker-compose up --build
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API Docs (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)

### Option B: Step-by-Step Manual Launch

#### 1. Setup Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=.. python3 app/main.py
```

#### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 9. Engineering Decision Log

### Why SQLite Sandbox Fallback?
- *Alternative considered*: Hardcoded requirement for Supabase PostgreSQL.
- *Trade-off*: While PostgreSQL is the production target, hackathon environments demand immediate 1-click execution. Requiring external DB URLs would create launch friction. Using SQLite as a default fallback ensures zero-config execution while preserving SQL compatibility.

### Why OpenCV + Heuristics Fallback for AI Bounding Boxes?
- *Alternative considered*: Strict dependency on YOLOv8 (`ultralytics`).
- *Trade-off*: `ultralytics` relies on heavy native compilation of C libraries and PyTorch downloads, which frequently fail on specific host architectures (e.g. M-series macOS chips without correct compilers). Wrapping YOLO in a try/except import block and providing an OpenCV contour area locator ensures the AI service runs successfully on any host machine.

### Why Custom SVG Radar Charts over Chart.js / Recharts?
- *Alternative considered*: Importing standard npm charting libraries.
- *Trade-off*: Adding canvas/charting packages increases frontend bundle size and sometimes introduces rendering crashes on SSR Next.js hydration. Building a simple SVG polygon chart based on trigonometric vertices guarantees 100% hydration safety, fast loads, and custom aesthetic control.
