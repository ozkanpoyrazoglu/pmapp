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

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend development
        "http://localhost",       # Frontend production
        "http://127.0.0.1:3000",
        "http://127.0.0.1",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_router, prefix="/api/auth", tags=["authentication"])
app.include_router(projects_router, prefix="/api/projects", tags=["projects"])

@app.get("/")
async def root():
    return {"message": "Project Management API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)