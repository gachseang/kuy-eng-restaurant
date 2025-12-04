"""
Kuy Eng Restaurant Application Package
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import ALLOWED_ORIGINS

def create_app():
    """Application factory"""
    app = FastAPI(title="Kuy Eng Restaurant API")
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS if ALLOWED_ORIGINS != ["*"] else ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Mount static files
    app.mount("/static", StaticFiles(directory="static"), name="static")
    app.mount("/assets", StaticFiles(directory="static"), name="assets")
    app.mount("/admin", StaticFiles(directory="templates/admin", html=True), name="admin")
    
    # Register routes
    from app.routes import frontend, admin
    app.include_router(frontend.router)
    app.include_router(admin.router)
    
    return app
