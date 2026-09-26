"""BDesigner Website CMS Phase 1 backend tests: admin login, authz, draft/preview/publish, media upload."""
import base64
import io
import os
import time

import pytest
import requests

BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL")
            or "https://repo-preview-107.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@bdesigner.com"
ADMIN_PASSWORD = "9-D6NIbzb8Gz0yHK"

# Tiny valid PNG (1x1 red pixel)
PNG_BYTES = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="
)


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data.get("role") == "admin"
    tok = data.get("token") or data.get("access_token")
    assert tok
    return tok


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="module")
def client_token():
    # Register a fresh client
    ts = int(time.time())
    email = f"bdtest+cms{ts}@example.com"
    r = requests.post(f"{BASE_URL}/api/auth/register",
                      json={"name": "CMS Client", "email": email, "password": "Test@1234",
                            "mobile": "9876543210", "role": "client"}, timeout=15)
    if r.status_code not in (200, 201):
        pytest.skip(f"client register failed: {r.status_code} {r.text}")
    d = r.json()
    return d.get("token") or d.get("access_token")


class TestAdminAuth:
    def test_admin_login_returns_admin_role(self):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                          json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["role"] == "admin"
        assert isinstance(d.get("token") or d.get("access_token"), str)

    def test_me_returns_admin(self, admin_headers):
        r = requests.get(f"{BASE_URL}/api/auth/me", headers=admin_headers, timeout=15)
        assert r.status_code == 200
        assert r.json().get("role") == "admin"

    def test_bad_password(self):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                          json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=15)
        assert r.status_code in (400, 401)


class TestAdminAuthorization:
    ENDPOINTS = [
        ("GET", "/api/admin/cms/homepage"),
        ("GET", "/api/admin/cms/homepage/preview"),
        ("PUT", "/api/admin/cms/homepage"),
        ("POST", "/api/admin/cms/homepage/publish"),
    ]

    def test_no_token_401(self):
        for m, p in self.ENDPOINTS:
            r = requests.request(m, f"{BASE_URL}{p}",
                                 json={} if m in ("PUT", "POST") else None, timeout=15)
            assert r.status_code in (401, 403), f"{m} {p} => {r.status_code}"

    def test_client_token_403(self, client_token):
        h = {"Authorization": f"Bearer {client_token}"}
        for m, p in self.ENDPOINTS:
            r = requests.request(m, f"{BASE_URL}{p}", headers=h,
                                 json={} if m in ("PUT", "POST") else None, timeout=15)
            assert r.status_code == 403, f"{m} {p} => {r.status_code} (expected 403)"

    def test_media_upload_no_token(self):
        r = requests.post(f"{BASE_URL}/api/admin/media/upload",
                          files={"file": ("x.png", PNG_BYTES, "image/png")},
                          data={"kind": "image"}, timeout=30)
        assert r.status_code in (401, 403)


class TestCMSDraftShape:
    def test_get_draft(self, admin_headers):
        r = requests.get(f"{BASE_URL}/api/admin/cms/homepage", headers=admin_headers, timeout=20)
        assert r.status_code == 200
        d = r.json()
        for key in ("settings", "items", "hero", "footer", "meta"):
            assert key in d, f"missing {key}"
        items = d["items"]
        expected_counts = {
            "trust_indicator": 4, "construction_step": 8, "guarantee": 6,
            "service_area": 12, "homeowner_review": 6, "comparison_feature": 9, "faq": 6,
        }
        for sec, cnt in expected_counts.items():
            assert sec in items, f"missing section {sec}"
            visible = [x for x in items[sec] if not x.get("hidden")]
            assert len(visible) >= cnt, f"{sec} has {len(visible)} visible, expected >= {cnt}"
        assert "last_saved" in d["meta"]
        assert "last_published" in d["meta"]


class TestMediaUpload:
    def test_upload_image_and_serve(self, admin_headers):
        r = requests.post(f"{BASE_URL}/api/admin/media/upload", headers=admin_headers,
                          files={"file": ("t.png", PNG_BYTES, "image/png")},
                          data={"kind": "image"}, timeout=60)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["url"].startswith("/api/media/bdesigner/cms/image/")
        assert d["url"].endswith(".png")
        # Serve
        r2 = requests.get(f"{BASE_URL}{d['url']}", timeout=30)
        assert r2.status_code == 200
        assert r2.headers.get("content-type", "").startswith("image/")

    def test_reject_wrong_extension(self, admin_headers):
        r = requests.post(f"{BASE_URL}/api/admin/media/upload", headers=admin_headers,
                          files={"file": ("t.txt", b"hello", "text/plain")},
                          data={"kind": "image"}, timeout=30)
        assert r.status_code == 400

    def test_reject_empty(self, admin_headers):
        r = requests.post(f"{BASE_URL}/api/admin/media/upload", headers=admin_headers,
                          files={"file": ("t.png", b"", "image/png")},
                          data={"kind": "image"}, timeout=30)
        assert r.status_code == 400


class TestDraftPreviewPublishRoundTrip:
    def test_full_roundtrip(self, admin_headers):
        # 1) Get current draft
        r = requests.get(f"{BASE_URL}/api/admin/cms/homepage", headers=admin_headers, timeout=20)
        assert r.status_code == 200
        draft = r.json()

        # find guarantee item titled "Transparent Pricing" (or first)
        guarantees = draft["items"].get("guarantee", [])
        assert guarantees
        target_idx = 0
        original_title = None
        for i, g in enumerate(guarantees):
            if g.get("title") == "Transparent Pricing":
                target_idx = i
                original_title = g["title"]
                break
        if original_title is None:
            original_title = guarantees[0].get("title")

        test_title = f"TEST-EDIT {int(time.time())}"

        # 2) Save draft with edit
        new_items = {k: list(v) for k, v in draft["items"].items()}
        new_items["guarantee"] = [dict(x) for x in new_items["guarantee"]]
        new_items["guarantee"][target_idx]["title"] = test_title

        payload = {
            "settings": draft.get("settings") or {},
            "items": new_items,
            "hero": draft.get("hero") or {},
            "footer": draft.get("footer") or {},
        }
        r = requests.put(f"{BASE_URL}/api/admin/cms/homepage", headers=admin_headers,
                         json=payload, timeout=30)
        assert r.status_code == 200, r.text

        # 3) Preview shows test title
        r = requests.get(f"{BASE_URL}/api/admin/cms/homepage/preview", headers=admin_headers, timeout=20)
        assert r.status_code == 200
        preview = r.json()
        prev_titles = [x.get("title") for x in preview["sections"]["guarantee"]]
        assert test_title in prev_titles, f"preview missing test title: {prev_titles}"

        # 4) Public MUST NOT yet show
        r = requests.get(f"{BASE_URL}/api/homepage/sections", timeout=20)
        assert r.status_code == 200
        pub_titles = [x.get("title") for x in r.json().get("guarantee", [])]
        assert test_title not in pub_titles, "leaked test edit to public before publish"

        # 5) Publish
        r = requests.post(f"{BASE_URL}/api/admin/cms/homepage/publish", headers=admin_headers,
                          timeout=30)
        assert r.status_code == 200, r.text

        # 6) Public now shows test title
        r = requests.get(f"{BASE_URL}/api/homepage/sections", timeout=20)
        pub_titles = [x.get("title") for x in r.json().get("guarantee", [])]
        assert test_title in pub_titles, f"public not updated after publish: {pub_titles}"

        # 7) CLEANUP: revert to original title & publish again
        r = requests.get(f"{BASE_URL}/api/admin/cms/homepage", headers=admin_headers, timeout=20)
        cur = r.json()
        items_rev = {k: list(v) for k, v in cur["items"].items()}
        items_rev["guarantee"] = [dict(x) for x in items_rev["guarantee"]]
        # locate current test row and rename back
        for it in items_rev["guarantee"]:
            if it.get("title") == test_title:
                it["title"] = original_title
                break
        payload = {
            "settings": cur.get("settings") or {},
            "items": items_rev,
            "hero": cur.get("hero") or {},
            "footer": cur.get("footer") or {},
        }
        r = requests.put(f"{BASE_URL}/api/admin/cms/homepage", headers=admin_headers,
                         json=payload, timeout=30)
        assert r.status_code == 200
        r = requests.post(f"{BASE_URL}/api/admin/cms/homepage/publish", headers=admin_headers,
                          timeout=30)
        assert r.status_code == 200
        # Verify revert
        r = requests.get(f"{BASE_URL}/api/homepage/sections", timeout=20)
        pub_titles = [x.get("title") for x in r.json().get("guarantee", [])]
        assert original_title in pub_titles
        assert test_title not in pub_titles, "cleanup failed — public still has test edit"
