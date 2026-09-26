"""BDesigner public site backend tests — settings hero, projects seed, construction 8-step CMS."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://repo-preview-107.preview.emergentagent.com").rstrip("/")


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- GET /api/settings: hero timeline config ---
class TestSettingsHero:
    def test_settings_ok(self, api):
        r = api.get(f"{BASE_URL}/api/settings", timeout=15)
        assert r.status_code == 200
        assert "hero" in r.json()

    def test_hero_states_shape(self, api):
        hero = api.get(f"{BASE_URL}/api/settings", timeout=15).json()["hero"]
        assert hero["total_duration"] == 23
        assert hero["default_state"] == "construction"
        keys = [s["key"] for s in hero["states"]]
        assert keys == ["construction", "morning", "night"]
        by = {s["key"]: s for s in hero["states"]}
        assert by["construction"]["theme"] == "light" and by["construction"]["timestamp"] == 0
        assert by["morning"]["theme"] == "light" and by["morning"]["timestamp"] == 19
        assert by["night"]["theme"] == "dark" and by["night"]["timestamp"] == 22
        for s in hero["states"]:
            assert s.get("icon") and s.get("label")


# --- GET /api/projects: portfolio seed ---
class TestPortfolioProjects:
    def test_projects_list(self, api):
        r = api.get(f"{BASE_URL}/api/projects?limit=8", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 6
        for p in data[:6]:
            for k in ("id", "title", "cover", "style", "budget", "views", "shares"):
                assert k in p, f"missing {k}"


# --- Homepage CMS: 8-step construction flow ---
EXPECTED_STEPS = [
    "Share Requirement", "Get Pricing", "Create Account", "Team Assigned",
    "Design & Review", "Final Drawings + BOQ", "Construction Proposal", "Construction Execution",
]

class TestConstructionSteps:
    def test_eight_steps_in_order(self, api):
        r = api.get(f"{BASE_URL}/api/homepage/sections", timeout=15)
        assert r.status_code == 200
        items = sorted(r.json().get("construction_step", []), key=lambda x: x.get("order", 0))
        titles = [i["title"] for i in items if not i.get("hidden")]
        assert titles[:8] == EXPECTED_STEPS
        # Old titles removed
        for old in ("Free Consultation", "Site Visit", "Quotation"):
            assert old not in titles, f"old step still present: {old}"
