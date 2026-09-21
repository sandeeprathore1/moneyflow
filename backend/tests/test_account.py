from datetime import UTC, datetime
from decimal import Decimal
from uuid import UUID

from app.models.enums import TransactionType
from app.models.transaction import Transaction


def _register(client, email="acct@test.com"):
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "password123", "display_name": "Acct User"},
    )
    login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "password123"},
    )
    return login.json()["access_token"]


def test_export_json(client, db_session):
    token = _register(client)
    headers = {"Authorization": f"Bearer {token}"}
    user_id = UUID(client.get("/api/v1/users/me", headers=headers).json()["id"])

    tx = Transaction(
        user_id=user_id,
        amount=Decimal("500"),
        currency="INR",
        merchant="Test Shop",
        transaction_type=TransactionType.EXPENSE,
        transaction_date=datetime.now(UTC),
        is_confirmed=True,
    )
    db_session.add(tx)
    db_session.commit()

    resp = client.get("/api/v1/account/export/json", headers=headers)
    assert resp.status_code == 200
    assert "transactions" in resp.json()


def test_export_csv(client):
    token = _register(client, "acct2@test.com")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/account/export/csv", headers=headers)
    assert resp.status_code == 200
    assert "date" in resp.text
