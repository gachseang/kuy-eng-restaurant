"""
Category Service - Business logic for category operations
"""
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.models.models import Category
from app.database import SessionLocal


def get_db_session() -> Session:
    """Get database session"""
    return SessionLocal()


def read_categories() -> List[Dict]:
    """Read all categories from database"""
    db = get_db_session()
    try:
        categories = db.query(Category).order_by(Category.order).all()
        return [cat.to_dict() for cat in categories]
    finally:
        db.close()


def get_category_by_id(category_id: str) -> Optional[Dict]:
    """Get a single category by ID"""
    db = get_db_session()
    try:
        category = db.query(Category).filter(Category.id == int(category_id)).first()
        return category.to_dict() if category else None
    finally:
        db.close()


def create_category(name: str, description: str = "", order: int = 0, active: bool = True) -> Dict:
    """Create a new category"""
    db = get_db_session()
    try:
        new_category = Category(
            name=name,
            description=description,
            order=order,
            active=active
        )
        db.add(new_category)
        db.commit()
        db.refresh(new_category)
        return new_category.to_dict()
    finally:
        db.close()


def update_category(category_id: str, **kwargs) -> Optional[Dict]:
    """Update an existing category"""
    db = get_db_session()
    try:
        category = db.query(Category).filter(Category.id == int(category_id)).first()
        
        if not category:
            return None
        
        if "name" in kwargs and kwargs["name"] is not None:
            category.name = kwargs["name"]
        if "description" in kwargs and kwargs["description"] is not None:
            category.description = kwargs["description"]
        if "order" in kwargs and kwargs["order"] is not None:
            category.order = kwargs["order"]
        if "active" in kwargs and kwargs["active"] is not None:
            category.active = kwargs["active"]
        
        db.commit()
        db.refresh(category)
        return category.to_dict()
    finally:
        db.close()


def delete_category(category_id: str) -> bool:
    """Delete a category"""
    from app.services.menu_service import count_menus_by_category
    
    # Check if any menus use this category
    menu_count = count_menus_by_category(category_id)
    if menu_count > 0:
        raise ValueError(f"Cannot delete category. {menu_count} menu item(s) are using this category.")
    
    db = get_db_session()
    try:
        category = db.query(Category).filter(Category.id == int(category_id)).first()
        
        if not category:
            return False
        
        db.delete(category)
        db.commit()
        return True
    finally:
        db.close()

