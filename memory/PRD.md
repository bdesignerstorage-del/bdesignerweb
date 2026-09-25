# BDesigner Web — PRD

## Original Problem Statement
"already connected to github now pull repo from bdesignerweb & show preview"

## Architecture
- FastAPI backend (`/app/backend/server.py`) + MongoDB (motor) on port 8001
- React 19 + CRA/craco + Tailwind frontend (`/app/frontend`) on port 3000
- Source pulled from GitHub repo: bdesignerstorage-del/bdesignerweb (zip extracted to /app root)

## What's Been Implemented
- 2026-09-25: Pulled repo `bdesignerweb`, extracted `BDesigner_Homepage_Clean_Baseline_v3_Exact_UI_DNA.zip`
- Moved backend/frontend into /app root, created .env files (MONGO_URL, DB_NAME, JWT_SECRET, REACT_APP_BACKEND_URL)
- Installed deps (pip + yarn), restarted supervisor services
- Verified: `/api/health` returns ok, homepage renders (nav, hero, stats, construction process, service areas, audio widget)
- 2026-09-25: PUBLIC UI CORRECTION PASS (tested 100%, /app/test_reports/iteration_1.json):
  - Navbar CTA "Book Free Consultation" → "Plan Your Dream Home" (ClipboardList icon, opens lead/enquiry modal as temporary requirement entry)
  - AuthModal close X fixed (was invisible in dark mode: `text-ink-900` token flipped to #F5F5F5 on white circle; now fixed #111) — shared by Login + Create Account
  - Removed "Talk to an Expert" (ConstructionProcess) and "Check Availability" (AvailableInBengaluru)
  - Mobile drawer IA rebuilt: NAVIGATION (Home/Projects/How It Works/About Us/FAQs/Contact Us) + GET STARTED (Plan Your Dream Home/Get BDesigner App/Login) + APPEARANCE; old items (House Construction, Architectural Services, Free Estimate, Our Packages, Testimonials, News & Media) removed
  - Desktop nav = frozen 6 items; old mega-menu removed; nav/drawer breakpoint md→lg
  - Unbuilt pages show honest "coming soon" toast; Projects scrolls to Trending Projects rail; Get BDesigner App = PWA prompt or honest Add-to-Home-Screen toast

## Known Notes
- Hero video (hero-landscape.mp4) doesn't autoplay in headless screenshot browser — codec limitation, works in real browsers
- EMERGENT_LLM_KEY empty — optional Construction Advisor widget disabled until key provided
- Mobile-only sticky bottom bar (BDStickyCta) still says "Book Free Consultation" — OUT OF SCOPE of correction pass, awaiting user approval to align

## Backlog
- P1: Align BDStickyCta label with "Plan Your Dream Home" (pending user approval)
- P1: Provide EMERGENT_LLM_KEY to enable Construction Advisor widget
- P2: Build public pages: Projects, How It Works, About, FAQs, Contact (Phase 3)
- P2: Requirement Form (Phase 7), PWA manifest for real installability
