# Quick Start Guide - Kuy Eng Restaurant

## 🚀 Fastest Way to Run

### Using Python FastAPI

1. Open PowerShell or Command Prompt
2. Navigate to project folder:
   ```powershell
   cd e:\personal\kuy_eng_restaurant
   ```

3. Install dependencies (first time only):
   ```powershell
   pip install -r requirements.txt
   ```

4. Start the server:
   ```powershell
   python main.py
   ```

5. Open your browser and visit:
   - **Admin Panel**: http://localhost:8000/admin/admin.html
   - **Public Menu**: http://localhost:8000/
   - **API Docs**: http://localhost:8000/docs

## 📋 What You Get

### Admin Features
- **Category Management** (`/admin/categories.html`)
  - Add, edit, delete categories
  - Set display order
  - Enable/disable categories
  - See menu item count per category

- **Menu Management** (`/admin/menus.html`)
  - Add menu items with images
  - Set regular and promotional prices
  - Mark items as featured or unavailable
  - Upload images (max 5MB)
  - Filter by category

### Public Features
- **Menu Display** (`/index.html`)
  - Browse all menu items
  - Filter by category
  - Search by name/description
  - See promotional pricing
  - Mobile-responsive design

## 📁 Data Storage

All data is stored in JSON files:
- `data.json` - Categories
- `menus.json` - Menu items
- `assets/images/` - Uploaded images

## 🔧 Python FastAPI Features

- `main.py` - FastAPI application with all endpoints
- **Auto-generated API docs** at `/docs` and `/redoc`
- **Type validation** with Pydantic
- **Async support** for better performance
- **CORS enabled** for frontend integration

## ✅ Installation Required

**First time setup:**
```powershell
pip install -r requirements.txt
```

**Then just run:**
```powershell
python main.py
```

- No database setup
- No Apache/Nginx
- Pure Python + FastAPI

## 🎯 First Steps

1. **Install dependencies** (first time): `pip install -r requirements.txt`
2. **Start the server**: `python main.py`
3. **Open admin dashboard**: http://localhost:8000/admin/admin.html
4. **Add categories**: Click "Go to Categories"
5. **Add menu items**: Click "Go to Menu Items"
6. **View public menu**: Click "View Website"
7. **Check API docs**: http://localhost:8000/docs

## 🆘 Common Issues

**Port already in use?**
```powershell
uvicorn main:app --port 8001
```
(Then use port 8001 instead of 8000)

**Python not found?**
- Install Python from https://www.python.org/downloads/
- Make sure to check "Add Python to PATH" during installation

**Dependencies not installing?**
```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

**Images not uploading?**
- Check `assets/images/` folder exists
- Ensure Python has write permissions

## 📞 Need Help?

Check the full README.md for detailed documentation and troubleshooting.

---
**Ready to start? Run:**
```powershell
pip install -r requirements.txt
python main.py
```
