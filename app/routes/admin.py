"""
Admin Routes - API endpoints for admin operations
"""
from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import Response, FileResponse
from pydantic import BaseModel
from typing import Optional
import os
import time
from pathlib import Path

from app.services import category_service, menu_service
from app.config import UPLOAD_DIR, MAX_UPLOAD_SIZE, ALLOWED_IMAGE_TYPES

router = APIRouter(prefix="/api", tags=["admin"])


# Pydantic Models
class Category(BaseModel):
    name: str
    description: Optional[str] = ""
    order: Optional[int] = 0
    active: Optional[bool] = True


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None
    active: Optional[bool] = None


class Menu(BaseModel):
    title: str
    categoryId: str
    description: str
    price: float
    promotionPrice: Optional[float] = None
    currency: Optional[str] = "KHR"
    image: Optional[str] = "static/images/default.jpg"
    available: Optional[bool] = True
    featured: Optional[bool] = False


class MenuUpdate(BaseModel):
    title: Optional[str] = None
    categoryId: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    promotionPrice: Optional[float] = None
    currency: Optional[str] = None
    image: Optional[str] = None
    available: Optional[bool] = None
    featured: Optional[bool] = None


# Image Routes
@router.get("/images/{filename}")
@router.get("/assets/images/{filename}")
@router.get("/static/images/{filename}")
@router.get("/static/uploads/{filename}")
async def get_image(filename: str):
    """Serve image files with fallback to placeholder"""
    # Try multiple paths
    paths = [
        f"static/uploads/{filename}",
        f"static/images/{filename}",
        f"assets/images/{filename}"
    ]
    
    for path in paths:
        if os.path.exists(path):
            return FileResponse(path)
    
    # Return SVG placeholder if image not found
    svg_placeholder = '''<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#e0e0e0"/>
        <text x="50%" y="50%" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#999999">No Image Available</text>
    </svg>'''
    return Response(content=svg_placeholder, media_type="image/svg+xml")


# Category Endpoints
@router.get("/categories")
async def get_categories():
    """Get all categories with menu counts"""
    try:
        categories = category_service.read_categories()
        menu_counts = menu_service.get_menu_counts()
        
        # Add menu count to each category
        for category in categories:
            category["menuCount"] = menu_counts.get(category["id"], 0)
        
        return {"success": True, "categories": categories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read categories: {str(e)}")


@router.post("/categories")
async def create_category(category: Category):
    """Create a new category"""
    try:
        new_category = category_service.create_category(
            name=category.name,
            description=category.description,
            order=category.order,
            active=category.active
        )
        return {"success": True, "category": new_category}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create category: {str(e)}")


@router.put("/categories/{category_id}")
async def update_category(category_id: str, category: CategoryUpdate):
    """Update an existing category"""
    try:
        updated_category = category_service.update_category(
            category_id,
            name=category.name,
            description=category.description,
            order=category.order,
            active=category.active
        )
        
        if not updated_category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        return {"success": True, "category": updated_category}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update category: {str(e)}")


@router.delete("/categories/{category_id}")
async def delete_category(category_id: str):
    """Delete a category"""
    try:
        success = category_service.delete_category(category_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Category not found")
        
        return {"success": True, "message": "Category deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete category: {str(e)}")


# Menu Endpoints
@router.get("/menus")
async def get_menus():
    """Get all menus"""
    try:
        menus = menu_service.read_menus()
        categories = category_service.read_categories()
        return {"success": True, "menus": menus, "categories": categories}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read menus: {str(e)}")


@router.post("/menus")
async def create_menu(menu: Menu):
    """Create a new menu item"""
    try:
        new_menu = menu_service.create_menu(
            title=menu.title,
            category_id=menu.categoryId,
            description=menu.description,
            price=menu.price,
            promotion_price=menu.promotionPrice,
            currency=menu.currency,
            image=menu.image,
            available=menu.available,
            featured=menu.featured
        )
        return {"success": True, "menu": new_menu}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create menu: {str(e)}")


@router.put("/menus/{menu_id}")
async def update_menu(menu_id: str, menu: MenuUpdate):
    """Update an existing menu item"""
    try:
        updated_menu = menu_service.update_menu(
            menu_id,
            title=menu.title,
            categoryId=menu.categoryId,
            description=menu.description,
            price=menu.price,
            promotionPrice=menu.promotionPrice,
            currency=menu.currency,
            image=menu.image,
            available=menu.available,
            featured=menu.featured
        )
        
        if not updated_menu:
            raise HTTPException(status_code=404, detail="Menu not found")
        
        return {"success": True, "menu": updated_menu}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update menu: {str(e)}")


@router.delete("/menus/{menu_id}")
async def delete_menu(menu_id: str):
    """Delete a menu item"""
    try:
        success = menu_service.delete_menu(menu_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Menu not found")
        
        return {"success": True, "message": "Menu deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete menu: {str(e)}")


# Upload Endpoint
@router.post("/upload")
async def upload_image(image: UploadFile = File(...)):
    """Upload an image file"""
    try:
        # Validate file type
        if image.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Only JPG, PNG, GIF, and WebP are allowed"
            )
        
        # Validate file size
        contents = await image.read()
        if len(contents) > MAX_UPLOAD_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")
        
        # Generate unique filename
        extension = Path(image.filename).suffix
        filename = f"{int(time.time() * 1000)}_{os.urandom(3).hex()}{extension}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        
        # Save file
        with open(filepath, "wb") as f:
            f.write(contents)
        
        return {"success": True, "imagePath": f"static/uploads/{filename}"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
