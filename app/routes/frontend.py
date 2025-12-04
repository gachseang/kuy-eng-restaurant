"""
Frontend Routes - Public facing pages
"""
from fastapi import APIRouter
from fastapi.responses import FileResponse

router = APIRouter(tags=["frontend"])


@router.get("/healthz")
async def health_check():
    """Health check endpoint for Render.com"""
    return {"status": "healthy", "service": "kuy-eng-restaurant"}


@router.get("/")
async def read_root():
    """Serve the main menu page"""
    return FileResponse("templates/frontend/index.html")


@router.get("/index.html")
async def read_index():
    """Serve the main menu page"""
    return FileResponse("templates/frontend/index.html")
