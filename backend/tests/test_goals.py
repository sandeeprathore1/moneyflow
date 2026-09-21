def _register(client, email="goals@test.com"):
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "password123", "display_name": "Goals User"},
    )
    login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "password123"},
    )
    return login.json()["access_token"]


def test_create_and_list_goals(client):
    token = _register(client)
    headers = {"Authorization": f"Bearer {token}"}

    create = client.post(
        "/api/v1/goals",
        headers=headers,
        json={"name": "Emergency Fund", "target_amount": "100000", "current_amount": "25000"},
    )
    assert create.status_code == 201
    body = create.json()
    assert body["name"] == "Emergency Fund"
    assert body["progress_percentage"] == 25.0

    listed = client.get("/api/v1/goals", headers=headers)
    assert listed.status_code == 200
    assert len(listed.json()) == 1


def test_update_goal(client):
    token = _register(client, "goals2@test.com")
    headers = {"Authorization": f"Bearer {token}"}

    created = client.post(
        "/api/v1/goals",
        headers=headers,
        json={"name": "Vacation", "target_amount": "50000"},
    )
    goal_id = created.json()["id"]

    updated = client.patch(
        f"/api/v1/goals/{goal_id}",
        headers=headers,
        json={"current_amount": "10000"},
    )
    assert updated.status_code == 200
    assert updated.json()["progress_percentage"] == 20.0
