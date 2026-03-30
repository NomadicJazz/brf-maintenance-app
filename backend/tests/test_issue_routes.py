from app.extensions import db
from app.models.issue import Issue
from app.models.user import User


def _register_and_login(client, username, email, password="password123"):
    client.post(
        "/api/auth/register",
        json={"username": username, "email": email, "password": password},
    )
    res = client.post(
        "/api/auth/login",
        json={"username": username, "password": password},
    )
    return res.get_json()["access_token"]


def test_create_issue_requires_auth(client):
    res = client.post("/api/issues/", json={"title": "Broken light"})
    assert res.status_code == 401


def test_create_issue_success_for_authenticated_user(client):
    token = _register_and_login(client, "tenant1", "tenant1@example.com")
    res = client.post(
        "/api/issues/",
        json={"title": "Broken light", "priority": "low"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 201
    assert res.get_json()["title"] == "Broken light"


def test_tenant_only_sees_own_issues(client):
    token1 = _register_and_login(client, "tenant1", "tenant1@example.com")
    token2 = _register_and_login(client, "tenant2", "tenant2@example.com")

    client.post(
        "/api/issues/",
        json={"title": "Issue by tenant1"},
        headers={"Authorization": f"Bearer {token1}"},
    )
    client.post(
        "/api/issues/",
        json={"title": "Issue by tenant2"},
        headers={"Authorization": f"Bearer {token2}"},
    )

    mine = client.get("/api/issues/my", headers={"Authorization": f"Bearer {token1}"})
    assert mine.status_code == 200
    issues = mine.get_json()["issues"]
    assert len(issues) == 1
    assert issues[0]["title"] == "Issue by tenant1"


def test_admin_can_list_all_issues(client, app):
    tenant_token = _register_and_login(client, "tenant1", "tenant1@example.com")
    admin_token = _register_and_login(client, "admin1", "admin1@example.com")

    with app.app_context():
        admin = User.query.filter_by(username="admin1").first()
        admin.role = "admin"
        db.session.commit()

    client.post(
        "/api/issues/",
        json={"title": "Issue by tenant1"},
        headers={"Authorization": f"Bearer {tenant_token}"},
    )

    all_issues = client.get("/api/issues/", headers={"Authorization": f"Bearer {admin_token}"})
    assert all_issues.status_code == 200
    payload = all_issues.get_json()
    assert payload["total"] == 1


def test_owner_or_admin_can_update_issue(client, app):
    owner_token = _register_and_login(client, "tenant1", "tenant1@example.com")
    other_token = _register_and_login(client, "tenant2", "tenant2@example.com")
    admin_token = _register_and_login(client, "admin1", "admin1@example.com")

    with app.app_context():
        admin = User.query.filter_by(username="admin1").first()
        admin.role = "admin"
        db.session.commit()

    created = client.post(
        "/api/issues/",
        json={"title": "Need update"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    issue_id = created.get_json()["id"]

    forbidden = client.put(
        f"/api/issues/{issue_id}",
        json={"title": "Nope"},
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert forbidden.status_code == 403

    ok_owner = client.put(
        f"/api/issues/{issue_id}",
        json={"title": "Updated by owner"},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert ok_owner.status_code == 200

    ok_admin = client.put(
        f"/api/issues/{issue_id}",
        json={"status": "resolved"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert ok_admin.status_code == 200
    assert ok_admin.get_json()["status"] == "resolved"


def test_invalid_priority_rejected(client):
    token = _register_and_login(client, "tenant1", "tenant1@example.com")
    res = client.post(
        "/api/issues/",
        json={"title": "Bad priority", "priority": "urgent"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 400
    assert "Priority must be one of" in res.get_json()["error"]

