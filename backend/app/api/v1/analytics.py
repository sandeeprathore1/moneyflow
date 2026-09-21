from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.analytics import (
    CashflowResponse,
    CategoryAnalyticsResponse,
    DashboardResponse,
    ExtendedMonthlyAnalyticsResponse,
    MonthlyAnalyticsResponse,
    TrendsResponse,
)
from app.services.analytics_service import (
    get_cashflow,
    get_category_analytics,
    get_dashboard,
    get_extended_monthly_analytics,
    get_monthly_analytics,
    get_trends,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard", response_model=DashboardResponse)
def dashboard(
    month: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_dashboard(db, current_user.id, month)


@router.get("/monthly", response_model=ExtendedMonthlyAnalyticsResponse)
def monthly(
    month: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_extended_monthly_analytics(db, current_user.id, month)


@router.get("/categories", response_model=CategoryAnalyticsResponse)
def categories(
    month: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_category_analytics(db, current_user.id, month)


@router.get("/trends", response_model=TrendsResponse)
def trends(
    date_from: date = Query(...),
    date_to: date = Query(...),
    granularity: str = Query(default="day", pattern="^(day|week|month)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_trends(db, current_user.id, date_from, date_to, granularity)


@router.get("/cashflow", response_model=CashflowResponse)
def cashflow(
    date_from: date = Query(...),
    date_to: date = Query(...),
    granularity: str = Query(default="week", pattern="^(day|week)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_cashflow(db, current_user.id, date_from, date_to, granularity)
