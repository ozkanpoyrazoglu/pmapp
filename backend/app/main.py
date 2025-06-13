# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import os

from app.database import connect_to_mongo, close_mongo_connection
from app.auth.routes import auth_router
from app.projects.routes import projects_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(
    title="Project Management API",
    description="Microsoft Project benzeri web tabanlı proje yönetimi uygulaması",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware - Updated for better development support
origins = [
    "http://localhost:3000",  # Frontend development
    "http://localhost",       # Frontend production
    "http://127.0.0.1:3000",
    "http://127.0.0.1",
    "https://localhost:3000", # HTTPS development
    "https://localhost",      # HTTPS production
]

# Get origins from environment if provided
env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    origins.extend(env_origins.split(","))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Routes
app.include_router(auth_router, prefix="/api/auth", tags=["authentication"])
app.include_router(projects_router, prefix="/api/projects", tags=["projects"])

@app.get("/")
async def root():
    return {"message": "Project Management API", "version": "1.0.0", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": "Not found", "path": str(request.url)}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)