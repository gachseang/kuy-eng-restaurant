"""
Database Models
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Category(Base):
    """Category model"""
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    order = Column(Integer, default=0)
    active = Column(Boolean, default=True)

    # Relationship
    menus = relationship("Menu", back_populates="category", cascade="all, delete-orphan")

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description or "",
            "order": self.order,
            "active": self.active
        }


class Menu(Base):
    """Menu model"""
    __tablename__ = "menus"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=True)
    promotion_price = Column(Float, nullable=True)
    currency = Column(String(10), default="KHR")
    image = Column(String(500), default="static/images/default.jpg")
    available = Column(Boolean, default=True)
    featured = Column(Boolean, default=False)

    # Relationship
    category = relationship("Category", back_populates="menus")

    def to_dict(self):
        """Convert to dictionary"""
        return {
            "id": str(self.id),
            "categoryId": str(self.category_id),
            "title": self.title,
            "description": self.description or "",
            "minPrice": self.min_price,
            "maxPrice": self.max_price,
            "promotionPrice": self.promotion_price,
            "currency": self.currency,
            "image": self.image,
            "available": self.available,
            "featured": self.featured
        }
