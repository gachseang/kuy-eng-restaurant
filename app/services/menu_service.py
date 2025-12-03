"""
Menu Service - Business logic for menu operations
"""
import json
import time
import os
from typing import List, Dict, Optional
from app.config import MENUS_FILE


def read_menus() -> List[Dict]:
    """Read all menus from JSON file"""
    try:
        with open(MENUS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get("menus", [])
    except FileNotFoundError:
        write_menus([])
        return []


def write_menus(menus: List[Dict]) -> None:
    """Write menus to JSON file"""
    with open(MENUS_FILE, 'w', encoding='utf-8') as f:
        json.dump({"menus": menus}, f, indent=2, ensure_ascii=False)


def get_menu_by_id(menu_id: str) -> Optional[Dict]:
    """Get a single menu by ID"""
    menus = read_menus()
    return next((menu for menu in menus if menu["id"] == menu_id), None)


def count_menus_by_category(category_id: str) -> int:
    """Count menus in a specific category"""
    menus = read_menus()
    return sum(1 for menu in menus if menu.get("categoryId") == category_id)


def get_menu_counts() -> Dict[str, int]:
    """Get menu count for each category"""
    menus = read_menus()
    counts = {}
    for menu in menus:
        cat_id = menu.get("categoryId", "")
        counts[cat_id] = counts.get(cat_id, 0) + 1
    return counts


def create_menu(title: str, category_id: str, description: str, price: float,
                promotion_price: Optional[float] = None, currency: str = "KHR",
                image: str = "static/images/default.jpg", available: bool = True,
                featured: bool = False) -> Dict:
    """Create a new menu item"""
    menus = read_menus()
    
    new_menu = {
        "id": str(int(time.time() * 1000)),
        "categoryId": category_id,
        "title": title,
        "description": description,
        "price": price,
        "promotionPrice": promotion_price,
        "currency": currency,
        "image": image,
        "available": available,
        "featured": featured
    }
    
    menus.append(new_menu)
    write_menus(menus)
    
    return new_menu


def update_menu(menu_id: str, **kwargs) -> Optional[Dict]:
    """Update an existing menu item"""
    menus = read_menus()
    
    for menu in menus:
        if menu["id"] == menu_id:
            if "title" in kwargs and kwargs["title"] is not None:
                menu["title"] = kwargs["title"]
            if "categoryId" in kwargs and kwargs["categoryId"] is not None:
                menu["categoryId"] = kwargs["categoryId"]
            if "description" in kwargs and kwargs["description"] is not None:
                menu["description"] = kwargs["description"]
            if "price" in kwargs and kwargs["price"] is not None:
                menu["price"] = kwargs["price"]
            if "promotionPrice" in kwargs and kwargs["promotionPrice"] is not None:
                menu["promotionPrice"] = kwargs["promotionPrice"]
            if "currency" in kwargs and kwargs["currency"] is not None:
                menu["currency"] = kwargs["currency"]
            if "image" in kwargs and kwargs["image"] is not None:
                menu["image"] = kwargs["image"]
            if "available" in kwargs and kwargs["available"] is not None:
                menu["available"] = kwargs["available"]
            if "featured" in kwargs and kwargs["featured"] is not None:
                menu["featured"] = kwargs["featured"]
            
            write_menus(menus)
            return menu
    
    return None


def delete_menu(menu_id: str) -> bool:
    """Delete a menu item and its image"""
    menus = read_menus()
    
    # Find and delete image
    for menu in menus:
        if menu["id"] == menu_id:
            image_path = menu.get("image", "")
            if image_path and image_path not in ["static/images/default.jpg", "assets/images/default.jpg"]:
                if os.path.exists(image_path):
                    try:
                        os.remove(image_path)
                    except:
                        pass
            break
    
    original_length = len(menus)
    menus = [m for m in menus if m["id"] != menu_id]
    
    if len(menus) < original_length:
        write_menus(menus)
        return True
    
    return False
