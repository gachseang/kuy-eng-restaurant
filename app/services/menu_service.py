"""
Menu Service - Business logic for menu operations
"""
import os
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.models.models import Menu
from app.database import SessionLocal


def get_db_session() -> Session:
    """Get database session"""
    return SessionLocal()


def read_menus() -> List[Dict]:
    """Read all menus from database"""
    db = get_db_session()
    try:
        menus = db.query(Menu).all()
        return [menu.to_dict() for menu in menus]
    finally:
        db.close()


def get_menu_by_id(menu_id: str) -> Optional[Dict]:
    """Get a single menu by ID"""
    db = get_db_session()
    try:
        menu = db.query(Menu).filter(Menu.id == int(menu_id)).first()
        return menu.to_dict() if menu else None
    finally:
        db.close()


def count_menus_by_category(category_id: str) -> int:
    """Count menus in a specific category"""
    db = get_db_session()
    try:
        count = db.query(Menu).filter(Menu.category_id == int(category_id)).count()
        return count
    finally:
        db.close()


def get_menu_counts() -> Dict[str, int]:
    """Get menu count for each category"""
    db = get_db_session()
    try:
        menus = db.query(Menu).all()
        counts = {}
        for menu in menus:
            cat_id = str(menu.category_id)
            counts[cat_id] = counts.get(cat_id, 0) + 1
        return counts
    finally:
        db.close()


def create_menu(title: str, category_id: str, description: str, min_price: float,
                max_price: Optional[float] = None, promotion_price: Optional[float] = None, 
                currency: str = "KHR", image: str = "static/images/default.jpg", 
                available: bool = True, featured: bool = False) -> Dict:
    """Create a new menu item"""
    db = get_db_session()
    try:
        new_menu = Menu(
            category_id=int(category_id),
            title=title,
            description=description,
            min_price=min_price,
            max_price=max_price,
            promotion_price=promotion_price,
            currency=currency,
            image=image,
            available=available,
            featured=featured
        )
        db.add(new_menu)
        db.commit()
        db.refresh(new_menu)
        return new_menu.to_dict()
    finally:
        db.close()


def update_menu(menu_id: str, **kwargs) -> Optional[Dict]:
    """Update an existing menu item"""
    db = get_db_session()
    try:
        menu = db.query(Menu).filter(Menu.id == int(menu_id)).first()
        
        if not menu:
            return None
        
        if "title" in kwargs and kwargs["title"] is not None:
            menu.title = kwargs["title"]
        if "categoryId" in kwargs and kwargs["categoryId"] is not None:
            menu.category_id = int(kwargs["categoryId"])
        if "description" in kwargs and kwargs["description"] is not None:
            menu.description = kwargs["description"]
        if "minPrice" in kwargs and kwargs["minPrice"] is not None:
            menu.min_price = kwargs["minPrice"]
        if "maxPrice" in kwargs:
            menu.max_price = kwargs["maxPrice"]
        if "promotionPrice" in kwargs:
            menu.promotion_price = kwargs["promotionPrice"]
        if "currency" in kwargs and kwargs["currency"] is not None:
            menu.currency = kwargs["currency"]
        if "image" in kwargs and kwargs["image"] is not None:
            menu.image = kwargs["image"]
        if "available" in kwargs and kwargs["available"] is not None:
            menu.available = kwargs["available"]
        if "featured" in kwargs and kwargs["featured"] is not None:
            menu.featured = kwargs["featured"]
        
        db.commit()
        db.refresh(menu)
        return menu.to_dict()
    finally:
        db.close()


def delete_menu(menu_id: str) -> bool:
    """Delete a menu item and its image"""
    db = get_db_session()
    try:
        menu = db.query(Menu).filter(Menu.id == int(menu_id)).first()
        
        if not menu:
            return False
        
        # Delete image if it exists
        image_path = menu.image
        if image_path and image_path not in ["static/images/default.jpg", "assets/images/default.jpg"]:
            if os.path.exists(image_path):
                try:
                    os.remove(image_path)
                except:
                    pass
        
        db.delete(menu)
        db.commit()
        return True
    finally:
        db.close()

    
    return False
