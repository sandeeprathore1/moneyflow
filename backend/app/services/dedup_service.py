import hashlib
import re
from datetime import datetime, timedelta
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.transaction import Transaction


def normalize_merchant(merchant: str) -> str:
    normalized = merchant.lower().strip()
    normalized = re.sub(r"\s+(ltd|limited|pvt|private|inc|corp)\.?$", "", normalized)
    normalized = re.sub(r"[^a-z0-9@.\s]", "", normalized)
    normalized = re.sub(r"\s+", " ", normalized)
    return normalized[:80]


def generate_fingerprint(
    merchant: str,
    amount: float,
    transaction_date: datetime,
    transaction_type: str,
    tolerance_minutes: int = 5,
) -> str:
    bucket = int(transaction_date.timestamp()) // (tolerance_minutes * 60)
    raw = f"{normalize_merchant(merchant)}|{amount:.2f}|{bucket}|{transaction_type}"
    return hashlib.sha256(raw.encode()).hexdigest()[:32]


def is_duplicate(
    db: Session,
    user_id: UUID,
    fingerprint: str,
    merchant: str,
    amount: float,
    transaction_date: datetime,
    tolerance_minutes: int = 5,
) -> bool:
    existing = db.scalar(
        select(Transaction).where(
            Transaction.user_id == user_id,
            Transaction.transaction_fingerprint == fingerprint,
        )
    )
    if existing:
        return True

    window_start = transaction_date - timedelta(minutes=tolerance_minutes)
    window_end = transaction_date + timedelta(minutes=tolerance_minutes)
    normalized = normalize_merchant(merchant)

    similar = db.scalars(
        select(Transaction).where(
            Transaction.user_id == user_id,
            Transaction.amount == amount,
            Transaction.transaction_date >= window_start,
            Transaction.transaction_date <= window_end,
        )
    ).all()

    for tx in similar:
        if tx.merchant and normalize_merchant(tx.merchant) == normalized:
            return True
    return False
