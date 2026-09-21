from datetime import UTC, datetime

from app.services.dedup_service import generate_fingerprint, is_duplicate, normalize_merchant
from app.services.seed_categories import seed_system_categories


def test_normalize_merchant():
    assert normalize_merchant("SWIGGY LTD") == normalize_merchant("swiggy")
    assert normalize_merchant("Swiggy") == "swiggy"


def test_fingerprint_same_window(client, db_session):
    seed_system_categories(db_session)
    fp1 = generate_fingerprint("Swiggy", 850.0, datetime(2026, 9, 21, 12, 0, tzinfo=UTC), "EXPENSE")
    fp2 = generate_fingerprint("swiggy", 850.0, datetime(2026, 9, 21, 12, 2, tzinfo=UTC), "EXPENSE")
    assert fp1 == fp2


def test_duplicate_detection(client, db_session):
    seed_system_categories(db_session)
    client.post(
        "/api/v1/auth/register",
        json={"email": "dedup@example.com", "password": "securepass123"},
    )
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "dedup@example.com", "password": "securepass123"},
    )
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    payload = {
        "amount": "500.00",
        "merchant": "Swiggy",
        "transaction_type": "EXPENSE",
        "transaction_date": datetime.now(UTC).isoformat(),
    }
    r1 = client.post("/api/v1/transactions", headers=headers, json=payload)
    assert r1.status_code == 201
    r2 = client.post("/api/v1/transactions", headers=headers, json=payload)
    assert r2.status_code == 409
