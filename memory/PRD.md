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
- P1: When GitHub asset access is restored, replace hero video + logo with the user's newly uploaded assets
- P1: Provide EMERGENT_LLM_KEY to enable Construction Advisor widget
- P2: Build public pages: Projects, How It Works, About, FAQs, Contact (Phase 3)
- P2: Website CMS "Homepage → Hero" tab to edit settings.hero timeline (foundation ready)
- P2: Requirement Form (Phase 7), PWA manifest for real installability

## 2026-09-26 — Homepage Content + Hero + Theme Pass (tested, iteration_2.json 100%)
- Construction Process updated to approved 8-step flow (backend migration + new defaults in homepage_cms.py)
- Trending Projects fixed: backend now seeds 6 portfolio projects (server.py seed_portfolio_projects); cards render both themes
- Light-mode toast fixed: white bg + near-black text (sonner.jsx wired to ThemeContext + .bd-theme-toast CSS)
- Hero: 3 mode buttons (Construction/Morning/Night) seek video to admin-configured timeline points and switch theme (night=dark, morning/construction=light)
- Hero timeline config is admin-configurable via GET /api/settings -> hero (states timestamps 0/19/22, total 23s); HeroModeContext consumes it
- Copy alignment: mobile sticky CTA now 'Plan Your Dream Home'
- NOTE: hero video/logo use existing public/ assets (GitHub access to new uploads was unavailable this session)

## 2026-09-26 — Hero Assets + Theme Logo Update
- User uploaded Hero Video.mp4 (mobile) + red logo (light theme) + white logo (dark theme) via chat attachments
- hero-portrait.mp4 replaced with new mobile hero video (14.6 MB, served 200); landscape unchanged until user provides it
- Theme-based logo swap: white logo on dark theme, red logo on light theme (Navbar + Footer); intro keeps white logo; old CSS brightness(0) filter approach replaced with bd-logo-light/bd-logo-dark display toggles
- settings.logo_light=/bdesigner-logo-red.png, logo_dark=/bdesigner-logo-white.png (admin-config foundation)
- Footer aligned to frozen nav: Company (About Us, Contact Us), Explore (Projects, How It Works, FAQs), Get Started (Plan Your Dream Home, Get BDesigner App, Login), Legal unchanged; legacy links (Our Packages, Cost Calculator, Architectural Services, Testimonials) removed; same honest behaviors as navbar (coming-soon toasts, lead modal, PWA guidance)
