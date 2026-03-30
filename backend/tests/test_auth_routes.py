def test_register_success_returns_token_and_user(client):
    res = client.post(
        "/api/auth/register",
        json={
            "username": "tenant1",
            "email": "tenant1@example.com",
            "password": "password123",
        },
    )
    assert res.status_code == 201
    payload = res.get_json()
    assert "access_token" in payload
    assert payload["user"]["username"] == "tenant1"
    assert payload["user"]["role"] == "tenant"


def test_register_rejects_duplicate_username(client):
    body = {
        "username": "tenant1",
        "email": "tenant1@example.com",
        "password": "password123",
    }
    assert client.post("/api/auth/register", json=body).status_code == 201

    dup = client.post(
        "/api/auth/register",
        json={**body, "email": "tenant2@example.com"},
    )
    assert dup.status_code == 400
    assert dup.get_json()["error"] == "Username already exists"


def test_register_blocks_self_assigned_admin_role(client):
    res = client.post(
        "/api/auth/register",
        json={
            "username": "badadmin",
            "email": "badadmin@example.com",
            "password": "password123",
            "role": "admin",
        },
    )
    assert res.status_code == 403
    assert res.get_json()["error"] == "Self-assigned roles are not allowed"


def test_login_success_and_failure(client):
    client.post(
        "/api/auth/register",
        json={
            "username": "tenant1",
            "email": "tenant1@example.com",
            "password": "password123",
        },
    )

    ok = client.post(
        "/api/auth/login",
        json={"username": "tenant1", "password": "password123"},
    )
    assert ok.status_code == 200
    assert "access_token" in ok.get_json()

    bad = client.post(
        "/api/auth/login",
        json={"username": "tenant1", "password": "wrongpass"},
    )
    assert bad.status_code == 401
    assert bad.get_json()["error"] == "Invalid username or password"

