"""
BDesigner Floor-wise Pricing Deep Fix Backend Test
Test Plan: 8 steps as per review request
Backend base URL: http://localhost:8001
"""
import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8001"

# Test data
GF = {"front": 30, "right": 42, "back": 32, "left": 40}  # Expected: 32 × 42 = 1344
FF = {"front": 28, "right": 38, "back": 30, "left": 36}  # Expected: 30 × 38 = 1140
# Total: 2484

class TestResult:
    def __init__(self):
        self.passed = []
        self.failed = []
        self.details = []
    
    def add_pass(self, step: str, detail: str = ""):
        self.passed.append(step)
        self.details.append(f"✅ PASS: {step}" + (f" - {detail}" if detail else ""))
    
    def add_fail(self, step: str, detail: str):
        self.failed.append(step)
        self.details.append(f"❌ FAIL: {step} - {detail}")
    
    def print_summary(self):
        print("\n" + "="*80)
        print("TEST SUMMARY")
        print("="*80)
        for detail in self.details:
            print(detail)
        print("\n" + "="*80)
        print(f"PASSED: {len(self.passed)}")
        print(f"FAILED: {len(self.failed)}")
        print("="*80)
        return len(self.failed) == 0

def test_step_1_service_catalog():
    """Step 1: GET /api/requirement/services → verify floor rates"""
    print("\n[STEP 1] Testing GET /api/requirement/services")
    result = TestResult()
    
    try:
        r = requests.get(f"{BASE_URL}/api/requirement/services", timeout=15)
        if r.status_code != 200:
            result.add_fail("Step 1", f"Status code {r.status_code}, expected 200")
            return result
        
        data = r.json()
        services = {s["code"]: s for s in data.get("services", [])}
        
        # Check architectural
        if "architectural" in services:
            s = services["architectural"]
            if s.get("ground_floor_rate") == 2.5 and s.get("additional_floor_rate") == 2.0:
                result.add_pass("Step 1.1: Architectural rates", "GF=2.5, Add=2.0")
            else:
                result.add_fail("Step 1.1: Architectural rates", 
                    f"GF={s.get('ground_floor_rate')}, Add={s.get('additional_floor_rate')}, expected 2.5/2.0")
        else:
            result.add_fail("Step 1.1: Architectural", "Service not found")
        
        # Check elevation_3d
        if "elevation_3d" in services:
            s = services["elevation_3d"]
            checks = []
            if s.get("ground_floor_rate") != 3.5:
                checks.append(f"GF={s.get('ground_floor_rate')} (expected 3.5)")
            if s.get("additional_floor_rate") != 3.0:
                checks.append(f"Add={s.get('additional_floor_rate')} (expected 3.0)")
            if s.get("additional_view_discount_percent") != 20:
                checks.append(f"Discount={s.get('additional_view_discount_percent')} (expected 20)")
            if s.get("front_view_included") != True:
                checks.append(f"Front included={s.get('front_view_included')} (expected True)")
            
            if checks:
                result.add_fail("Step 1.2: Elevation 3D", ", ".join(checks))
            else:
                result.add_pass("Step 1.2: Elevation 3D", "GF=3.5, Add=3.0, Discount=20%, Front included")
        else:
            result.add_fail("Step 1.2: Elevation 3D", "Service not found")
        
        # Check other services
        expected = {
            "structural": (5, 5),
            "electrical": (2.5, 2.5),
            "plumbing": (2.5, 2.5),
            "interior": (12, 12),
        }
        
        for code, (gf_rate, add_rate) in expected.items():
            if code in services:
                s = services[code]
                if s.get("ground_floor_rate") == gf_rate and s.get("additional_floor_rate") == add_rate:
                    result.add_pass(f"Step 1.3: {code.capitalize()}", f"GF={gf_rate}, Add={add_rate}")
                else:
                    result.add_fail(f"Step 1.3: {code.capitalize()}", 
                        f"GF={s.get('ground_floor_rate')}, Add={s.get('additional_floor_rate')}, expected {gf_rate}/{add_rate}")
            else:
                result.add_fail(f"Step 1.3: {code.capitalize()}", "Service not found")
        
        # Check estimation is free
        if "estimation" in services:
            s = services["estimation"]
            if s.get("pricing_type") == "free":
                result.add_pass("Step 1.4: Estimation", "pricing_type=free")
            else:
                result.add_fail("Step 1.4: Estimation", f"pricing_type={s.get('pricing_type')}, expected 'free'")
        else:
            result.add_fail("Step 1.4: Estimation", "Service not found")
        
    except Exception as e:
        result.add_fail("Step 1", f"Exception: {str(e)}")
    
    return result

def test_step_2_architectural_pricing():
    """Step 2: POST /api/requirement/price with architectural service"""
    print("\n[STEP 2] Testing POST /api/requirement/price - Architectural")
    result = TestResult()
    
    try:
        payload = {
            "service_codes": ["architectural"],
            "floors": [GF, FF]
        }
        r = requests.post(f"{BASE_URL}/api/requirement/price", json=payload, timeout=15)
        
        if r.status_code != 200:
            result.add_fail("Step 2", f"Status code {r.status_code}, expected 200")
            return result
        
        data = r.json()
        
        # Check floor_areas
        if data.get("floor_areas") == [1344.0, 1140.0]:
            result.add_pass("Step 2.1: Floor areas", "[1344, 1140]")
        else:
            result.add_fail("Step 2.1: Floor areas", f"{data.get('floor_areas')}, expected [1344, 1140]")
        
        # Check total area
        if data.get("area") == 2484.0:
            result.add_pass("Step 2.2: Total area", "2484")
        else:
            result.add_fail("Step 2.2: Total area", f"{data.get('area')}, expected 2484")
        
        # Check line amount
        lines = data.get("lines", [])
        if lines:
            line = lines[0]
            if line.get("amount") == 5640.0:
                result.add_pass("Step 2.3: Line amount", "5640 (1344×2.5 + 1140×2.0)")
            else:
                result.add_fail("Step 2.3: Line amount", f"{line.get('amount')}, expected 5640")
            
            # Check floor_breakdown
            breakdown = line.get("floor_breakdown", [])
            if len(breakdown) == 2:
                gf_bd = breakdown[0]
                ff_bd = breakdown[1]
                
                gf_ok = (gf_bd.get("area") == 1344.0 and 
                        gf_bd.get("rate") == 2.5 and 
                        gf_bd.get("amount") == 3360.0)
                ff_ok = (ff_bd.get("area") == 1140.0 and 
                        ff_bd.get("rate") == 2.0 and 
                        ff_bd.get("amount") == 2280.0)
                
                if gf_ok and ff_ok:
                    result.add_pass("Step 2.4: Floor breakdown", "GF: 1344×2.5=3360, FF: 1140×2.0=2280")
                else:
                    result.add_fail("Step 2.4: Floor breakdown", 
                        f"GF: {gf_bd.get('area')}×{gf_bd.get('rate')}={gf_bd.get('amount')}, "
                        f"FF: {ff_bd.get('area')}×{ff_bd.get('rate')}={ff_bd.get('amount')}")
            else:
                result.add_fail("Step 2.4: Floor breakdown", f"Length {len(breakdown)}, expected 2")
        else:
            result.add_fail("Step 2.3: Lines", "No lines returned")
        
    except Exception as e:
        result.add_fail("Step 2", f"Exception: {str(e)}")
    
    return result

def test_step_3_elevation_pricing():
    """Step 3: POST /api/requirement/price with elevation_3d and additional views"""
    print("\n[STEP 3] Testing POST /api/requirement/price - Elevation with additional views")
    result = TestResult()
    
    try:
        payload = {
            "service_codes": ["elevation_3d"],
            "floors": [GF, FF],
            "elevation_views": ["Front Design", "Left Design"]
        }
        r = requests.post(f"{BASE_URL}/api/requirement/price", json=payload, timeout=15)
        
        if r.status_code != 200:
            result.add_fail("Step 3", f"Status code {r.status_code}, expected 200")
            return result
        
        data = r.json()
        lines = data.get("lines", [])
        
        if lines:
            line = lines[0]
            
            # Check front_view_total
            if line.get("front_view_total") == 8124.0:
                result.add_pass("Step 3.1: Front view total", "8124 (1344×3.5 + 1140×3.0)")
            else:
                result.add_fail("Step 3.1: Front view total", f"{line.get('front_view_total')}, expected 8124")
            
            # Check front_view_included
            if line.get("front_view_included") == True:
                result.add_pass("Step 3.2: Front view included", "True")
            else:
                result.add_fail("Step 3.2: Front view included", f"{line.get('front_view_included')}, expected True")
            
            # Check additional_views (should only have Left, not Front)
            addl_views = line.get("additional_views", [])
            if len(addl_views) == 1:
                view = addl_views[0]
                if "Left" in view.get("view", "") and view.get("amount") == 6499.2:
                    result.add_pass("Step 3.3: Additional views", "Left Design only, amount=6499.2 (8124×80%)")
                else:
                    result.add_fail("Step 3.3: Additional views", 
                        f"View={view.get('view')}, amount={view.get('amount')}, expected Left/6499.2")
            else:
                result.add_fail("Step 3.3: Additional views", f"Count={len(addl_views)}, expected 1 (Left only)")
            
            # Check line amount
            if line.get("amount") == 14623.2:
                result.add_pass("Step 3.4: Line amount", "14623.2 (8124 + 6499.2)")
            else:
                result.add_fail("Step 3.4: Line amount", f"{line.get('amount')}, expected 14623.2")
        else:
            result.add_fail("Step 3", "No lines returned")
        
    except Exception as e:
        result.add_fail("Step 3", f"Exception: {str(e)}")
    
    return result

def test_step_4_other_services():
    """Step 4: POST /api/requirement/price with structural, electrical, plumbing, interior, estimation"""
    print("\n[STEP 4] Testing POST /api/requirement/price - Other services")
    result = TestResult()
    
    try:
        payload = {
            "service_codes": ["structural", "electrical", "plumbing", "interior", "estimation"],
            "floors": [GF, FF]
        }
        r = requests.post(f"{BASE_URL}/api/requirement/price", json=payload, timeout=15)
        
        if r.status_code != 200:
            result.add_fail("Step 4", f"Status code {r.status_code}, expected 200")
            return result
        
        data = r.json()
        amounts = {l["code"]: l["amount"] for l in data.get("lines", [])}
        
        expected = {
            "structural": 12420.0,   # 2484 × 5
            "electrical": 6210.0,    # 2484 × 2.5
            "plumbing": 6210.0,      # 2484 × 2.5
            "interior": 29808.0,     # 2484 × 12
            "estimation": 0.0        # FREE
        }
        
        for code, exp_amount in expected.items():
            if code in amounts:
                if amounts[code] == exp_amount:
                    result.add_pass(f"Step 4.{list(expected.keys()).index(code)+1}: {code.capitalize()}", 
                        f"₹{exp_amount}")
                else:
                    result.add_fail(f"Step 4.{list(expected.keys()).index(code)+1}: {code.capitalize()}", 
                        f"₹{amounts[code]}, expected ₹{exp_amount}")
            else:
                result.add_fail(f"Step 4.{list(expected.keys()).index(code)+1}: {code.capitalize()}", 
                    "Service not in response")
        
    except Exception as e:
        result.add_fail("Step 4", f"Exception: {str(e)}")
    
    return result

def test_step_5_elevation_all_views():
    """Step 5: POST /api/requirement/price with elevation and all additional views"""
    print("\n[STEP 5] Testing POST /api/requirement/price - Elevation with all views")
    result = TestResult()
    
    try:
        payload = {
            "service_codes": ["elevation_3d"],
            "floors": [GF, FF],
            "elevation_views": ["Left Design", "Right Design", "Back Design"]
        }
        r = requests.post(f"{BASE_URL}/api/requirement/price", json=payload, timeout=15)
        
        if r.status_code != 200:
            result.add_fail("Step 5", f"Status code {r.status_code}, expected 200")
            return result
        
        data = r.json()
        lines = data.get("lines", [])
        
        if lines:
            line = lines[0]
            # Expected: 8124 (front included) + 3×6499.20 = 27621.60
            expected_amount = 8124.0 + 3 * 6499.2
            
            if line.get("amount") == expected_amount:
                result.add_pass("Step 5.1: Line amount", f"₹{expected_amount} (8124 + 3×6499.2)")
            else:
                result.add_fail("Step 5.1: Line amount", f"₹{line.get('amount')}, expected ₹{expected_amount}")
            
            # Check additional_views count (should be 3: Left, Right, Back)
            addl_views = line.get("additional_views", [])
            if len(addl_views) == 3:
                result.add_pass("Step 5.2: Additional views count", "3 views (Left, Right, Back)")
            else:
                result.add_fail("Step 5.2: Additional views count", f"{len(addl_views)}, expected 3")
        else:
            result.add_fail("Step 5", "No lines returned")
        
    except Exception as e:
        result.add_fail("Step 5", f"Exception: {str(e)}")
    
    return result

def test_step_6_backend_authority():
    """Step 6: POST /api/requirement/submit with spoofed areas - backend should recalculate"""
    print("\n[STEP 6] Testing POST /api/requirement/submit - Backend authority")
    result = TestResult()
    
    try:
        # Create floors with spoofed calculated_area
        gf_spoofed = {**GF, "calculated_area": 99999}
        ff_spoofed = {**FF, "calculated_area": 99999}
        
        payload = {
            "name": "Floor Test",
            "mobile": "9999999999",
            "email": "floortest@example.com",
            "project_name": "Floor Test",
            "service_codes": ["architectural", "elevation_3d"],
            "total_area": 99999,
            "requirement": {
                "storeys": "G+1",
                "floors": [gf_spoofed, ff_spoofed],
                "elevation": {
                    "style": "Modern Design",
                    "views": ["Left Design", "Right Design"]
                }
            }
        }
        
        r = requests.post(f"{BASE_URL}/api/requirement/submit", json=payload, timeout=15)
        
        if r.status_code != 200:
            result.add_fail("Step 6", f"Status code {r.status_code}, expected 200")
            return result
        
        data = r.json()
        lead_id = data.get("lead_id")
        
        # Expected total: architectural 5640 + elevation 8124 + 2×6499.20 = 26762.40
        expected_total = 5640.0 + 8124.0 + 2 * 6499.2
        
        if data.get("total") == expected_total:
            result.add_pass("Step 6.1: Total amount", f"₹{expected_total} (spoofed 99999 ignored)")
        else:
            result.add_fail("Step 6.1: Total amount", f"₹{data.get('total')}, expected ₹{expected_total}")
        
        if lead_id:
            result.add_pass("Step 6.2: Lead created", f"ID: {lead_id}")
            
            # Now verify stored data using motor
            print("  → Verifying stored lead data in MongoDB...")
            import asyncio
            from motor.motor_asyncio import AsyncIOMotorClient
            
            async def verify_lead():
                client = AsyncIOMotorClient("mongodb://localhost:27017")
                db = client["bdesigner"]
                
                lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
                
                if not lead:
                    return False, "Lead not found in database"
                
                # Check requirement.floors[*].calculated_area
                req_floors = lead.get("requirement", {}).get("floors", [])
                if len(req_floors) == 2:
                    if req_floors[0].get("calculated_area") == 1344.0 and req_floors[1].get("calculated_area") == 1140.0:
                        print("    ✓ requirement.floors calculated_area: [1344, 1140]")
                    else:
                        return False, f"Floor areas: [{req_floors[0].get('calculated_area')}, {req_floors[1].get('calculated_area')}], expected [1344, 1140]"
                else:
                    return False, f"Floor count: {len(req_floors)}, expected 2"
                
                # Check requirement.total_built_up_area
                if lead.get("requirement", {}).get("total_built_up_area") == 2484.0:
                    print("    ✓ requirement.total_built_up_area: 2484")
                else:
                    return False, f"total_built_up_area: {lead.get('requirement', {}).get('total_built_up_area')}, expected 2484"
                
                # Check pricing_snapshot
                snapshot = lead.get("pricing_snapshot", {})
                
                # Check floors in snapshot
                snap_floors = snapshot.get("floors", [])
                if len(snap_floors) == 2:
                    if snap_floors[0].get("calculated_area") == 1344.0 and snap_floors[1].get("calculated_area") == 1140.0:
                        print("    ✓ pricing_snapshot.floors: [1344, 1140]")
                    else:
                        return False, f"Snapshot floor areas: [{snap_floors[0].get('calculated_area')}, {snap_floors[1].get('calculated_area')}]"
                
                # Check elevation_views
                if snapshot.get("elevation_views") == ["Left Design", "Right Design"]:
                    print("    ✓ pricing_snapshot.elevation_views: [Left Design, Right Design]")
                
                # Check services have rate snapshots
                services = snapshot.get("services", [])
                if len(services) == 2:
                    for svc in services:
                        if svc.get("ground_floor_rate_snapshot") is not None and svc.get("additional_floor_rate_snapshot") is not None:
                            print(f"    ✓ {svc.get('code')} has rate snapshots")
                
                # Check grand_total
                if snapshot.get("grand_total") == expected_total:
                    print(f"    ✓ pricing_snapshot.grand_total: ₹{expected_total}")
                else:
                    return False, f"grand_total: {snapshot.get('grand_total')}, expected {expected_total}"
                
                # Delete test lead
                await db.leads.delete_one({"id": lead_id})
                print(f"    ✓ Test lead {lead_id} deleted")
                
                return True, "All checks passed"
            
            success, msg = asyncio.run(verify_lead())
            
            if success:
                result.add_pass("Step 6.3: Stored data verification", msg)
            else:
                result.add_fail("Step 6.3: Stored data verification", msg)
        else:
            result.add_fail("Step 6.2: Lead created", "No lead_id returned")
        
    except Exception as e:
        result.add_fail("Step 6", f"Exception: {str(e)}")
    
    return result

def test_step_7_legacy_fallback():
    """Step 7: POST /api/requirement/price with total_area only (legacy fallback)"""
    print("\n[STEP 7] Testing POST /api/requirement/price - Legacy fallback")
    result = TestResult()
    
    try:
        payload = {
            "service_codes": ["architectural"],
            "total_area": 2484
        }
        r = requests.post(f"{BASE_URL}/api/requirement/price", json=payload, timeout=15)
        
        if r.status_code != 200:
            result.add_fail("Step 7", f"Status code {r.status_code}, expected 200")
            return result
        
        data = r.json()
        lines = data.get("lines", [])
        
        if lines:
            line = lines[0]
            # Expected: single ground floor 2484 × 2.5 = 6210
            if line.get("amount") == 6210.0:
                result.add_pass("Step 7.1: Amount", "₹6210 (2484×2.5, treated as single ground floor)")
            else:
                result.add_fail("Step 7.1: Amount", f"₹{line.get('amount')}, expected ₹6210")
        else:
            result.add_fail("Step 7", "No lines returned")
        
    except Exception as e:
        result.add_fail("Step 7", f"Exception: {str(e)}")
    
    return result

def test_step_8_regression():
    """Step 8: Regression tests - health, homepage/sections, projects"""
    print("\n[STEP 8] Testing Regression endpoints")
    result = TestResult()
    
    try:
        # GET /api/health
        r = requests.get(f"{BASE_URL}/api/health", timeout=15)
        if r.status_code == 200:
            result.add_pass("Step 8.1: GET /api/health", "200 OK")
        else:
            result.add_fail("Step 8.1: GET /api/health", f"Status {r.status_code}")
        
        # GET /api/homepage/sections
        r = requests.get(f"{BASE_URL}/api/homepage/sections", timeout=15)
        if r.status_code == 200:
            result.add_pass("Step 8.2: GET /api/homepage/sections", "200 OK")
        else:
            result.add_fail("Step 8.2: GET /api/homepage/sections", f"Status {r.status_code}")
        
        # GET /api/projects
        r = requests.get(f"{BASE_URL}/api/projects", timeout=15)
        if r.status_code == 200:
            result.add_pass("Step 8.3: GET /api/projects", "200 OK")
        else:
            result.add_fail("Step 8.3: GET /api/projects", f"Status {r.status_code}")
        
    except Exception as e:
        result.add_fail("Step 8", f"Exception: {str(e)}")
    
    return result

def main():
    print("="*80)
    print("BDesigner Floor-wise Pricing Deep Fix - Backend Test")
    print("="*80)
    print(f"Backend URL: {BASE_URL}")
    print("="*80)
    
    all_results = []
    
    # Run all test steps
    all_results.append(test_step_1_service_catalog())
    all_results.append(test_step_2_architectural_pricing())
    all_results.append(test_step_3_elevation_pricing())
    all_results.append(test_step_4_other_services())
    all_results.append(test_step_5_elevation_all_views())
    all_results.append(test_step_6_backend_authority())
    all_results.append(test_step_7_legacy_fallback())
    all_results.append(test_step_8_regression())
    
    # Print all summaries
    print("\n\n" + "="*80)
    print("FINAL SUMMARY - ALL STEPS")
    print("="*80)
    
    total_passed = sum(len(r.passed) for r in all_results)
    total_failed = sum(len(r.failed) for r in all_results)
    
    for i, r in enumerate(all_results, 1):
        print(f"\nStep {i}:")
        for detail in r.details:
            print(f"  {detail}")
    
    print("\n" + "="*80)
    print(f"TOTAL PASSED: {total_passed}")
    print(f"TOTAL FAILED: {total_failed}")
    print("="*80)
    
    if total_failed == 0:
        print("\n✅ ALL TESTS PASSED")
        return 0
    else:
        print(f"\n❌ {total_failed} TESTS FAILED")
        return 1

if __name__ == "__main__":
    exit(main())
