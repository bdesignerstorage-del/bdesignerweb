# BDesigner V1 — Project Memory

Use this as the concise final context for Emergent AI.

## Product

BDesigner is a residential architecture + turnkey construction platform for Indian house owners.

Architecture:
- Pan India

Construction:
- selected service areas configured by Admin

Primary revenue:
- turnkey construction

## Core Lifecycle

Always use:

**Lead → Project → Architecture → Proposal → Construction → Handover → Completed**

One master project throughout.

## Current Starting Repository

The project starts from **BDesigner Homepage Clean Baseline**, not an empty Emergent app.

Preserved now:
- `/` Homepage
- `/projects/:id` Public Project Detail
- intro/loading
- hero/background video/image system
- light/dark theme
- Navbar + mobile drawer
- Search overlay
- Footer
- Login/Create Account modal
- Homepage lead modal
- audio/sticky CTA
- Homepage sections
- minimal FastAPI/MongoDB public API

Deleted legacy Admin/PM/Client ERP/Civil/Brand/marketplace/commercial modules must **not** be restored. Rebuild new panels from these docs.

## Build Platform

Current V1 stack:
- React 19 web frontend
- JavaScript / JSX
- Create React App + CRACO
- Tailwind CSS 3.4
- Lucide React
- FastAPI backend
- Motor + MongoDB
- JWT/bcrypt auth foundation
- GitHub
- Emergent Preview + production deployment

Do not migrate the current V1 to Next.js or TypeScript unless explicitly approved.

Do not use React Native/Expo for the V1 website.

Future:
- Expo/React Native mobile frontend
- same FastAPI backend
- same MongoDB
- same login/accounts

## Roles

- Admin
- Client
- PM
- Architect
- Structural Designer
- Civil Engineer

No extra V1 roles.

## Frozen Design

- premium dark
- warm light mode
- charcoal cards
- warm white text
- muted gold
- rounded cards
- thin borders
- Inter/Manrope
- Lucide outline icons
- architectural imagery
- mobile-first public/client UI
- compact desktop admin UI

Do not redesign.

## Verified UI DNA — Remember This

The preserved Homepage and Public Project Detail have been code-audited. Future screens must extend this exact design language.

### Final palette

Dark:
- canvas `#0B0B0B`
- secondary `#111111`
- card `#151515`
- elevated `#1A1A1A`
- border `#292929`
- primary text `#F5F5F5`
- secondary `#B5B5B5`
- muted `#777777`

Light:
- canvas `#F7F7F7`
- cards `#FFFFFF`
- borders `#D9D9D9`
- primary text `#111111`
- secondary `#555555`
- muted `#888888`

Accent:
- warm gold `#C9A24A` only for eyebrow/category/price/rating/premium micro-emphasis
- no gold glow or large gold surfaces

### Typography

- Inter is the main body **and heading** family
- body `16px / 1.6`, tracking `-0.011em`
- display uses Inter 700 with negative tracking
- common section headings `24 → 30 → 36px`
- eyebrow `11–12px`, uppercase, tracking about `0.18em`

### Spacing

- public container max about 1280px
- horizontal padding `16 / 24 / 32px`
- major section vertical padding usually `40 / 56px`
- card gaps usually `12–20px`

### Motion

- section reveal `720ms`, `translateY(24px)`, cubic `(0.22,1,0.36,1)`
- page entry `520ms`, `translateY(10px)`
- theme/nav/drawer around `300ms`
- search entry `220ms`
- Project card hover `300ms`, image zoom `700ms` to `1.05`
- panels should not play full public marketing transitions on every route

### Project visual patterns

Project card:
- widths `200 / 240 / 280px`
- square image
- 16px body padding
- 18px/600/1.4 title
- style → title → price → views/shares

Project Detail:
- hero `52vh / 62vh`
- summary card overlaps hero
- sticky tabs below 64px navbar
- drawing gallery uses A4 `210:297`, max width `560px`
- fullscreen viewer supports zoom/pinch/pan/swipe/keyboard

### Important

`index.css` contains old visual declarations and newer final overrides. Always follow the **final effective cascade** documented in `design.md`, not an earlier comment or old gold utility.

## Current Public Route Status

Existing now:
- `/` Homepage
- `/projects/:id` Public Project Detail
- `/login` and `/register` redirect into the Homepage auth modal
- other old routes redirect to `/` until rebuilt

The Homepage is a preserved approved asset. Do not regenerate it from scratch.

## Public Website Final Scope

Required:
- Intro/loading
- Homepage
- Projects
- Project Detail
- How It Works
- About
- FAQs
- Contact
- Login/Register
- Requirement form

Removed:
- separate Architectural Services page
- public Construction page
- Cost Calculators

Architectural Services is a Homepage section only.

Services:
- Architectural Plan
- 3D Elevation
- Interior
- Structural
- Electrical
- Plumbing
- Estimation / BOQ

Cards are informational.

No separate button on every service.

One CTA:
**Plan Your Dream Home**

## Homepage Behavior

Hero:
- Construction / Morning / Night
- Night → dark
- Construction/Morning → light
- slow-motion video
- configurable timeline points

About:
- optional audio
- no autoplay

Homeowner Stories:
- only auto-rotating content section
- ~5 seconds
- manual swipe/tap
- pause after interaction
- resume later

Sticky CTA:
- appears after hero
- hides at footer

## Public Navigation

- Home
- Projects
- How It Works
- About Us
- FAQs
- Contact Us
- Plan Your Dream Home
- Login

No separate Services route.

## Website CMS

One Admin sidebar item:

**Website CMS**

Tabs:
- Homepage
- Projects
- Homeowner Stories
- FAQs
- About
- How It Works
- Contact
- Media
- SEO

Homepage sub-content:
- Hero
- Trust
- Architectural Services
- Process
- Why BDesigner
- Featured Projects
- Homeowner Stories preview
- About
- Final CTA
- Footer

CMS edits content only.

No page builder.

## Requirement Form

Final flow:
1. Select Architectural Services
2. Project / built-up area
3. Serviceability
4. Construction requirement
5. Floor-wise rooms
6. Elevation if selected
7. Summary + architectural price
8. Registration
9. Client dashboard

Rules:
- horizontal cards
- no duplicate row
- autosave
- Back preserves data
- architecture continues if construction unavailable
- register after summary
- phone OTP disabled/Coming Soon
- pricing from Admin Pricing

## Admin Pricing

**Admin → Pricing**

Controls:
- pricing type
- rate
- minimum charge
- included revisions
- extra revision rate
- construction base rates

New pricing affects new calculations.

Historical confirmed prices stay unchanged.

## Package Templates

**Admin → Package Templates**

Admin manages:
- Basic
- Standard
- Premium
- Custom

Template contains:
- rate
- specifications
- allowances
- inclusions
- exclusions
- payment milestones

PM copies template into project.

Master template changes do not change historical proposals.

## Service Areas

**Admin → Service Areas**

Manage:
- city
- area
- PIN
- active/inactive

Controls construction availability only.

## Mobile Client Panel — Final Navigation

When a client enters the authenticated panel on mobile:

### Sticky Top Bar
- hamburger at left
- BDesigner logo centered
- Light/Dark toggle at right
- notification bell at far right

### Fixed Bottom Bar
From left:
1. Home
2. Search
3. Project
4. Site Updates
5. Account

Project may use the approved raised/muted-gold center treatment.

Behavior:
- Home → dashboard
- Search → client's authorized project/document/update search
- Project → current project or My Projects if multiple
- Site Updates → construction updates
- Account → profile

Before construction, Site Updates remains visible but shows **Available after construction starts**.

Secondary navigation such as Chat, Drawings, Documents, Payments, Book A Call, Help and Logout is accessed from the hamburger drawer.

Desktop keeps the approved sidebar/top-navigation structure.

## Website App Install

Public website includes **Download App / Get BDesigner App**.

V1:
- install the React web app as PWA when supported
- otherwise show Add to Home Screen guidance or honest Coming Soon
- later use real Play Store/App Store links once the native app exists

Never fake a native app download/install.

## Drawings

Flow:

**Architect Upload → PM Review → PM Sends Client → Client Approve / Request Changes**

Revision count is based on real feedback/revision cycles.

## Chat

One project chat.

Participants can include:
- Client
- PM
- Architect
- Structural Designer
- Civil Engineer

Assigned members only.

Supports:
- text
- image
- docs
- link
- audio
- design review
- system messages

Internal Notes are staff-only.

## Documents

Official library.

Architecture:
- Architectural
- Elevation
- Interior
- Structural
- Electrical
- Plumbing
- Estimation / BOQ
- Payments

Construction adds:
- Proposal
- Agreement
- Site
- Completion

Chat file is not automatically official.

## Architecture Completion

Admin/PM completes architecture only when:
- purchased services done
- final files ready
- approvals complete
- required payments complete
- BOQ ready where required

Architecture completion does not activate construction.

## Package Builder

Frozen steps:
1. Project Summary
2. Package Setup
3. Specifications
4. Inclusions / Exclusions
5. Variations
6. Cost Summary
7. Payment Schedule
8. Timeline
9. Preview

Important:
- payment schedule = 100%
- approved variations only affect final amount
- accepted proposal is immutable
- version history mandatory

## Proposal Flow

Architecture Completed  
→ Prepare Proposal  
→ Publish  
→ Client Review  
→ Discussion/Revision  
→ Accept  
→ Agreement  
→ Initial Payment  
→ Activate Construction

Same project continues.

## Construction

Client sees:
- Dashboard
- Progress
- Site Updates
- Package / Proposal
- Agreement
- Payments
- Project Library

Default stages:
1. Site Preparation
2. Excavation
3. Foundation
4. Plinth
5. RCC Structure
6. Masonry
7. Plaster
8. Electrical
9. Plumbing
10. Flooring
11. Painting
12. Fixtures
13. Finishing
14. Handover

Progress is manual.

## Handover

Checklist:
- stages complete
- pending work cleared
- final inspection
- final payment
- final photos
- completion docs
- warranty docs

Client:
- Your Home Is Ready
- Project Completed
- final summary
- gallery
- final documents
- feedback

## Final Admin Sidebar

### MAIN
- Dashboard
- Leads
- Projects
- Clients
- Team
- Chat

### COMMERCIAL
- Package & Proposal
- Agreements
- Payments
- Documents

### WEBSITE
- Website CMS

### CONFIGURATION
- Pricing
- Package Templates
- Service Areas
- Settings

## PM

Assigned projects only.

Can:
- coordinate team
- review architecture
- manage chat
- complete architecture
- prepare proposal
- manage agreement
- activate construction
- manage progress
- coordinate handover

No global pricing/service area/company control.

## Architect

Can:
- view requirements
- upload drawings
- receive feedback
- revise
- submit to PM

Cannot manage pricing, proposal, payments, team or construction.

## Structural Designer

Can:
- view approved architecture
- upload structural drawings
- revise

No structural analysis engine.

## Civil Engineer

Can:
- view approved drawings
- update stages/progress
- post site updates
- upload site media
- add next activity
- create action-required updates

No procurement/inventory/attendance.

## Technology Rules

Frontend:
- React 19 web
- JavaScript / JSX
- CRA + CRACO
- Tailwind
- Lucide

Backend:
- FastAPI

Database:
- MongoDB

Storage:
- external storage for large files

Auth:
- email/password
- forgot password
- Google optional
- phone OTP disabled

Payments:
- manual recording supported
- online only with real provider credentials
- never fake success

## Non-Goals

Do not build:
- separate service landing page
- public construction page
- cost calculators
- ERP
- procurement
- vendor system
- inventory
- attendance
- payroll
- accounting
- advanced CRM
- advanced analytics
- Gantt
- CAD/BIM
- structural analysis
- automated BOQ
- AI package generation
- digital signature
- complex chat channels
- React Native for initial web V1

## Final Decision Rule

When uncertain:
1. preserve frozen UI
2. preserve one-project lifecycle
3. preserve history
4. keep workflow simple
5. keep normal business values editable in Admin
6. do not invent features
7. keep FastAPI authoritative for permissions and business logic
