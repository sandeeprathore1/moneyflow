from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class BudgetCategoryInput(BaseModel):
    category_id: UUID
    limit_amount: Decimal = Field(gt=0)


class BudgetCreate(BaseModel):
    month: date
    total_amount: Decimal = Field(gt=0)
    currency: str = Field(default="INR", max_length=3)
    categories: list[BudgetCategoryInput] = []


class BudgetCategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    category_id: UUID
    category_name: str
    limit_amount: Decimal
    spent_amount: Decimal
    percentage_used: float


class BudgetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    month: date
    total_amount: Decimal
    currency: str
    spent_amount: Decimal
    remaining_amount: Decimal
    percentage_used: float
    projected_month_end_spending: Decimal | None = None
    categories: list[BudgetCategoryResponse]
    created_at: datetime
