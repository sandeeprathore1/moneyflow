from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.category import Category

DEFAULT_CATEGORIES = [
    ("Food", "food", "restaurant", "#2563eb"),
    ("Groceries", "groceries", "shopping_cart", "#16a34a"),
    ("Transport", "transport", "directions_car", "#38bdf8"),
    ("Shopping", "shopping", "shopping_bag", "#712ae2"),
    ("Bills", "bills", "receipt", "#943700"),
    ("Rent", "rent", "home", "#004ac6"),
    ("EMI", "emi", "account_balance", "#ef4444"),
    ("Health", "health", "medical_services", "#22c55e"),
    ("Fitness", "fitness", "fitness_center", "#16a34a"),
    ("Entertainment", "entertainment", "movie", "#8a4cfc"),
    ("Education", "education", "school", "#004ac6"),
    ("Travel", "travel", "flight", "#38bdf8"),
    ("Insurance", "insurance", "shield", "#737686"),
    ("Investment", "investment", "trending_up", "#16a34a"),
    ("Personal", "personal", "person", "#434655"),
    ("Other", "other", "more_horiz", "#737686"),
]


def seed_system_categories(db: Session) -> None:
    existing = db.scalar(select(Category).where(Category.is_system.is_(True)).limit(1))
    if existing:
        return

    for name, slug, icon, color in DEFAULT_CATEGORIES:
        db.add(
            Category(
                user_id=None,
                name=name,
                slug=slug,
                icon=icon,
                color=color,
                is_system=True,
            )
        )
    db.commit()
