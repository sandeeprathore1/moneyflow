from datetime import UTC, datetime, timedelta
from decimal import Decimal
from uuid import UUID

from app.models.enums import TransactionType
from app.models.transaction import Transaction


def _register(client, email="subs@test.com"):
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "password123", "display_name": "Sub User"},
    )
    login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "password123"},
    )
    return login.json()["access_token"]


def test_detect_monthly_subscription(client, db_session):
    token = _register(client)
    headers = {"Authorization": f"Bearer {token}"}
    user_id = UUID(client.get("/api/v1/users/me", headers=headers).json()["id"])

    base = datetime.now(UTC)
    for i in range(3):
        tx = Transaction(
            user_id=user_id,
            amount=Decimal("299"),
            currency="INR",
            merchant="Netflix",
            transaction_type=TransactionType.EXPENSE,
            transaction_date=base - timedelta(days=30 * i),
            is_confirmed=True,
        )
        db_session.add(tx)
    db_session.commit()

    detected = client.post("/api/v1/subscriptions/detect", headers=headers)
    assert detected.status_code == 200
    items = detected.json()
    assert len(items) >= 1
    assert items[0]["merchant"] == "Netflix"
    assert items[0]["billing_cycle"] == "MONTHLY"
