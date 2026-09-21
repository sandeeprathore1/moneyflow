def test_register_and_login(client):
    register_response = client.post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "password": "securepass123", "display_name": "Test"},
    )
    assert register_response.status_code == 201
    user = register_response.json()
    assert user["email"] == "test@example.com"
    assert user["profile"]["display_name"] == "Test"

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "securepass123"},
    )
    assert login_response.status_code == 200
    tokens = login_response.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens

    me_response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
    )
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "test@example.com"


def test_register_duplicate_email(client):
    payload = {"email": "dup@example.com", "password": "securepass123"}
    client.post("/api/v1/auth/register", json=payload)
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400


def test_login_invalid_credentials(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "user@example.com", "password": "securepass123"},
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "user@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
