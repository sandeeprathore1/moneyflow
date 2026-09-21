def _register(client, email="ai@test.com"):
    client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "password123", "display_name": "AI User"},
    )
    login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "password123"},
    )
    return login.json()["access_token"]


def test_chat_mock_provider(client):
    token = _register(client)
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post(
        "/api/v1/ai/chat",
        headers=headers,
        json={"question": "How much did I spend this month?"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert "answer" in body
    assert len(body["data_sources"]) > 0


def test_insights(client):
    token = _register(client, "ai2@test.com")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/ai/insights", headers=headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
