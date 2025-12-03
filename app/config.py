"""
Application Configuration
"""
import os

# Data files
DATA_DIR = "data"
DATA_FILE = os.path.join(DATA_DIR, "categories.json")
MENUS_FILE = os.path.join(DATA_DIR, "menus.json")

# Upload settings
UPLOAD_DIR = "static/uploads"
MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]

# Ensure directories exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs("static/images", exist_ok=True)
