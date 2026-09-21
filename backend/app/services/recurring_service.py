from collections import defaultdict
from datetime import timedelta
from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import TransactionType
from app.models.subscription import BillingCycle, Subscription, SubscriptionStatus
from app.models.transaction import Transaction


def detect_subscriptions(db: Session, user_id: UUID, min_occurrences: int = 3) -> list[dict]:
    transactions = db.scalars(
        select(Transaction).where(
            Transaction.user_id == user_id,
            Transaction.transaction_type == TransactionType.EXPENSE,
            Transaction.is_confirmed.is_(True),
            Transaction.merchant.isnot(None),
        ).order_by(Transaction.transaction_date.desc())
    ).all()

    groups: dict[tuple[str, Decimal], list[Transaction]] = defaultdict(list)
    for tx in transactions:
        if tx.merchant and tx.amount:
            key = (tx.merchant.lower().strip(), tx.amount)
            groups[key].append(tx)

    detected = []
    for (merchant, amount), txs in groups.items():
        if len(txs) < min_occurrences:
            continue
        dates = sorted([t.transaction_date for t in txs])
        intervals = [(dates[i] - dates[i - 1]).days for i in range(1, len(dates))]
        if not intervals:
            continue
        avg_interval = sum(intervals) / len(intervals)
        if 25 <= avg_interval <= 35:
            cycle = BillingCycle.MONTHLY
            annual = amount * 12
        elif 6 <= avg_interval <= 8:
            cycle = BillingCycle.WEEKLY
            annual = amount * 52
        elif 350 <= avg_interval <= 380:
            cycle = BillingCycle.YEARLY
            annual = amount
        else:
            continue

        detected.append({
            "merchant": merchant.title(),
            "amount": amount,
            "billing_cycle": cycle.value,
            "monthly_cost": amount if cycle == BillingCycle.MONTHLY else annual / 12,
            "annual_cost": annual,
            "occurrences": len(txs),
            "next_expected": (dates[-1] + timedelta(days=int(avg_interval))).date().isoformat(),
        })
    return detected


def sync_subscriptions(db: Session, user_id: UUID) -> list[Subscription]:
    detected = detect_subscriptions(db, user_id)
    results = []
    for item in detected:
        existing = db.scalar(
            select(Subscription).where(
                Subscription.user_id == user_id,
                Subscription.name == item["merchant"],
                Subscription.status != SubscriptionStatus.IGNORED,
            )
        )
        if not existing:
            sub = Subscription(
                user_id=user_id,
                name=item["merchant"],
                amount=item["amount"],
                billing_cycle=BillingCycle(item["billing_cycle"]),
            )
            db.add(sub)
            results.append(sub)
        else:
            results.append(existing)
    db.commit()
    return results
