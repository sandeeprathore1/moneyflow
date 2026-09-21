from datetime import UTC, datetime
from decimal import Decimal
from uuid import UUID

from app.models.enums import TransactionType
from app.models.transaction import Transaction
from app.services.seed_categories import seed_system_categories


def _auth(client, email="analytics@test.com"):
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "password123", "display_name": "Analytics"},
    )
    login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "password123"},
    )
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def _add_tx(db, user_id, amount, tx_type, merchant=None, day=15):
    tx = Transaction(
        user_id=UUID(str(user_id)) if not isinstance(user_id, UUID) else user_id,
        amount=Decimal(str(amount)),
        currency="INR",
        merchant=merchant,
        transaction_type=tx_type,
        transaction_date=datetime(2026, 9, day, 12, 0, tzinfo=UTC),
        is_confirmed=True,
    )
    db.add(tx)
    db.commit()


def test_income_expenses_savings_rate(client, db_session):
    seed_system_categories(db_session)
    headers = _auth(client)
    user_id = client.get("/api/v1/users/me", headers=headers).json()["id"]

    _add_tx(db_session, user_id, 100000, TransactionType.INCOME, day=1)
    _add_tx(db_session, user_id, 30000, TransactionType.EXPENSE, "Rent", day=5)
    _add_tx(db_session, user_id, 5000, TransactionType.EXPENSE, "Swiggy", day=10)
    _add_tx(db_session, user_id, 1000, TransactionType.REFUND, "Amazon", day=12)

    resp = client.get("/api/v1/analytics/monthly?month=2026-09-01", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert float(body["total_income"]) == 100000.0
    assert float(body["total_spent"]) == 34000.0  # 35000 - 1000 refund
    assert float(body["total_refunds"]) == 1000.0
    assert body["savings_rate"] == 66.0


def test_transfers_excluded_from_spending(client, db_session):
    seed_system_categories(db_session)
    headers = _auth(client, "analytics2@test.com")
    user_id = client.get("/api/v1/users/me", headers=headers).json()["id"]

    _add_tx(db_session, user_id, 20000, TransactionType.EXPENSE, day=3)
    _add_tx(db_session, user_id, 5000, TransactionType.TRANSFER, day=4)

    resp = client.get("/api/v1/analytics/monthly?month=2026-09-01", headers=headers)
    body = resp.json()
    assert float(body["total_spent"]) == 20000.0
    assert float(body["total_transfers"]) == 5000.0


def test_top_merchants_and_largest(client, db_session):
    seed_system_categories(db_session)
    headers = _auth(client, "analytics3@test.com")
    user_id = client.get("/api/v1/users/me", headers=headers).json()["id"]

    _add_tx(db_session, user_id, 15000, TransactionType.EXPENSE, "Amazon", day=2)
    _add_tx(db_session, user_id, 3000, TransactionType.EXPENSE, "Swiggy", day=3)
    _add_tx(db_session, user_id, 2000, TransactionType.EXPENSE, "Swiggy", day=4)

    resp = client.get("/api/v1/analytics/monthly?month=2026-09-01", headers=headers)
    body = resp.json()
    assert body["top_merchants"][0]["merchant"] == "Amazon"
    assert float(body["largest_transactions"][0]["amount"]) == 15000.0


def test_trends_and_cashflow(client, db_session):
    seed_system_categories(db_session)
    headers = _auth(client, "analytics4@test.com")
    user_id = client.get("/api/v1/users/me", headers=headers).json()["id"]

    _add_tx(db_session, user_id, 50000, TransactionType.INCOME, day=1)
    _add_tx(db_session, user_id, 10000, TransactionType.EXPENSE, day=5)
    _add_tx(db_session, user_id, 5000, TransactionType.EXPENSE, day=10)

    trends = client.get(
        "/api/v1/analytics/trends?date_from=2026-09-01&date_to=2026-09-30&granularity=week",
        headers=headers,
    )
    assert trends.status_code == 200
    assert len(trends.json()["points"]) >= 1

    cashflow = client.get(
        "/api/v1/analytics/cashflow?date_from=2026-09-01&date_to=2026-09-30&granularity=week",
        headers=headers,
    )
    assert cashflow.status_code == 200
    cf = cashflow.json()
    assert float(cf["total_income"]) == 50000.0
    assert float(cf["total_expenses"]) == 15000.0
    assert float(cf["net_cashflow"]) == 35000.0


def test_budget_projected_spending(client, db_session):
    seed_system_categories(db_session)
    headers = _auth(client, "analytics5@test.com")
    categories = client.get("/api/v1/categories", headers=headers).json()
    food = next(c for c in categories if c["slug"] == "food")

    client.post(
        "/api/v1/budgets",
        headers=headers,
        json={
            "month": "2026-09-01",
            "total_amount": "50000",
            "categories": [{"category_id": food["id"], "limit_amount": "10000"}],
        },
    )

    user_id = client.get("/api/v1/users/me", headers=headers).json()["id"]
    _add_tx(db_session, user_id, 10000, TransactionType.EXPENSE, day=10)

    budget = client.get("/api/v1/budgets?month=2026-09-01", headers=headers)
    body = budget.json()
    assert float(body["spent_amount"]) == 10000.0
    assert float(body["percentage_used"]) == 20.0
    assert body["projected_month_end_spending"] is not None
