from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetResponse
from app.services.budget_service import create_or_update_budget, get_budget

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("", response_model=BudgetResponse)
def get_current_budget(
    month: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    budget = get_budget(db, current_user, month)
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
    return budget


@router.post("", response_model=BudgetResponse, status_code=201)
def post_budget(
    data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_or_update_budget(db, current_user, data)
