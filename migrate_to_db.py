"""
Database Migration Script
Imports existing JSON data into MySQL database
"""
import json
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import init_db, SessionLocal
from app.models.models import Category, Menu
from app.config import DATA_FILE, MENUS_FILE


def load_json_data():
    """Load data from JSON files"""
    categories = []
    menus = []
    
    # Load categories
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            categories = data.get("categories", [])
        print(f"✓ Loaded {len(categories)} categories from {DATA_FILE}")
    except FileNotFoundError:
        print(f"⚠ Categories file not found: {DATA_FILE}")
    
    # Load menus
    try:
        with open(MENUS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            menus = data.get("menus", [])
        print(f"✓ Loaded {len(menus)} menus from {MENUS_FILE}")
    except FileNotFoundError:
        print(f"⚠ Menus file not found: {MENUS_FILE}")
    
    return categories, menus


def migrate_categories(db, categories_data):
    """Migrate categories to database"""
    print("\n📋 Migrating categories...")
    
    # Create ID mapping from old string IDs to new integer IDs
    id_mapping = {}
    
    for cat_data in categories_data:
        old_id = cat_data.get("id")
        
        # Check if category already exists
        existing = db.query(Category).filter(Category.name == cat_data["name"]).first()
        if existing:
            print(f"  ⚠ Category '{cat_data['name']}' already exists, skipping...")
            id_mapping[old_id] = existing.id
            continue
        
        category = Category(
            name=cat_data["name"],
            description=cat_data.get("description", ""),
            order=cat_data.get("order", 0),
            active=cat_data.get("active", True)
        )
        db.add(category)
        db.flush()  # Flush to get the ID
        
        id_mapping[old_id] = category.id
        print(f"  ✓ Created category: {category.name} (ID: {old_id} → {category.id})")
    
    db.commit()
    print(f"✓ Migrated {len(categories_data)} categories")
    
    return id_mapping


def migrate_menus(db, menus_data, category_id_mapping):
    """Migrate menus to database"""
    print("\n🍽️  Migrating menus...")
    
    migrated_count = 0
    
    for menu_data in menus_data:
        old_category_id = menu_data.get("categoryId")
        new_category_id = category_id_mapping.get(old_category_id)
        
        if not new_category_id:
            print(f"  ⚠ Skipping menu '{menu_data.get('title')}' - category not found")
            continue
        
        # Check if menu already exists
        existing = db.query(Menu).filter(Menu.title == menu_data["title"]).first()
        if existing:
            print(f"  ⚠ Menu '{menu_data['title']}' already exists, skipping...")
            continue
        
        # Handle both old and new price field names
        min_price = menu_data.get("minPrice") or menu_data.get("price", 0)
        max_price = menu_data.get("maxPrice")
        promotion_price = menu_data.get("promotionPrice")
        
        menu = Menu(
            category_id=new_category_id,
            title=menu_data["title"],
            description=menu_data.get("description", ""),
            min_price=min_price,
            max_price=max_price,
            promotion_price=promotion_price,
            currency=menu_data.get("currency", "KHR"),
            image=menu_data.get("image", "static/images/default.jpg"),
            available=menu_data.get("available", True),
            featured=menu_data.get("featured", False)
        )
        db.add(menu)
        migrated_count += 1
        print(f"  ✓ Created menu: {menu.title}")
    
    db.commit()
    print(f"✓ Migrated {migrated_count} menus")


def main():
    """Main migration function"""
    print("=" * 60)
    print("🚀 Starting Database Migration")
    print("=" * 60)
    
    # Initialize database (create tables)
    print("\n📦 Creating database tables...")
    try:
        init_db()
        print("✓ Database tables created successfully")
    except Exception as e:
        print(f"✗ Error creating tables: {e}")
        return
    
    # Load JSON data
    print("\n📂 Loading data from JSON files...")
    categories_data, menus_data = load_json_data()
    
    if not categories_data and not menus_data:
        print("\n⚠ No data to migrate. Exiting...")
        return
    
    # Start migration
    db = SessionLocal()
    try:
        # Migrate categories first
        category_id_mapping = migrate_categories(db, categories_data)
        
        # Migrate menus
        migrate_menus(db, menus_data, category_id_mapping)
        
        # Show summary
        total_categories = db.query(Category).count()
        total_menus = db.query(Menu).count()
        
        print("\n" + "=" * 60)
        print("✅ Migration completed successfully!")
        print("=" * 60)
        print(f"📊 Database Summary:")
        print(f"   Categories: {total_categories}")
        print(f"   Menus: {total_menus}")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n✗ Migration failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
