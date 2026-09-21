import re
from uuid import UUID

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.merchant_rule import MerchantCategoryRule

DEFAULT_RULES: dict[str, str] = {
    "swiggy": "food",
    "zomato": "food",
    "uber": "transport",
    "ola": "transport",
    "blinkit": "groceries",
    "zepto": "groceries",
    "amazon": "shopping",
    "flipkart": "shopping",
    "netflix": "entertainment",
    "spotify": "entertainment",
    "cult.fit": "fitness",
    "cultfit": "fitness",
}


class CategorySuggestion:
    def __init__(self, category_id: UUID | None, category_name: str, confidence: float, reason: str):
        self.category_id = category_id
        self.category_name = category_name
        self.confidence = confidence
        self.reason = reason


def suggest_category(db: Session, user_id: UUID, merchant: str) -> CategorySuggestion:
    normalized = merchant.lower().strip()

    user_rule = db.scalar(
        select(MerchantCategoryRule).where(
            MerchantCategoryRule.user_id == user_id,
            MerchantCategoryRule.merchant_pattern == normalized,
        )
    )
    if user_rule and user_rule.category:
        return CategorySuggestion(
            user_rule.category_id,
            user_rule.category.name,
            0.99,
            "User preference",
        )

    for pattern, slug in DEFAULT_RULES.items():
        if pattern in normalized:
            cat = db.scalar(
                select(Category).where(
                    Category.slug == slug,
                    or_(Category.is_system.is_(True), Category.user_id == user_id),
                )
            )
            if cat:
                return CategorySuggestion(cat.id, cat.name, 0.94, f"Known {slug} merchant")

    other = db.scalar(
        select(Category).where(
            Category.slug == "other",
            or_(Category.is_system.is_(True), Category.user_id == user_id),
        )
    )
    return CategorySuggestion(
        other.id if other else None,
        other.name if other else "Other",
        0.3,
        "No matching rule",
    )


def learn_merchant_category(
    db: Session, user_id: UUID, merchant: str, category_id: UUID
) -> None:
    normalized = re.sub(r"\s+", " ", merchant.lower().strip())
    existing = db.scalar(
        select(MerchantCategoryRule).where(
            MerchantCategoryRule.user_id == user_id,
            MerchantCategoryRule.merchant_pattern == normalized,
        )
    )
    if existing:
        existing.category_id = category_id
    else:
        db.add(
            MerchantCategoryRule(
                user_id=user_id,
                merchant_pattern=normalized,
                category_id=category_id,
            )
        )
    db.commit()
