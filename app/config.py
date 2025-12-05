"""
Application Configuration
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file (for local development)
load_dotenv()

# Environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Database settings
DB_HOST = os.getenv("DB_HOST", "mysql-205386-0.cloudclusters.net")
DB_PORT = os.getenv("DB_PORT", "10048")
DB_USER = os.getenv("DB_USER", "admin")
DB_PASSWORD = os.getenv("DB_PASSWORD", "pNuMHHoG")
DB_NAME = os.getenv("DB_NAME", "kuyeng_restaurant")

# Data files (kept for backward compatibility during migration)
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
