"""
Category Service - Business logic for category operations
"""
import json
import time
from typing import List, Dict, Optional
from app.config import DATA_FILE


def read_categories() -> List[Dict]:
    """Read all categories from JSON file"""
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get("categories", [])
    except FileNotFoundError:
        # Return default categories if file doesn't exist
        default_categories = [
            {"id": "1", "name": "Appetizer", "description": "Start your meal right", "order": 0, "active": True},
            {"id": "2", "name": "Main Course", "description": "Our signature dishes", "order": 1, "active": True},
            {"id": "3", "name": "Dessert", "description": "Sweet endings", "order": 2, "active": True},
            {"id": "4", "name": "Beverages", "description": "Drinks and more", "order": 3, "active": True}
        ]
        write_categories(default_categories)
        return default_categories


def write_categories(categories: List[Dict]) -> None:
    """Write categories to JSON file"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump({"categories": categories}, f, indent=2, ensure_ascii=False)


def get_category_by_id(category_id: str) -> Optional[Dict]:
    """Get a single category by ID"""
    categories = read_categories()
    return next((cat for cat in categories if cat["id"] == category_id), None)


def create_category(name: str, description: str = "", order: int = 0, active: bool = True) -> Dict:
    """Create a new category"""
    categories = read_categories()
    
    new_category = {
        "id": str(int(time.time() * 1000)),
        "name": name,
        "description": description,
        "order": order,
        "active": active
    }
    
    categories.append(new_category)
    write_categories(categories)
    
    return new_category


def update_category(category_id: str, **kwargs) -> Optional[Dict]:
    """Update an existing category"""
    categories = read_categories()
    
    for cat in categories:
        if cat["id"] == category_id:
            if "name" in kwargs and kwargs["name"] is not None:
                cat["name"] = kwargs["name"]
            if "description" in kwargs and kwargs["description"] is not None:
                cat["description"] = kwargs["description"]
            if "order" in kwargs and kwargs["order"] is not None:
                cat["order"] = kwargs["order"]
            if "active" in kwargs and kwargs["active"] is not None:
                cat["active"] = kwargs["active"]
            
            write_categories(categories)
            return cat
    
    return None


def delete_category(category_id: str) -> bool:
    """Delete a category"""
    from app.services.menu_service import count_menus_by_category
    
    # Check if any menus use this category
    menu_count = count_menus_by_category(category_id)
    if menu_count > 0:
        raise ValueError(f"Cannot delete category. {menu_count} menu item(s) are using this category.")
    
    categories = read_categories()
    original_length = len(categories)
    categories = [c for c in categories if c["id"] != category_id]
    
    if len(categories) < original_length:
        write_categories(categories)
        return True
    
    return False
