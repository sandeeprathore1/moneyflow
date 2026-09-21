from datetime import date
from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.budget import Budget, BudgetCategory
from app.models.enums import TransactionType
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.budget import BudgetCategoryResponse, BudgetCreate, BudgetResponse
from app.services.analytics_service import _month_bounds


def _spent_for_category(
    db: Session, user_id: UUID, category_id: UUID, month: date
) -> Decimal:
    start, end = _month_bounds(month)
    from sqlalchemy import func

    result = db.scalar(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == user_id,
            Transaction.category_id == category_id,
            Transaction.transaction_date >= start,
            Transaction.transaction_date <= end,
            Transaction.transaction_type.in_((TransactionType.EXPENSE, TransactionType.EMI)),
            Transaction.is_confirmed.is_(True),
        )
    )
    return Decimal(str(result or 0))


def get_budget(db: Session, user: User, month: date | None = None) -> BudgetResponse | None:
    month = month or date.today().replace(day=1)
    budget = db.scalar(select(Budget).where(Budget.user_id == user.id, Budget.month == month))
    if not budget:
        return None
    return _to_response(db, user, budget)


def create_or_update_budget(db: Session, user: User, data: BudgetCreate) -> BudgetResponse:
    month = data.month.replace(day=1)
    budget = db.scalar(select(Budget).where(Budget.user_id == user.id, Budget.month == month))

    if budget:
        budget.total_amount = data.total_amount
        budget.currency = data.currency
        for bc in list(budget.categories):
            db.delete(bc)
    else:
        budget = Budget(user_id=user.id, month=month, total_amount=data.total_amount, currency=data.currency)
        db.add(budget)
        db.flush()

    for cat_input in data.categories:
        db.add(
            BudgetCategory(
                budget_id=budget.id,
                category_id=cat_input.category_id,
                limit_amount=cat_input.limit_amount,
            )
        )

    db.commit()
    db.refresh(budget)
    return _to_response(db, user, budget)


def _to_response(db: Session, user: User, budget: Budget) -> BudgetResponse:
    start, end = _month_bounds(budget.month)
    from sqlalchemy import func

    total_spent = db.scalar(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.user_id == user.id,
            Transaction.transaction_date >= start,
            Transaction.transaction_date <= end,
            Transaction.transaction_type.in_((TransactionType.EXPENSE, TransactionType.EMI)),
            Transaction.is_confirmed.is_(True),
        )
    )
    spent = Decimal(str(total_spent or 0))

    cat_responses = []
    for bc in budget.categories:
        cat_spent = _spent_for_category(db, user.id, bc.category_id, budget.month)
        pct = float(cat_spent / bc.limit_amount * 100) if bc.limit_amount > 0 else 0
        cat_responses.append(
            BudgetCategoryResponse(
                category_id=bc.category_id,
                category_name=bc.category.name if bc.category else "Unknown",
                limit_amount=bc.limit_amount,
                spent_amount=cat_spent,
                percentage_used=pct,
            )
        )

    pct_total = float(spent / budget.total_amount * 100) if budget.total_amount > 0 else 0
    return BudgetResponse(
        id=budget.id,
        month=budget.month,
        total_amount=budget.total_amount,
        currency=budget.currency,
        spent_amount=spent,
        remaining_amount=budget.total_amount - spent,
        percentage_used=pct_total,
        categories=cat_responses,
        created_at=budget.created_at,
    )
