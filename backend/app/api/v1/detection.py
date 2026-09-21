from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.enums import TransactionSource, TransactionStatus
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.detection import (
    CategorySuggestionResponse,
    ConfirmDetectedRequest,
    DetectedTransactionCreate,
    DetectedTransactionResponse,
)
from app.schemas.transaction import TransactionResponse
from app.services.categorization_service import learn_merchant_category, suggest_category
from app.services.dedup_service import generate_fingerprint, is_duplicate, normalize_merchant
from app.services.transaction_service import get_transaction

router = APIRouter(prefix="/detection", tags=["detection"])


@router.post("/analyze", response_model=DetectedTransactionResponse)
def analyze_detected(
    data: DetectedTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    fingerprint = data.fingerprint or generate_fingerprint(
        data.merchant,
        float(data.amount),
        data.transaction_date,
        data.transaction_type.value,
    )

    duplicate = is_duplicate(
        db,
        current_user.id,
        fingerprint,
        data.merchant,
        float(data.amount),
        data.transaction_date,
    )

    suggestion = suggest_category(db, current_user.id, data.merchant)

    return DetectedTransactionResponse(
        transaction_id=None,
        is_duplicate=duplicate,
        suggestion=CategorySuggestionResponse(
            category_id=suggestion.category_id,
            category_name=suggestion.category_name,
            confidence=suggestion.confidence,
            reason=suggestion.reason,
        ),
    )


@router.post("/confirm", response_model=TransactionResponse, status_code=201)
def confirm_detected(
    data: ConfirmDetectedRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    merchant = data.merchant_override or data.merchant
    fingerprint = data.fingerprint or generate_fingerprint(
        merchant,
        float(data.amount),
        data.transaction_date,
        data.transaction_type.value,
    )

    if is_duplicate(db, current_user.id, fingerprint, merchant, float(data.amount), data.transaction_date):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Duplicate transaction")

    tx = Transaction(
        user_id=current_user.id,
        amount=data.amount,
        currency="INR",
        merchant=merchant,
        category_id=data.category_id,
        transaction_type=data.transaction_type,
        payment_method=data.payment_method,
        source=TransactionSource.NOTIFICATION,
        source_application=data.source_application,
        transaction_date=data.transaction_date,
        detected_at=data.transaction_date,
        status=TransactionStatus.COMPLETED,
        is_confirmed=True,
        external_reference=data.external_reference,
        transaction_fingerprint=fingerprint,
    )
    db.add(tx)
    learn_merchant_category(db, current_user.id, merchant, data.category_id)
    db.commit()
    db.refresh(tx)
    return tx


@router.get("/suggest", response_model=CategorySuggestionResponse)
def suggest(
    merchant: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    suggestion = suggest_category(db, current_user.id, merchant)
    return CategorySuggestionResponse(
        category_id=suggestion.category_id,
        category_name=suggestion.category_name,
        confidence=suggestion.confidence,
        reason=suggestion.reason,
    )
