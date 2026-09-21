from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.enums import TransactionSource, TransactionType


class DetectedTransactionCreate(BaseModel):
    amount: Decimal = Field(gt=0)
    merchant: str = Field(min_length=1, max_length=255)
    transaction_type: TransactionType = TransactionType.EXPENSE
    payment_method: str = "UPI"
    source_application: str | None = None
    transaction_date: datetime
    fingerprint: str | None = None
    external_reference: str | None = None


class CategorySuggestionResponse(BaseModel):
    category_id: UUID | None
    category_name: str
    confidence: float
    reason: str


class DetectedTransactionResponse(BaseModel):
    transaction_id: UUID | None
    is_duplicate: bool
    suggestion: CategorySuggestionResponse


class ConfirmDetectedRequest(DetectedTransactionCreate):
    category_id: UUID
    merchant_override: str | None = None
