import csv
import io
import json

from fastapi import APIRouter, Depends, Response
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.budget import Budget
from app.models.category import Category
from app.models.goal import FinancialGoal
from app.models.merchant_rule import MerchantCategoryRule
from app.models.refresh_token import RefreshToken
from app.models.subscription import Subscription
from app.models.transaction import Transaction
from app.models.user import User

router = APIRouter(prefix="/account", tags=["account"])


@router.delete("/me", status_code=204)
def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_id = current_user.id
    db.execute(delete(Transaction).where(Transaction.user_id == user_id))
    db.execute(delete(MerchantCategoryRule).where(MerchantCategoryRule.user_id == user_id))
    db.execute(delete(Budget).where(Budget.user_id == user_id))
    db.execute(delete(FinancialGoal).where(FinancialGoal.user_id == user_id))
    db.execute(delete(Subscription).where(Subscription.user_id == user_id))
    db.execute(delete(Category).where(Category.user_id == user_id))
    db.execute(delete(RefreshToken).where(RefreshToken.user_id == user_id))
    db.delete(current_user)
    db.commit()


@router.get("/export/json")
def export_json(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transactions = db.scalars(
        select(Transaction).where(Transaction.user_id == current_user.id)
    ).all()
    goals = db.scalars(select(FinancialGoal).where(FinancialGoal.user_id == current_user.id)).all()
    payload = {
        "user_email": current_user.email,
        "transactions": [
            {
                "amount": str(t.amount),
                "merchant": t.merchant,
                "type": t.transaction_type.value,
                "date": t.transaction_date.isoformat(),
            }
            for t in transactions
        ],
        "goals": [
            {"name": g.name, "target": str(g.target_amount), "current": str(g.current_amount)}
            for g in goals
        ],
    }
    return Response(
        content=json.dumps(payload, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=moneyflow-export.json"},
    )


@router.get("/export/csv")
def export_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transactions = db.scalars(
        select(Transaction).where(Transaction.user_id == current_user.id)
    ).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["date", "merchant", "amount", "type", "currency"])
    for t in transactions:
        writer.writerow([
            t.transaction_date.isoformat(),
            t.merchant or "",
            str(t.amount),
            t.transaction_type.value,
            t.currency,
        ])
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=moneyflow-transactions.csv"},
    )
