from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import TransactionSource, TransactionStatus, TransactionType


class TransactionCreate(BaseModel):
    amount: Decimal = Field(gt=0)
    currency: str = Field(default="INR", max_length=3)
    merchant: str | None = Field(default=None, max_length=255)
    category_id: UUID | None = None
    transaction_type: TransactionType = TransactionType.EXPENSE
    payment_method: str | None = None
    source: TransactionSource = TransactionSource.MANUAL
    source_application: str | None = None
    transaction_date: datetime
    notes: str | None = None
    status: TransactionStatus = TransactionStatus.COMPLETED
    is_confirmed: bool = True


class TransactionUpdate(BaseModel):
    amount: Decimal | None = Field(default=None, gt=0)
    merchant: str | None = None
    category_id: UUID | None = None
    transaction_type: TransactionType | None = None
    payment_method: str | None = None
    transaction_date: datetime | None = None
    notes: str | None = None
    status: TransactionStatus | None = None
    is_confirmed: bool | None = None


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    amount: Decimal
    currency: str
    merchant: str | None
    category_id: UUID | None
    transaction_type: TransactionType
    payment_method: str | None
    source: TransactionSource
    source_application: str | None
    transaction_date: datetime
    detected_at: datetime | None
    notes: str | None
    status: TransactionStatus
    confidence_score: float | None
    is_recurring: bool
    is_confirmed: bool
    external_reference: str | None
    created_at: datetime
    updated_at: datetime


class TransactionListResponse(BaseModel):
    items: list[TransactionResponse]
    total: int
    page: int
    page_size: int
