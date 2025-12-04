"""
Application Configuration
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file (for local development)
load_dotenv()

# Environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Data files
DATA_DIR = os.getenv("DATA_DIR", "data")
DATA_FILE = os.path.join(DATA_DIR, "categories.json")
MENUS_FILE = os.path.join(DATA_DIR, "menus.json")

# Upload settings
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "static/uploads")
MAX_UPLOAD_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", 5 * 1024 * 1024))  # 5MB default
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]

# CORS settings
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

# Ensure directories exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs("static/images", exist_ok=True)
