from datetime import datetime
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionUpdate


def list_transactions(
    db: Session,
    user: User,
    *,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    category_id: UUID | None = None,
    merchant: str | None = None,
    transaction_type: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[Transaction], int]:
    query = select(Transaction).where(Transaction.user_id == user.id)

    if date_from:
        query = query.where(Transaction.transaction_date >= date_from)
    if date_to:
        query = query.where(Transaction.transaction_date <= date_to)
    if category_id:
        query = query.where(Transaction.category_id == category_id)
    if merchant:
        query = query.where(Transaction.merchant.ilike(f"%{merchant}%"))
    if transaction_type:
        query = query.where(Transaction.transaction_type == transaction_type)

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    items = db.scalars(
        query.order_by(Transaction.transaction_date.desc())
        .offset((page - 1) * page_size)
        .limit(min(page_size, 100))
    ).all()
    return list(items), total


def get_transaction(db: Session, user: User, transaction_id: UUID) -> Transaction:
    tx = db.scalar(
        select(Transaction).where(Transaction.id == transaction_id, Transaction.user_id == user.id)
    )
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return tx


def create_transaction(db: Session, user: User, data: TransactionCreate) -> Transaction:
    tx = Transaction(user_id=user.id, **data.model_dump())
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


def update_transaction(
    db: Session, user: User, transaction_id: UUID, data: TransactionUpdate
) -> Transaction:
    tx = get_transaction(db, user, transaction_id)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(tx, key, value)
    db.commit()
    db.refresh(tx)
    return tx


def delete_transaction(db: Session, user: User, transaction_id: UUID) -> None:
    tx = get_transaction(db, user, transaction_id)
    db.delete(tx)
    db.commit()
