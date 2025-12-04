# 🍽️ Kuy Eng Restaurant - Menu Management System

A fully functional Restaurant Menu Management Web Application with separate pages for category and menu management.

## ✨ Features

### Category Management
- ✅ Add, update, delete, and list categories
- ✅ Set display order for categories
- ✅ Enable/disable categories
- ✅ Category descriptions
- ✅ Search functionality

### Menu Item Management
- ✅ Add new menu items with image upload
- ✅ Update existing menu items
- ✅ Delete menu items
- ✅ List all menu items with card layout
- ✅ Filter by category
- ✅ Search by name or description
- ✅ Regular and promotion pricing
- ✅ Featured items highlighting
- ✅ Availability toggle

### Frontend Display
- ✅ Clean, modern, mobile-responsive UI
- ✅ Category-based menu navigation
- ✅ Search and filter functionality
- ✅ Promotion badges
- ✅ Responsive card layout

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript, jQuery
- **Backend**: Python FastAPI
- **Storage**: JSON file-based (no database required)
- **Image Upload**: FastAPI file upload handling
- **CORS**: Enabled for cross-origin requests

## 📁 Project Structure

```
kuy_eng_restaurant/
├── app/                         # Python application module
│   ├── __init__.py             # App factory
│   ├── config.py               # Configuration
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── frontend.py         # Frontend routes
│   │   └── admin.py            # Admin API routes
│   └── services/
│       ├── __init__.py
│       ├── category_service.py # Category business logic
│       └── menu_service.py     # Menu business logic
├── data/                       # JSON data storage
│   ├── categories.json         # Categories data
│   └── menus.json             # Menu items data
├── static/                    # Static assets
│   ├── css/
│   │   ├── style.css         # Main styles
│   │   └── admin.css         # Admin panel styles
│   ├── js/
│   │   ├── admin/
│   │   │   ├── categories.js # Category management
│   │   │   └── menus.js      # Menu management
│   │   └── frontend/
│   │       └── menu.js       # Public menu display
│   ├── images/               # Static images
│   └── uploads/              # Uploaded menu images
├── templates/                # HTML templates
│   ├── admin/
│   │   ├── admin.html       # Admin dashboard
│   │   ├── categories.html  # Category management
│   │   └── menus.html       # Menu management
│   └── frontend/
│       └── index.html       # Public menu page
├── main.py                  # Application entry point
├── .gitignore              # Git ignore rules
├── README.md               # This file
└── requirements.txt        # Python dependencies
```

## 🚀 Getting Started

### Prerequisites

- **Python 3.8 or higher**
- **pip** (Python package installer)
- Modern web browser

### Installation

1. **Navigate to the project directory**:
   ```bash
   cd e:\personal\kuy_eng_restaurant
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the server**:
   ```bash
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Access the application**:
   - Frontend (Public Menu): http://localhost:8000/
   - Admin Dashboard: http://localhost:8000/admin/admin.html
   - Category Management: http://localhost:8000/admin/categories.html
   - Menu Management: http://localhost:8000/admin/menus.html
   - API Documentation: http://localhost:8000/docs (Swagger UI)
   - Alternative API Docs: http://localhost:8000/redoc

## 📝 Usage Guide

### Admin Dashboard

1. **Access Admin Panel**: Open `http://localhost:3000/admin/admin.html`
2. **Three main sections**:
   - Manage Categories
   - Manage Menu Items
   - View Website

### Category Management

1. **Navigate to Categories**: Click "Go to Categories" from dashboard or access `categories.html`
2. **Add Category**:
   - Fill in category name (required)
   - Add description (optional)
   - Set display order (0 = first)
   - Toggle active status
   - Click "Add Category"
3. **Edit Category**: Click "Edit" button on any category in the list
4. **Delete Category**: Click "Delete" button and confirm
5. **Search**: Use the search box to filter categories

### Menu Item Management

1. **Navigate to Menus**: Click "Go to Menu Items" from dashboard or access `menus.html`
2. **Add Menu Item**:
   - Enter title (required)
   - Select category (required)
   - Add description (required)
   - Set regular price (required)
   - Set promotion price (optional)
   - Upload image (optional, max 2MB)
   - Toggle available status
   - Toggle featured status
   - Click "Add Menu Item"
3. **Edit Menu**: Click "Edit" button on any menu card
4. **Delete Menu**: Click "Delete" button and confirm
5. **Filter**: Use category dropdown to filter items
6. **Search**: Use search box to find items by name/description

### Public Menu Display

- Visitors can view the menu at `http://localhost:3000`
- Filter by category
- Search menu items
- See promotions and pricing
- Mobile-responsive design

## 🔌 API Endpoints

All API endpoints return JSON responses with `{"success": true/false, ...}` format.

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Menu Items

- `GET /api/menus` - Get all menu items
- `POST /api/menus` - Create new menu
- `PUT /api/menus/{id}` - Update menu
- `DELETE /api/menus/{id}` - Delete menu

### File Upload

- `POST /api/upload` - Upload image file (multipart/form-data)

### Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📦 Dependencies

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
pydantic==2.5.0
```

Install with: `pip install -r requirements.txt`

## 🎨 Key Features Implemented

### Separate Admin Pages
- **Dashboard**: Landing page with navigation cards
- **Categories Page**: Dedicated category management interface
- **Menus Page**: Dedicated menu item management interface
- **Unified Navigation**: Consistent navigation across all admin pages

### Enhanced UI/UX
- Modern gradient navigation bar
- Card-based layout for menu items
- Table layout for categories
- Modal confirmations for deletions
- Real-time search and filtering
- Image preview on upload
- Responsive design for mobile devices

### Data Management
- File-based storage (JSON)
- Image upload handling
- Data validation
- Error handling
- CRUD operations for both categories and menus

## 🔧 Configuration

### Changing Port
Edit `main.py` or run with custom port:
```bash
uvicorn main:app --port YOUR_PORT
```

### Upload Directory
Images are stored in `/static/uploads/` directory. This is configured in `app/config.py`:
```python
UPLOAD_DIR = "static/uploads"
```

### Max File Size
Current limit is 5MB. To change, edit in `main.py`:
```python
max_size = 5 * 1024 * 1024  # Change size here
```

### Allowed Image Types
Edit in `main.py`:
```python
allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
```

## 🐛 Troubleshooting

### Server won't start
- Ensure Python is installed: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check if port 8000 is available
- Make sure you're in the project directory

### Images not uploading
- Check if `static/uploads/` directory exists and is writable
- Verify file size is under 5MB
- Check file format (jpg, png, gif, webp)
- Check FastAPI logs for errors

### Categories not loading
- Ensure `data.json` file is writable
- Check Python console for errors
- Open browser console (F12) for JavaScript errors
- Visit http://localhost:8000/docs to test API directly

### Menus not displaying
- Ensure `menus.json` file is writable
- Verify category IDs match between files
- Check browser console for errors
- Test API at http://localhost:8000/docs

### Python Errors
- Check the terminal where FastAPI is running for error details
- Use `--reload` flag for auto-reload during development:
  ```bash
  uvicorn main:app --reload
  ```

## 📱 Mobile Support

The application is fully responsive and works on:
- Desktop browsers (Chrome, Firefox, Edge, Safari)
- Tablets (iPad, Android tablets)
- Mobile phones (iOS, Android)

## 🔐 Security Notes

- This is a development application
- For production use, add authentication
- Implement input validation on server side
- Use HTTPS in production
- Add rate limiting
- Sanitize user inputs

## 🚀 Future Enhancements

- User authentication and authorization
- Database integration (MongoDB, PostgreSQL)
- Image optimization and compression
- Bulk operations (import/export)
- Order management system
- Customer reviews and ratings
- Multi-language support
- Analytics dashboard

## 📄 License

This project is open source and available for educational purposes.

## 👨‍💻 Support

For issues or questions, please check the troubleshooting section above.

---

**Made with ❤️ for Kuy Eng Restaurant**
