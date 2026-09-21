from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.analytics import (
    CategoryAnalyticsResponse,
    DashboardResponse,
    MonthlyAnalyticsResponse,
)
from app.services.analytics_service import (
    get_category_analytics,
    get_dashboard,
    get_monthly_analytics,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard", response_model=DashboardResponse)
def dashboard(
    month: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_dashboard(db, current_user.id, month)


@router.get("/monthly", response_model=MonthlyAnalyticsResponse)
def monthly(
    month: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_monthly_analytics(db, current_user.id, month)


@router.get("/categories", response_model=CategoryAnalyticsResponse)
def categories(
    month: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_category_analytics(db, current_user.id, month)
