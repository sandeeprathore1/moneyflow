from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.subscription import BillingCycle, Subscription, SubscriptionStatus
from app.models.user import User
from app.services.recurring_service import detect_subscriptions, sync_subscriptions

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


class SubscriptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    amount: Decimal
    billing_cycle: BillingCycle
    status: SubscriptionStatus
    monthly_cost: Decimal
    annual_cost: Decimal


def _enrich(sub: Subscription) -> SubscriptionResponse:
    if sub.billing_cycle == BillingCycle.MONTHLY:
        monthly = sub.amount
        annual = sub.amount * 12
    elif sub.billing_cycle == BillingCycle.WEEKLY:
        monthly = sub.amount * 52 / 12
        annual = sub.amount * 52
    else:
        monthly = sub.amount / 12
        annual = sub.amount
    return SubscriptionResponse(
        id=sub.id,
        name=sub.name,
        amount=sub.amount,
        billing_cycle=sub.billing_cycle,
        status=sub.status,
        monthly_cost=monthly,
        annual_cost=annual,
    )


@router.get("", response_model=list[SubscriptionResponse])
def list_subscriptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    subs = db.scalars(
        select(Subscription).where(Subscription.user_id == current_user.id)
    ).all()
    return [_enrich(s) for s in subs]


@router.post("/detect", response_model=list[dict])
def detect(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return detect_subscriptions(db, current_user.id)


@router.post("/sync", response_model=list[SubscriptionResponse])
def sync(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    subs = sync_subscriptions(db, current_user.id)
    return [_enrich(s) for s in subs]


@router.patch("/{sub_id}/status", response_model=SubscriptionResponse)
def update_status(
    sub_id: UUID,
    status: SubscriptionStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = db.scalar(
        select(Subscription).where(Subscription.id == sub_id, Subscription.user_id == current_user.id)
    )
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
    sub.status = status
    db.commit()
    db.refresh(sub)
    return _enrich(sub)
