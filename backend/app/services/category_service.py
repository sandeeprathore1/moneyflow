import re
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryUpdate


def _slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def list_categories(db: Session, user: User) -> list[Category]:
    return list(
        db.scalars(
            select(Category).where(
                or_(Category.is_system.is_(True), Category.user_id == user.id)
            ).order_by(Category.name)
        ).all()
    )


def create_category(db: Session, user: User, data: CategoryCreate) -> Category:
    cat = Category(
        user_id=user.id,
        name=data.name,
        slug=_slugify(data.name),
        parent_id=data.parent_id,
        icon=data.icon,
        color=data.color,
        is_system=False,
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


def update_category(db: Session, user: User, category_id: UUID, data: CategoryUpdate) -> Category:
    cat = db.scalar(
        select(Category).where(Category.id == category_id, Category.user_id == user.id)
    )
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    if cat.is_system:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot modify system category")

    for key, value in data.model_dump(exclude_unset=True).items():
        if key == "name" and value:
            cat.slug = _slugify(value)
        setattr(cat, key, value)
    db.commit()
    db.refresh(cat)
    return cat


def delete_category(db: Session, user: User, category_id: UUID) -> None:
    cat = db.scalar(
        select(Category).where(Category.id == category_id, Category.user_id == user.id)
    )
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    if cat.is_system:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete system category")
    db.delete(cat)
    db.commit()
