"""BDesigner public site backend tests — settings hero, projects seed, construction 8-step CMS."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://github-preview-68.preview.emergentagent.com").rstrip("/")


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


# --- Homepage CMS: guarantees (iteration_4 content migration) ---
EXPECTED_GUARANTEES = [
    "Transparent Pricing", "Dedicated Project Manager", "Structured Design Review",
    "Final Drawings + BOQ", "Stage-wise Site Updates", "Handover Documentation",
]
LEGACY_GUARANTEES = {"Money Safety", "No Delay", "Fixed Pricing", "Verified Professionals", "Warranty"}


class TestGuarantees:
    def test_guarantees_in_order(self, api):
        r = api.get(f"{BASE_URL}/api/homepage/sections", timeout=15)
        assert r.status_code == 200
        items = sorted(r.json().get("guarantee", []), key=lambda x: x.get("order", 0))
        titles = [i["title"] for i in items if not i.get("hidden")]
        assert titles == EXPECTED_GUARANTEES
        for old in LEGACY_GUARANTEES:
            assert old not in titles, f"legacy guarantee still present: {old}"


# --- Homepage CMS: comparison_feature (Why Choose BDesigner) ---
EXPECTED_COMPARISON = [
    "Architecture + Construction Workflow", "Transparent Architectural Pricing",
    "Dedicated Project Manager", "Drawing Review & Revisions",
    "Project-based Team Communication", "Central Project Documents",
    "Construction Progress & Site Updates", "Package / Proposal Transparency",
    "Handover & Completion Records",
]
LEGACY_COMPARISON = {"Material Marketplace", "Construction ERP", "Digital BOQ",
                     "Verified Engineers", "Warranty", "Construction Tracking", "Quality Tracking"}


class TestComparison:
    def test_comparison_rows_in_order(self, api):
        items = sorted(
            api.get(f"{BASE_URL}/api/homepage/sections", timeout=15).json().get("comparison_feature", []),
            key=lambda x: x.get("order", 0),
        )
        titles = [i["title"] for i in items if not i.get("hidden")]
        assert titles == EXPECTED_COMPARISON
        for old in LEGACY_COMPARISON:
            assert old not in titles, f"legacy comparison row still present: {old}"

    def test_comparison_meta_bdesigner_yes_others_partial(self, api):
        items = api.get(f"{BASE_URL}/api/homepage/sections", timeout=15).json().get("comparison_feature", [])
        for it in items:
            if it.get("hidden"):
                continue
            meta = it.get("meta") or {}
            assert meta.get("bdesigner") == "yes", f"{it['title']} bdesigner != yes"
            assert meta.get("others") == "partial", f"{it['title']} others != partial"


# --- POST /api/requirement/price: architectural charge uses TOTAL built-up area ---
class TestRequirementPrice:
    def test_architectural_total_area_1800(self, api):
        r = api.post(f"{BASE_URL}/api/requirement/price",
                     json={"service_codes": ["architectural"], "total_area": 1800}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["area"] == 1800.0
        assert data["total"] == 21600.0
        assert data["lines"][0]["code"] == "architectural"
        assert data["lines"][0]["rate"] == 12
        assert data["lines"][0]["amount"] == 21600.0

    def test_empty_services_zero_total(self, api):
        r = api.post(f"{BASE_URL}/api/requirement/price",
                     json={"service_codes": [], "total_area": 1000}, timeout=15)
        assert r.status_code == 200
        assert r.json()["total"] == 0.0
