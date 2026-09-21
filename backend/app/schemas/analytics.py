from datetime import date
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class CategorySpendItem(BaseModel):
    category_id: UUID | None
    category_name: str
    amount: Decimal
    percentage: float


class RecentTransactionItem(BaseModel):
    id: UUID
    merchant: str | None
    amount: Decimal
    transaction_type: str
    transaction_date: str
    category_name: str | None


class DashboardResponse(BaseModel):
    month: date
    currency: str
    total_income: Decimal
    total_expenses: Decimal
    total_saved: Decimal
    budget_total: Decimal | None
    budget_spent: Decimal
    budget_remaining: Decimal | None
    budget_percentage_used: float | None
    top_categories: list[CategorySpendItem]
    recent_transactions: list[RecentTransactionItem]


class TrendPoint(BaseModel):
    label: str
    amount: Decimal


class MonthlyAnalyticsResponse(BaseModel):
    month: date
    total_spent: Decimal
    total_income: Decimal
    savings_rate: float
    mom_change_percentage: float | None
    trend: list[TrendPoint]


class CategoryAnalyticsResponse(BaseModel):
    month: date
    categories: list[CategorySpendItem]
    total: Decimal
