from app.services.seed_categories import seed_system_categories


def _auth(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "onboard@test.com", "password": "password123", "display_name": "New"},
    )
    login = client.post(
        "/api/v1/auth/login",
        json={"email": "onboard@test.com", "password": "password123"},
    )
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def test_complete_onboarding(client, db_session):
    seed_system_categories(db_session)
    headers = _auth(client)
    categories = client.get("/api/v1/categories", headers=headers).json()
    food = next(c for c in categories if c["slug"] == "food")

    resp = client.post(
        "/api/v1/onboarding/complete",
        headers=headers,
        json={
            "monthly_income": "100000",
            "salary_day": 1,
            "currency": "INR",
            "total_budget": "50000",
            "category_limits": [{"category_id": food["id"], "limit_amount": "10000"}],
        },
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["profile"]["onboarding_completed"] is True
    assert float(body["profile"]["monthly_income"]) == 100000.0

    budget = client.get("/api/v1/budgets", headers=headers)
    assert budget.status_code == 200
