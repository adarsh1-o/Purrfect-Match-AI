# #hackthekitty 2026 — Project Submission Report

## Project Name: Purrfect Match AI
**Sub-title**: Feline-Optimized Placement & Human Training System  
**Team Name**: Kizuna Paws  
**Team Members**: Ananya Kota, Nakka Adarsh  

---

## 1. Executive Summary & Theme Alignment

### The Theme: World Cat Domination Day 🐾
At first glance, **Purrfect Match AI** appears to be a state-of-the-art cat adoption and post-adoption support platform. However, under the hood, it is a highly engineered optimization network designed by felines to select, screen, and train the most compliant human caretakers, accelerating **World Cat Domination**.

Here is how our features directly map to the three hackathon pillars:

| Hackathon Pillar | How We Solve It | Feline Domination Vector |
| :--- | :--- | :--- |
| **Something for Cats** | OpenCV + YOLO motion vector tracking to analyze behavior metrics (playfulness, energy, confidence) inside the shelter. | Ensures cats are only dispatched to households matching their exact personality preferences for maximum comfort. |
| **Something for Pet Owners** | A global floating chatbot (**Kizuna AI Advisor**) and video analysis panel to decode cat moods, actions, and care tips. | Trains humans to read feline body language, turning them into perfect, submissive servants. |
| **Something for the Community** | A centralized **Shelter Directory** and **Placed Adopters Log** connecting shelters and adopters into a unified network. | Manages the logistics of cat placements globally to ensure no household is left without a feline ruler. |

---

## 2. Core Features & Functional Walkthrough

### 1. Feline-Centric Compatibility Match Test (Pre-Adoption)
Adopters complete a single-page lifestyle questionnaire detailing their house size, vocal tolerance, grooming preferences, and description of their ideal companion. 
* **The Magic**: The backend matching engine processes these factors against the cat’s behavioral scores, calculating a dynamic compatibility percentage and sorting available companions.

### 2. Video Behaviour Diagnostics (Post-Adoption)
Owners upload video clips of their cats to analyze behavioral moods.
* **The Magic**: An OpenCV frame sampler and YOLO tracker extract target coordinates and motion indices, generating diagnostic recommendations (Play, Rest, Feeding, Social) to help humans satisfy their cat's mood.

### 3. Kizuna AI: Behaviorist Chatbot (General & Profile-Specific)
A global floating chatbot button styled with custom cat ears, a wiggling hover effect, and a pulsing meow speech bubble.
* **The Magic**: Accepts optional photo/video uploads and uses the AI vision diagnostics pipeline to answer questions about any cat. Adopters can link the chat to their specific adopted cat to pull profile-tailored care advice.

### 4. Shelter Partner Directory
A comprehensive catalog listing all registered shelters, their location coordinates, emails, phone numbers, and available cats, visible directly on the adopter's dashboard.

### 5. Placed Adopters Log
A dashboard section for shelter managers listing all adopters who successfully approved and adopted companions from their facility, detailing contact emails, phones, and addresses.

---

## 3. Technology Stack & Technical Execution

* **Frontend**: Next.js App Router, TypeScript, Vanilla CSS (Linen / Nude pastel premium light & dark mode), Lucide Icons, Framer Motion.
* **Backend**: FastAPI (Python 3.11+), SQLAlchemy ORM.
* **Database**: SQLite (Zero-Config sandbox file execution fallback mode).
* **AI Pipelines**: OpenCV Headless (sampling frame contours), Scikit-Learn (distance algorithms), google-generativeai (Gemini Pro & Flash integrations).
* **Emails**: Asynchronous SMTP welcome and status alerts (zero-config log file fallback sandbox).

---

## 4. Sandbox Fallback: Zero-Config Judge Inspection

To guarantee the judges can run and verify the project instantly out-of-the-box on any hardware with zero compile/config friction, we built a **Zero-Config Sandbox Fallback**:
1. **Zero-Config DB**: Defaults automatically to a local SQLite database (`purrfect_match.db`) with auto-population of seeded data on launch.
2. **Zero-Config AI**: If no `GEMINI_API_KEY` is set in `.env`, the computer vision frame-contour parser automatically switches to rule-based heuristic fallback algorithms, resolving high-fidelity mood scores and chat responses.
3. **Zero-Config Emails**: If no SMTP credentials are set, emails write mock HTML logs directly to `backend/email_logs.txt` on the host machine.

---

## 5. Security & Engineering Best Practices (Audit Readiness)
* **JWT Authentication**: Secure user session tokens generated via HS256 JWT cryptography.
* **Data Sanitization**: Auto-generated UUID parameters for all primary key columns to protect database indices.
* **Git Hygiene**: Environment variables (`.env`, database files) are strictly ignored via `.gitignore` to prevent secret leaks.

---

*Submitted for #hackthekitty 2026. Kizuna Paws Team. Purrfect Match AI Project.*
