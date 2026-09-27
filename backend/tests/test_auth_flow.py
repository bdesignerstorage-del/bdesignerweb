"""BDesigner Auth Flow backend tests — client-only register, uniqueness, change-password, providers, client summary, must_change_password."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _new_email(tag="auth"):
    return f"bdtest+{tag}_{int(time.time()*1000)}@example.com"


# --- BACKEND 4: providers ---
class TestProviders:
    def test_google_disabled(self, api):
        r = api.get(f"{BASE_URL}/api/auth/providers", timeout=10)
        assert r.status_code == 200
        assert r.json() == {"google_enabled": False}


# --- BACKEND 1: client-only registration ---
class TestClientOnlyRegistration:
    def test_register_forces_client_when_admin_requested(self, api):
        email = _new_email("admin_req")
        r = api.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Priv Escalator", "email": email, "password": "Test@1234",
            "mobile": "9876543210", "role": "admin",
        }, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["role"] == "client"
        assert data["email"] == email
        assert "token" in data

    def test_register_forces_client_when_pm_requested(self, api):
        email = _new_email("pm_req")
        r = api.post(f"{BASE_URL}/api/auth/register", json={
            "name": "PM Escalator", "email": email, "password": "Test@1234",
            "mobile": "9876543210", "role": "project_manager",
        }, timeout=15)
        assert r.status_code == 200
        assert r.json()["role"] == "client"


# --- BACKEND 2: email uniqueness ---
class TestEmailUniqueness:
    def test_duplicate_email_returns_400(self, api):
        email = _new_email("dupe")
        r1 = api.post(f"{BASE_URL}/api/auth/register", json={
            "name": "First", "email": email, "password": "Test@1234", "mobile": "9876543210",
        }, timeout=15)
        assert r1.status_code == 200
        r2 = api.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Second", "email": email, "password": "Test@1234", "mobile": "9876543210",
        }, timeout=15)
        assert r2.status_code == 400
        assert "already registered" in (r2.json().get("detail") or "").lower()


# --- BACKEND 3: change-password ---
class TestChangePassword:
    def test_change_password_requires_auth(self):
        r = requests.post(f"{BASE_URL}/api/auth/change-password",
                          json={"current_password": "x", "new_password": "abcdef"}, timeout=10)
        assert r.status_code == 401

    def test_change_password_wrong_current_400(self, api):
        email = _new_email("cpwrong")
        reg = api.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Wrong Cur", "email": email, "password": "Test@1234", "mobile": "9876543210",
        }, timeout=15).json()
        token = reg["token"]
        r = api.post(f"{BASE_URL}/api/auth/change-password",
                     json={"current_password": "WrongOld1", "new_password": "NewGood1"},
                     headers={"Authorization": f"Bearer {token}"}, timeout=10)
        assert r.status_code == 400

    def test_change_password_too_short_400(self, api):
        email = _new_email("cpshort")
        reg = api.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Short", "email": email, "password": "Test@1234", "mobile": "9876543210",
        }, timeout=15).json()
        token = reg["token"]
        r = api.post(f"{BASE_URL}/api/auth/change-password",
                     json={"current_password": "Test@1234", "new_password": "abc"},
                     headers={"Authorization": f"Bearer {token}"}, timeout=10)
        assert r.status_code == 400

    def test_change_password_success_then_login_flip(self, api):
        email = _new_email("cpok")
        old_pw, new_pw = "Test@1234", "NewPass@5678"
        reg = api.post(f"{BASE_URL}/api/auth/register", json={
            "name": "CP OK", "email": email, "password": old_pw, "mobile": "9876543210",
        }, timeout=15).json()
        token = reg["token"]
        # change
        r = api.post(f"{BASE_URL}/api/auth/change-password",
                     json={"current_password": old_pw, "new_password": new_pw},
                     headers={"Authorization": f"Bearer {token}"}, timeout=10)
        assert r.status_code == 200
        assert r.json().get("ok") is True
        # login with new works
        r2 = api.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": new_pw}, timeout=10)
        assert r2.status_code == 200
        # login with old fails
        r3 = api.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": old_pw}, timeout=10)
        assert r3.status_code == 401


# --- BACKEND 6: login must_change_password flag ---
class TestMustChangePasswordFlag:
    def test_fresh_client_flag_false(self, api):
        email = _new_email("mcp")
        api.post(f"{BASE_URL}/api/auth/register", json={
            "name": "MCP", "email": email, "password": "Test@1234", "mobile": "9876543210",
        }, timeout=15)
        r = api.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": "Test@1234"}, timeout=10)
        assert r.status_code == 200
        body = r.json()
        assert "must_change_password" in body
        assert isinstance(body["must_change_password"], bool)
        assert body["must_change_password"] is False


# --- BACKEND 5: client/summary ---
class TestClientSummary:
    def test_summary_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/client/summary", timeout=10)
        assert r.status_code == 401

    def test_summary_scoped_and_increments(self, api):
        email = _new_email("summ")
        reg = api.post(f"{BASE_URL}/api/auth/register", json={
            "name": "Summary User", "email": email, "password": "Test@1234", "mobile": "9876543210",
        }, timeout=15).json()
        token = reg["token"]
        H = {"Authorization": f"Bearer {token}"}

        r0 = api.get(f"{BASE_URL}/api/client/summary", headers=H, timeout=10)
        assert r0.status_code == 200
        base = r0.json()
        assert "count" in base and "projects" in base
        assert isinstance(base["projects"], list)
        assert base["count"] == len(base["projects"])
        start = base["count"]

        # submit a requirement while authenticated
        payload = {
            "name": "Summary User",
            "mobile": "9876543210",
            "email": email,
            "project_name": "TEST_Summary_Project",
            "source": "test",
            "service_codes": ["architectural"],
            "total_area": 1200,
            "requirement": {"address": {"label": "Bengaluru"}},
        }
        r1 = api.post(f"{BASE_URL}/api/requirement/submit", json=payload, headers=H, timeout=15)
        assert r1.status_code == 200, r1.text
        assert r1.json().get("ok") is True

        r2 = api.get(f"{BASE_URL}/api/client/summary", headers=H, timeout=10)
        assert r2.status_code == 200
        after = r2.json()
        assert after["count"] == start + 1
        names = [p.get("project_name") for p in after["projects"]]
        assert "TEST_Summary_Project" in names
