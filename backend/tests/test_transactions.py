from datetime import UTC, datetime

from app.services.seed_categories import seed_system_categories


def _auth_headers(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "txuser@example.com", "password": "securepass123"},
    )
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "txuser@example.com", "password": "securepass123"},
    )
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_transaction_crud(client, db_session):
    seed_system_categories(db_session)
    headers = _auth_headers(client)

    categories = client.get("/api/v1/categories", headers=headers).json()
    food_cat = next(c for c in categories if c["slug"] == "food")

    create_resp = client.post(
        "/api/v1/transactions",
        headers=headers,
        json={
            "amount": "850.00",
            "merchant": "Swiggy",
            "category_id": food_cat["id"],
            "transaction_type": "EXPENSE",
            "payment_method": "UPI",
            "transaction_date": datetime.now(UTC).isoformat(),
        },
    )
    assert create_resp.status_code == 201
    tx_id = create_resp.json()["id"]

    list_resp = client.get("/api/v1/transactions", headers=headers)
    assert list_resp.status_code == 200
    assert list_resp.json()["total"] == 1

    dashboard = client.get("/api/v1/analytics/dashboard", headers=headers)
    assert dashboard.status_code == 200
    assert float(dashboard.json()["total_expenses"]) == 850.0

    delete_resp = client.delete(f"/api/v1/transactions/{tx_id}", headers=headers)
    assert delete_resp.status_code == 204


def test_user_isolation(client, db_session):
    seed_system_categories(db_session)
    headers_a = _auth_headers(client)

    client.post(
        "/api/v1/auth/register",
        json={"email": "other@example.com", "password": "securepass123"},
    )
    login_b = client.post(
        "/api/v1/auth/login",
        json={"email": "other@example.com", "password": "securepass123"},
    )
    headers_b = {"Authorization": f"Bearer {login_b.json()['access_token']}"}

    client.post(
        "/api/v1/transactions",
        headers=headers_a,
        json={
            "amount": "100.00",
            "transaction_type": "EXPENSE",
            "transaction_date": datetime.now(UTC).isoformat(),
        },
    )

    list_b = client.get("/api/v1/transactions", headers=headers_b)
    assert list_b.json()["total"] == 0
