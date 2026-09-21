from decimal import Decimal

from pydantic import BaseModel, Field


class OnboardingRequest(BaseModel):
    display_name: str | None = None
    monthly_income: Decimal = Field(gt=0)
    salary_day: int = Field(ge=1, le=31)
    currency: str = Field(default="INR", max_length=3)
    total_budget: Decimal = Field(gt=0)
    category_limits: list[dict] = Field(default_factory=list)


class ProfileUpdateRequest(BaseModel):
    display_name: str | None = None
    monthly_income: Decimal | None = Field(default=None, gt=0)
    salary_day: int | None = Field(default=None, ge=1, le=31)
    currency: str | None = Field(default=None, max_length=3)
