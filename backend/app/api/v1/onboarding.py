from datetime import date
from decimal import Decimal

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.enums import IncomeFrequency
from app.models.income_source import IncomeSource
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetCategoryInput
from app.schemas.onboarding import OnboardingRequest, ProfileUpdateRequest
from app.schemas.user import UserResponse
from app.services.audit_service import log_action
from app.services.budget_service import create_or_update_budget

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.post("/complete", response_model=UserResponse)
def complete_onboarding(
    data: OnboardingRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile missing")

    if data.display_name:
        profile.display_name = data.display_name
    profile.monthly_income = data.monthly_income
    profile.salary_day = data.salary_day
    profile.currency = data.currency
    profile.onboarding_completed = True

    existing_primary = db.scalar(
        select(IncomeSource).where(
            IncomeSource.user_id == current_user.id,
            IncomeSource.is_primary.is_(True),
        )
    )

    if not existing_primary:
        db.add(
            IncomeSource(
                user_id=current_user.id,
                name="Salary",
                amount=data.monthly_income,
                frequency=IncomeFrequency.MONTHLY,
                is_primary=True,
            )
        )

    month = date.today().replace(day=1)
    categories = [
        BudgetCategoryInput(
            category_id=UUID(str(item["category_id"])),
            limit_amount=Decimal(str(item["limit_amount"])),
        )
        for item in data.category_limits
    ]
    create_or_update_budget(
        db,
        current_user,
        BudgetCreate(
            month=month,
            total_amount=data.total_budget,
            currency=data.currency,
            categories=categories,
        ),
    )

    log_action(
        db,
        action="onboarding_completed",
        resource_type="profile",
        user_id=current_user.id,
        resource_id=profile.id,
        ip_address=request.client.host if request.client else None,
    )
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.patch("/profile", response_model=UserResponse)
def update_profile(
    data: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile missing")
    for field in ("display_name", "monthly_income", "salary_day", "currency"):
        value = getattr(data, field)
        if value is not None:
            setattr(profile, field, value)
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)
