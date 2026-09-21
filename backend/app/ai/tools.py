from datetime import date
from uuid import UUID

from sqlalchemy.orm import Session

from app.services.analytics_service import get_category_analytics, get_dashboard, get_monthly_analytics
from app.services.recurring_service import detect_subscriptions


def get_monthly_summary(db: Session, user_id: UUID) -> dict:
    d = get_dashboard(db, user_id)
    return {
        "income": str(d.total_income),
        "expenses": str(d.total_expenses),
        "saved": str(d.total_saved),
        "budget_used_pct": d.budget_percentage_used,
    }


def get_category_spending(db: Session, user_id: UUID) -> dict:
    c = get_category_analytics(db, user_id)
    return {
        "total": str(c.total),
        "categories": [
            {"name": cat.category_name, "amount": str(cat.amount), "pct": cat.percentage}
            for cat in c.categories[:10]
        ],
    }


def get_subscription_summary(db: Session, user_id: UUID) -> dict:
    subs = detect_subscriptions(db, user_id)
    monthly_total = sum(float(s["monthly_cost"]) for s in subs)
    return {"count": len(subs), "monthly_total": monthly_total, "items": subs[:10]}


def get_mom_comparison(db: Session, user_id: UUID) -> dict:
    m = get_monthly_analytics(db, user_id)
    return {
        "total_spent": str(m.total_spent),
        "total_income": str(m.total_income),
        "mom_change_pct": m.mom_change_percentage,
        "savings_rate": m.savings_rate,
    }


TOOL_REGISTRY = {
    "get_monthly_summary": get_monthly_summary,
    "get_category_spending": get_category_spending,
    "get_subscription_summary": get_subscription_summary,
    "get_mom_comparison": get_mom_comparison,
}
