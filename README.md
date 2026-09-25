# BDesigner — Clean Homepage Baseline

This repository is the cleaned starting point for the new BDesigner platform.

## Intentionally preserved

- Existing public Homepage UI
- Intro/loading experience
- Light/Dark theme behavior
- Existing header/navigation + mobile drawer UI
- Existing footer UI
- Login/Create Account modal UI
- Homepage consultation form UI
- Homepage search overlay UI
- Public Project Detail screen used by Trending Projects
- Local public assets used by those screens
- Minimal public API required by the preserved experience
- Current BDesigner product/build documentation in `/docs`

## Intentionally removed

The previous implementation of:

- Construction ERP
- Admin panel
- PM panel
- Client ERP dashboard
- Civil Engineer panel
- Brand Partner portal
- Marketplace/material/product/order system
- CRM/admin lead modules
- Old package/proposal system
- Old agreement/payment/BOQ/estimation/execution modules
- Public standalone pages outside the preserved homepage/project-detail base
- Legacy tests, reports, debug scripts and seed/demo tooling
- Deprecated backend modules
- Repository credential artifact `admin_token.txt`

## Public routes in this baseline

- `/` — Homepage
- `/projects/:id` — Public Project Detail
- `/login` — redirects to Homepage login modal
- `/register` — redirects to Homepage registration modal
- all other legacy routes currently return to `/`

## Stack

Frontend:
- React
- TypeScript is planned for the new build; preserved legacy UI is currently JSX
- Tailwind CSS
- Lucide icons

Backend:
- FastAPI
- MongoDB

## Important

Do not rebuild the preserved Homepage during cleanup. New modules should be
implemented from the documentation in `/docs` after the visual baseline is
verified.
