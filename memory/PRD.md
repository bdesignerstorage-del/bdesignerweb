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

## Known Notes
- Hero video (hero-landscape.mp4) doesn't autoplay in headless screenshot browser — codec limitation, works in real browsers
- EMERGENT_LLM_KEY empty — optional Construction Advisor widget disabled until key provided

## Backlog
- P1: Verify hero video playback in real browser; add poster/fallback if needed
- P1: Provide EMERGENT_LLM_KEY to enable Construction Advisor widget
- P2: Run full E2E test pass (auth, projects, comments, PDF report)
