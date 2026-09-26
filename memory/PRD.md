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

## 2026-09-26 — Requirement Form (replaces old enquiry modal)
- New multi-step BDesigner Requirement Form (RequirementForm.jsx + RequirementFormContext) opens from ALL "Plan Your Dream Home" CTAs (navbar, mobile drawer, sticky CTA, footer). Old LeadModal retired from these entry points (still used by other homepage advisor CTAs).
- 8 steps: Services -> Project/Area -> Serviceability -> Construction Req -> Room-per-floor -> Elevation(conditional on 3D) -> Summary -> Registration. Autosave to localStorage; Back preserves data; conditional elevation step.
- Backend (server.py): service_catalog seed + GET /api/requirement/services, POST /api/requirement/price (authoritative: per_sqft=max(area*rate,min), free, fixed), GET /api/requirement/serviceability (from service_area blocks), POST /api/requirement/submit (persists lead + requirement + pricing snapshot to db.leads).
- Registration reuses existing auth register(); phone auth shown DISABLED (Coming Soon); Google disabled (no OAuth configured). Lead attaches client_user_id after register.
- Verified smoke test full flow at 1440: pricing 3600sqft -> Arch ₹43,200 + 3D ₹28,800 = ₹72,000; serviceability Available; summary + Edit/Continue.
- NOT built (per instructions): Client Dashboard, Admin/PM/panels. File upload is local draft only (no storage configured yet).

## 2026-06 — Requirement Form UI/UX Deep Fix (Message 208) — DONE, tested 100% (iteration_3.json)
- Rebuilt the "Plan Your Dream Home" Requirement Form to premium BDesigner DNA, fully theme-aware (light/dark) with gold #C9A24A accents that survive the global monochrome neutralizer.
- Wide 2-COLUMN desktop layout: form (left ~60%) + sticky live "Your Project" summary panel (right ~40%, specs + live price + primary CTA). Single-column full-screen sheet on mobile with a sticky bottom price bar + gold CTA.
- Componentized into reusable primitives in `/app/frontend/src/components/requirement/primitives.jsx`: ReqCard, ReqField, ReqSegmented, ReqCounter, ReqChips, ReqImageCard, ReqRow + ELEV_IMAGES map + rupee().
- Services + Elevation now use IMAGE CARDS (gold check + gold border on select). 4 CUSTOM-GENERATED elevation illustrations (Simple/Modern/Kerala/Classical) hosted on emergent static CDN.
- Scoped `.bd-req-*` CSS block appended to index.css (token-driven, gold accent, 2-col shell, image pick cards, segmented/chip/field/CTA). All 9-step logic (pricing, serviceability, autosave, conditional elevation, register+submit) preserved.
- Robustness: added effect that snaps `step` to a valid step if the conditional elevation step is added/removed (prevents stuck state).
- Verified: full 8-step flow end-to-end (dark), light-theme spot check, mobile 390px entry via drawer; live pricing recompute; elevation images 200; registration creates client account + submits lead + clears draft. No user-facing bugs.

## Backlog (updated)
- P2 (ergonomic, not user-facing): CtaButtons renders req-next/req-edit/req-create-account in both mobile footer and desktop aside (only one visible per breakpoint). Optionally dedupe testids for cleaner automation.
- P2: Real file/object storage for Requirement Form uploads (currently local draft only).
- Deferred by user until form approved: Client Dashboard (post-registration handoff), Admin/PM/Architect/Structural panels, Package Builder, Agreement, Construction Progress, Site Updates.

## 2026-06 — Homepage Trust Content + Requirement Form Precision Fix — DONE, tested 100% (iteration_4.json, backend 9/9 + frontend all items)
- HOMEPAGE Guarantees: replaced legacy items (Money Safety/No Delay/Fixed Pricing/Verified Professionals/Warranty) with 6 current items (Transparent Pricing, Dedicated Project Manager, Structured Design Review, Final Drawings + BOQ, Stage-wise Site Updates, Handover Documentation). Neutral monochrome icons. Data-driven + CMS-ready.
- HOMEPAGE Why Choose: replaced legacy rows (Material Marketplace/Construction ERP/Digital BOQ/etc.) with 9 current differentiators, all BDesigner ✓ / Others PARTIAL. Kept comparison-table UI.
- Backend: updated DEFAULT_GUARANTEES + DEFAULT_COMPARISON in homepage_cms.py + added idempotent content migration (title-set keyed) so existing DBs are force-updated once. GET /api/homepage/sections is source of truth.
- REQUIREMENT FORM precision fixes:
  - Global primary button system now matches Homepage sticky CTA via button-primary tokens (dark=white bg/black text, light=black bg/white text) — NOT gold. `.bd-req-cta` shared class.
  - Service selection: removed gold border/glow; selected = subtle neutral surface + small gold check, no layout shift. Selection controls (segmented/chips/facing/purpose) now neutral selected surface (not gold fill).
  - Icons neutral (theme-aware); gold reserved for eyebrow, price, progress, small check accent.
  - Standard input size ~54px (ReqField everywhere). Facing 2-col ~52px, Purpose 2-col ~54px, amenities readable grid ~48px.
  - Step 2 logic: calculated plot footprint = avg(front,back) × avg(left,right); auto-populates Ground Floor (editable); added storeys start BLANK; values persist; total built-up = sum of ALL floors; live charges compute from total (frontend matches backend). Next disabled + inline per-floor message until all floors valid.
  - Step 3: removed fake map image → clean location card only.
  - Step 7: removed duplicated bottom price block on mobile (only Edit + Continue).
  - Step 8: removed "Continue with Phone" entirely; added prominent Google button with official multicolor G icon + honest "not connected yet" toast (no fake login); phone NUMBER field retained.
- Global rules now encoded in `.bd-req-*` tokens/classes so future screens inherit the button + selection + icon system.

## 2026-09-26 — Website CMS Phase 1 (Homepage) — DONE, tested 100% (iteration_5.json, backend 11/11 + frontend 12/12)
- Dedicated admin auth: `/admin/login` (AdminLogin.jsx) — JWT login via POST /api/auth/login, rejects non-admin roles; admin shell at `/admin` (AdminPanel.jsx) bypasses public chrome (App.js ChromeFrame skips navbar/footer/intro for /admin routes); unauth /admin redirects to /admin/login.
- Bootstrap admin `admin@bdesigner.com` seeded on startup (seed_admin in website_cms.py); temp password printed once to backend logs; creds stored in /app/memory/test_credentials.md.
- Homepage CMS tab: collapsible editors for Hero (video/fallback/logo media + duration + state timeline) and all content sections (eyebrow/heading/subtitle/enabled + per-item title/value/desc/icon/image, reorder, hide/show).
- Real media upload via Emergent Object Storage: POST /api/admin/media/upload (image/video/audio, size+ext validation) -> /api/media/<path> serving with cache headers; MediaField UI with progress bar.
- Draft/Preview/Publish: cms_homepage_draft collection holds working copy; Preview opens `/?cms_preview=1` which renders the REAL public homepage with draft data (admin-token required, no leak without token); Publish atomically copies draft to published collections (homepage_section_settings, homepage_blocks, site_settings.hero/footer).
- Backend test file: /app/backend/tests/test_website_cms.py (11 tests). Public UI unchanged — verified no layout regression.
- Backlog notes (non-blocking): split AdminPanel.jsx as tabs grow; short-lived preview nonce instead of JWT for preview; Mongo transaction around publish delete+insert; login rate-limiting.
