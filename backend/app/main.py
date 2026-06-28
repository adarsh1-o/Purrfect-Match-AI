import os
from dotenv import load_dotenv
load_dotenv()

import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database.connection import engine, Base
from backend.app.database.seed import seed_db
from backend.app.routers import auth, cats, matching, behaviour, adoption, users, ai_chat

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("purrfect_match_ai")

# Initialize FastAPI App
app = FastAPI(
    title="Purrfect Match AI API",
    description="Behavioral intelligence cat adoption and post-adoption support platform.",
    version="1.0.0"
)

# Configure CORS Middleware
# Allows requests from Next.js frontend running locally or in production
import os
from fastapi.staticfiles import StaticFiles

# Ensure static uploads directories exist
os.makedirs("static/uploads", exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# Global Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error occurred at {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected server error occurred. Please try again later."}
    )

# Automatically create tables and seed DB on server startup
@app.on_event("startup")
def startup_populate():
    logger.info("Initializing database schema...")
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema initialized.")
        # Seed DB
        seed_db()
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")

# Include Routers
app.include_router(auth.router)
app.include_router(cats.router)
app.include_router(matching.router)
app.include_router(behaviour.router)
app.include_router(adoption.router)
app.include_router(users.router)
app.include_router(ai_chat.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Purrfect Match AI Backend API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
