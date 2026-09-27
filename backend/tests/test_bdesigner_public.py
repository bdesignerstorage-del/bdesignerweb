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


# --- POST /api/requirement/price: FLOOR-WISE pricing from 4-side dimensions ---
# Spec: floor area = max(front, back) × max(right, left), priced per floor:
# ground_floor_rate for Ground Floor, additional_floor_rate for floors above.
GF = {"front": 30, "right": 42, "back": 32, "left": 40}   # 32 × 42 = 1,344
FF = {"front": 28, "right": 38, "back": 30, "left": 36}   # 30 × 38 = 1,140


class TestRequirementPrice:
    def test_floor_area_recalculated_from_dimensions(self, api):
        r = api.post(f"{BASE_URL}/api/requirement/price",
                     json={"service_codes": ["architectural"], "floors": [GF, FF]}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["floor_areas"] == [1344.0, 1140.0]
        assert data["area"] == 2484.0

    def test_architectural_floorwise_total(self, api):
        r = api.post(f"{BASE_URL}/api/requirement/price",
                     json={"service_codes": ["architectural"], "floors": [GF, FF]}, timeout=15)
        line = r.json()["lines"][0]
        assert line["amount"] == 5640.0  # 1344×2.50 + 1140×2.00
        gf, ff = line["floor_breakdown"]
        assert (gf["area"], gf["rate"], gf["amount"]) == (1344.0, 2.5, 3360.0)
        assert (ff["area"], ff["rate"], ff["amount"]) == (1140.0, 2.0, 2280.0)

    def test_elevation_front_included_and_additional_view_20_percent_less(self, api):
        r = api.post(f"{BASE_URL}/api/requirement/price",
                     json={"service_codes": ["elevation_3d"], "floors": [GF, FF],
                           "elevation_views": ["Front Design", "Left Design"]}, timeout=15)
        line = r.json()["lines"][0]
        assert line["front_view_total"] == 8124.0          # 1344×3.50 + 1140×3.00
        assert line["front_view_included"] is True
        # Front is never charged as an additional view; Left = 8124 × 80%
        assert len(line["additional_views"]) == 1
        assert line["additional_views"][0]["amount"] == 6499.2
        assert line["amount"] == 14623.2

    def test_flat_rate_services(self, api):
        r = api.post(f"{BASE_URL}/api/requirement/price",
                     json={"service_codes": ["structural", "electrical", "plumbing", "interior", "estimation"],
                           "floors": [GF, FF]}, timeout=15)
        amounts = {l["code"]: l["amount"] for l in r.json()["lines"]}
        assert amounts["structural"] == 12420.0   # 2484 × 5
        assert amounts["electrical"] == 6210.0    # 2484 × 2.50
        assert amounts["plumbing"] == 6210.0      # 2484 × 2.50
        assert amounts["interior"] == 29808.0     # 2484 × 12
        assert amounts["estimation"] == 0.0       # FREE from Admin Pricing

    def test_legacy_total_area_treated_as_ground_floor(self, api):
        r = api.post(f"{BASE_URL}/api/requirement/price",
                     json={"service_codes": ["architectural"], "total_area": 2484}, timeout=15)
        assert r.status_code == 200
        line = r.json()["lines"][0]
        assert line["amount"] == 6210.0  # single ground floor: 2484 × 2.50

    def test_empty_services_zero_total(self, api):
        r = api.post(f"{BASE_URL}/api/requirement/price",
                     json={"service_codes": [], "total_area": 1000}, timeout=15)
        assert r.status_code == 200
        assert r.json()["total"] == 0.0
