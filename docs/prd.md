# BDesigner V1 — Product Requirements Document

**Status:** Frozen V1 target + verified clean public baseline  
**Build platform:** Emergent AI  
**Primary product:** Responsive production web application

**Current starting repository:** `BDesigner Homepage Clean Baseline`

The repository is **not a blank project**. The approved public Homepage and Public Project Detail screen already exist and must be preserved while the new platform is built around them.

## 1. Product

BDesigner is a residential architecture + turnkey construction platform for Indian house owners.

Core lifecycle:

**Lead → Project → Architecture → Proposal → Construction → Handover → Completed**

Use one master project throughout. Never split architecture and construction into disconnected projects.

## 1A. Current Clean Baseline — Preserve Before New Development

The cleaned repository is the approved starting point for V1. It intentionally preserves only the public UI foundation and a minimal backend.

### Existing public routes

- `/` — approved Homepage
- `/projects/:id` — approved Public Project Detail
- `/login` — redirects to Homepage and opens existing login modal
- `/register` — redirects to Homepage and opens existing create-account modal
- `/forgot-password` — currently redirects to the existing login/auth flow
- all other legacy routes currently redirect to `/` until rebuilt from this PRD

### Existing public UI that must not be rebuilt during foundation work

- Intro/loading experience
- Hero and background video/image system
- Light/Dark theme behavior
- Navbar
- Mobile hamburger drawer UI
- Search overlay UI
- Footer
- Login/Create Account modal UI
- Homepage lead/consultation modal UI
- About/audio control
- Sticky CTA
- Trust Indicators
- Construction Process
- Available in Bengaluru / service-area section
- Guarantees You Deserve
- Why Choose BDesigner
- Trending Projects
- Homeowner Stories
- FAQ
- Public Project Detail gallery/share/viewer experience

### Existing minimal backend surface

The clean baseline already provides the public API needed by the preserved UI, including:

- `/api/health`
- `/api/auth/register`
- `/api/auth/login`
- `/api/auth/me`
- `/api/auth/logout`
- `/api/auth/forgot` placeholder
- `/api/settings`
- `/api/homepage/sections`
- `/api/projects`
- `/api/projects/{id}`
- public project share/comments
- project-only `/api/search`
- homepage enquiry submission
- lightweight click tracking

New operational modules must be added incrementally. Do not restore the deleted legacy ERP/Admin/PM/Client/Engineer/marketplace code.

## 1B. Verified Public Visual Baseline

A deep code-level visual audit has been completed on the preserved Homepage and Public Project Detail.

The public UI is not merely a mockup reference. It now defines the shared BDesigner product language for future modules:

- final Light/Dark token palette
- Inter-first text hierarchy
- restrained warm-gold accent usage
- border-led card separation
- minimal neutral shadows
- theme-aware glass only where appropriate
- exact section/container spacing rhythm
- subtle 720ms scroll-reveal vocabulary
- 520ms public page entry
- current intro/route/drawer/search transitions
- Project Card geometry and hover behavior
- Project Detail hero/overlap/sticky-tabs/drawing-gallery/fullscreen patterns

Exact specifications live in `design.md` and must be treated as the UI implementation source of truth.

New operational panels may be denser than the public marketing pages, but they must feel like the same BDesigner product and must not introduce a second visual system.

## 2. Business Goals

- Capture qualified residential leads from the public website.
- Show architectural service scope and live design pricing inside the requirement form.
- Convert leads into paid architecture projects.
- Manage drawings, revisions, chat, documents and payments.
- Prepare construction packages/proposals after final design + BOQ.
- Convert suitable projects into turnkey construction.
- Manage agreement, execution, site updates, payments and handover.
- Keep the system simple enough for daily use by a civil engineer.

Primary revenue focus: turnkey residential construction.

## 3. Roles

### Admin
Business-wide control over:
- Dashboard
- Leads
- Projects
- Clients
- Team
- Chat
- Package & Proposal
- Agreements
- Payments
- Documents
- Website CMS
- Pricing
- Package Templates
- Service Areas
- Settings

### Client
Own projects only.

Architecture stage:
- Dashboard
- My Project
- Chat
- Documents
- Payments
- Notifications
- Account
- Construction locked

Construction stage:
- Architecture history remains available
- Construction Overview
- Progress
- Site Updates
- Package / Proposal
- Agreement
- Construction Payments
- Project Library
- Handover

### Project Manager
Assigned projects only. Can coordinate team, review drawings, manage architecture workflow, prepare proposals, manage agreements, activate construction when eligible, manage progress/site updates and handover.

### Architect
Assigned projects only. Can view requirements, upload architectural drafts, receive feedback, upload revisions and submit to PM.

### Structural Designer
Assigned projects only. Can view approved architecture, upload structural drawings, revise and submit to PM.

### Civil Engineer
Assigned construction projects only. Can view approved drawings, update stages/progress, post site updates, upload photos/video and add next activity.

## 4. Public Website

### Intro / Loading
- Full-screen architectural visual
- Dark overlay
- Center welcome text
- Large numeric progress indicator
- Fade into homepage
- No unnecessary controls

### Homepage
The approved homepage is the visual source of truth.

### Existing frozen Homepage sections

Preserve the current implementation and styling of:
- Hero
- Trust Indicators
- Construction Process
- Available in Bengaluru / service area
- Guarantees You Deserve
- Why Choose BDesigner
- Trending Projects
- Homeowner Stories
- FAQ
- Footer
- existing audio/sticky CTA behavior

### Planned Homepage additions/refinements

Add only through an approved future phase, without redesigning the current Homepage:
- Architectural Services section
- About BDesigner content/refinement where required
- Download App / Get BDesigner App install entry
- CMS-driven content controls

Do not remove or rebuild an existing Homepage section merely because it is described differently in this PRD.

### Architectural Services — Homepage Section Only
There is **no separate Architectural Services landing page**.

Services shown inside homepage:
- Architectural Plan
- 3D Elevation
- Interior Design
- Structural Design
- Electrical Design
- Plumbing Design
- Estimation / BOQ

Each service card:
- image/icon
- service name
- short description

Do not add a separate CTA button to every service card.

Use one section-level CTA:

**Plan Your Dream Home**

### Hero Controls
- Construction
- Morning
- Night

Behavior:
- Construction / Morning → light theme
- Night → dark theme
- Slow-motion hero video
- Timeline positions configurable from Admin/settings

### About Audio
- Optional minimal About BDesigner audio control
- Never autoplay
- Audio editable from Website CMS

### Homeowner Stories
Only homepage section that auto-rotates.
- ~5-second interval
- swipe/tap supported
- pause after interaction
- resume after inactivity

### Sticky CTA
**Plan Your Dream Home**
- hidden while hero fully visible
- appears after hero scrolls upward
- stays fixed
- hides at footer
- opens requirement form

## 5. Public Navigation

- Home
- Projects
- How It Works
- About Us
- FAQs
- Contact Us

Bottom:
- Plan Your Dream Home
- Download App / Get BDesigner App
- Login

### Website App Download / Install

The public website must provide a clear **Download App / Get BDesigner App** option so users can return to BDesigner like an app.

V1 remains web-first. CTA behavior:
1. If the installable BDesigner PWA is available on the current device/browser, show **Install App** and trigger the real browser install flow.
2. Once real native Android/iOS apps exist, the same CTA may open the configured Play Store / App Store listing.
3. If neither install method is available, show honest platform guidance or **Coming Soon**. Never simulate a successful app download.

The installed PWA uses the same BDesigner account, FastAPI backend and MongoDB data.

No separate Architectural Services page. If a Services nav item is later used, it scrolls to the homepage section.

No public Construction page.  
No Cost Calculators.

## 6. Public Projects

Content is managed from:

**Admin → Website CMS → Projects**

Public listing:
- image
- title
- location
- short details
- open project

Project detail can contain:
- hero/gallery
- title/location
- plot size
- floors
- budget only if intentionally published
- timeline only if intentionally published
- overview
- 2D Floor Plan
- 3D Elevation
- Interior
- Construction Package summary if published
- Related Projects
- CTA

Private client project data must never be published automatically.

## 7. Standard Public Pages

These are **target V1 pages to rebuild later**. They are not part of the current clean baseline except Public Project Detail.

Required later:
- Projects listing
- How It Works
- About Us
- FAQs
- Contact Us

Not required:
- Architectural Services page
- Construction page
- Cost Calculator pages

## 8. Website CMS

Admin sidebar contains one website management item:

**Website CMS**

Tabs:
1. Homepage
2. Projects
3. Homeowner Stories
4. FAQs
5. About
6. How It Works
7. Contact
8. Media
9. SEO

### Homepage Tab
Admin can edit:
- Hero text/media
- Hero timeline configuration
- Trust content
- Architectural Services content
- Process preview
- Why BDesigner
- Featured Projects selection
- About preview
- Final CTA
- Footer content
- show/hide supported sections

### Projects Tab
- Add/edit/archive/publish portfolio projects
- cover image
- project details
- plans
- elevations
- interiors
- package summary
- order

### Homeowner Stories
- display name
- location
- story
- image
- active/inactive
- order

### FAQs
- category
- question
- answer
- order
- active/inactive

### About
- company story
- images
- About audio
- supporting content

### How It Works
Default flow:
1. Share Requirement
2. Get Pricing
3. Create Account
4. Team Assigned
5. Design & Review
6. Final Drawings + BOQ
7. Construction Proposal
8. Construction Execution

### Contact
- phone
- email
- office details
- working hours if used

### Media
Reusable public media:
- images
- video
- audio

### SEO
- page title
- meta description
- social image
- basic SEO metadata

**CMS edits content only. It is not a page builder.**
Admin must not edit layout, typography, spacing or core responsive design.

## 9. Requirement Form

Frozen guided flow:

1. Select Architectural Services
2. Project / Built-up Area
3. Serviceability
4. Construction Requirement
5. Rooms Per Floor
6. Elevation Details if selected
7. Project Summary + Price
8. Registration
9. Client Dashboard

Global rules:
- mobile-first
- autosave
- Back preserves data
- horizontal-scroll option cards where approved
- no duplicate second row below scrolling cards
- dynamic architectural pricing
- conditional screens
- sticky bottom price/action area where approved
- registration only after summary/pricing

### Service Selection
- Estimation Sheet
- Architectural Plan
- 3D Elevation
- Interior
- Structural
- Electrical
- Plumbing

Pricing comes from **Admin → Pricing**.

### Project Data
- front/back/left/right
- storeys
- per-floor built-up area
- total built-up area
- project name
- uploads

### Serviceability
Check **Admin → Service Areas**.

If unavailable:
- show Construction Not Available Yet
- architecture can continue

### Construction Requirement
- Yes / No / Maybe Later
- Vastu
- Facing
- Family members
- Bike parking
- Car parking

### Floor Requirements
One floor at a time:
- purpose
- bedrooms
- master bedrooms
- indoor amenities
- outdoor amenities
- additional requirements

### Elevation
Only if 3D Elevation selected:
- Simple
- Modern
- Kerala
- Classical
- Front / Left / Right / Back views

### Summary
Show:
- location
- floors
- built-up area
- selected services
- service-wise charges
- total design charges
- construction interest
- requirement summary

Actions:
- Edit Requirement
- Continue With This Project

### Registration
Enabled:
- email/password

Optional:
- Google login if real credentials configured

Phone OTP:
- disabled
- Coming Soon

## 10. Client Architecture Experience

### Mobile Client Panel Navigation

When the client enters the authenticated panel on mobile, use a persistent app-style shell based on the approved reference.

#### Sticky Top Bar
- Left: hamburger / three-line menu
- Center: BDesigner logo/wordmark
- Right: Light/Dark theme toggle
- Far right: Notifications icon with unread badge when applicable

The logo must remain visually centered and must not shift because of the left/right actions.

The hamburger opens secondary destinations such as:
- Chat
- Drawings
- Documents
- Payments
- Book A Call
- Notifications
- Help / Support
- Logout

#### Fixed Bottom Bar
Always fixed to the mobile viewport bottom, above the device safe area.

From left to right:
1. Home
2. Search
3. Project
4. Site Updates
5. Account

Behavior:
- **Home** → client dashboard
- **Search** → search only the client's permitted projects, drawings/documents and relevant updates
- **Project** → current project; if multiple projects exist, open My Projects first
- **Site Updates** → construction site-update feed
- **Account** → profile/account

The center **Project** item may be visually emphasized/raised using the muted-gold BDesigner accent, matching the approved reference.

Before construction activation, keep Site Updates in the same position and show a locked/empty state such as **Available after construction starts**. Do not reshuffle the bottom navigation.

Desktop/tablet can continue to use the approved sidebar/top-navigation pattern.

### Construction Access
Construction remains locked until Admin/PM activation.

### Dashboard
- project summary
- current stage
- progress
- start date
- expected/days remaining where appropriate
- built-up area
- floors
- facing
- selected services
- team
- Book A Call
- Track Project Status
- payment summary
- recent updates

### My Projects
If one project, direct open is allowed.
If multiple, show cards with:
- image
- project name/ID
- location
- phase
- current stage
- progress
- Open Project

## 11. Drawings & Revisions

Possible drawing services:
- Architectural Plan
- 3D Elevation
- Interior
- Structural
- Electrical
- Plumbing
- Estimation / BOQ

Flow:
**Architect Upload → PM Review → PM Sends Client → Client Approve / Request Changes**

Client viewer:
- preview
- fullscreen
- zoom
- pan
- swipe
- download

Revision counters:
- included
- completed
- remaining
- extra

A revision is based on a real client feedback/revision cycle, not every upload.

## 12. Project Chat

One project chat.

Members may include:
- Client
- PM
- Architect
- Structural Designer
- Civil Engineer

Only assigned members.

Supports:
- text
- image
- document/PDF
- link
- audio
- design review card
- system messages

PM/Admin can enable/disable member chat access.

Internal Notes are separate and staff-only.

## 13. Documents

Official archive categories:

Architecture:
- Architectural
- 3D Elevation
- Interior
- Structural
- Electrical
- Plumbing
- Estimation / BOQ
- Payments / Invoices

Construction adds:
- Package & Proposal
- Agreements
- Site Documents
- Completion Documents

Statuses:
- Draft
- Final
- Approved
- Superseded

Client:
- View
- Download

A chat attachment is not automatically an official document.

## 14. Notifications

Important events only:
- team assignment
- drawing ready
- approval required
- revision request
- payment due/received
- proposal ready
- agreement ready
- construction activated
- site update
- stage completed
- call reminder
- completion

## 15. Payments

Architecture:
- total fee
- paid
- balance
- service billing
- payment history
- invoices
- receipts

Construction:
- contract value
- paid
- balance
- milestones
- approved variations
- payment history
- invoices
- receipts

If no payment gateway:
- disable real online checkout
- Admin can record manual/offline payment
- never fake payment success

## 16. Architecture Workflow

Statuses:
- Requirement Received
- Payment Pending
- Design Started
- PM Review
- Client Review
- Revision
- Finalization
- Architecture Completed

Completion requires:
- purchased services complete
- required final files uploaded
- client approvals complete
- required payments complete
- BOQ ready where required

Admin/PM explicitly marks Architecture Completed.

Architecture completion does not activate construction.

## 17. Package Builder

Frozen steps:
1. Project Summary
2. Package Setup
3. Specifications
4. Inclusions / Exclusions
5. Upgrades / Variations
6. Cost Summary
7. Payment Schedule
8. Timeline
9. Proposal Preview

### Package Setup
- package name
- Basic / Standard / Premium / Custom
- rate/sq.ft.
- built-up area
- base value
- estimated duration
- description

Base:
**Built-up Area × Rate**

### Specifications
Categories:
- Structure
- Masonry
- Waterproofing
- Plaster
- Flooring
- Doors
- Windows
- Kitchen
- Plumbing
- Sanitary
- Electrical
- Painting
- Railings
- Water Storage
- External Works
- Custom

Each item:
- item name
- brand
- specification
- allowance/rate
- included/excluded
- notes

### Variations
Types:
- allowance upgrade
- quantity-based extra
- fixed-price extra

Statuses:
- Draft
- Client Discussion
- Approved
- Rejected

Only Approved variations affect total.

### Cost
**Base + Approved Variations + Additional Works − Discount + Applicable Tax**

Tax mode:
- Inclusive
- Additional
- Not Applicable

Admin final-value override:
- confirmation required
- reason required
- audit history

### Payment Schedule
Milestone-based.
Must total 100%.

### Timeline
- estimated start
- estimated duration
- expected completion
- proposal valid until
- client notes
- internal notes

No Gantt.

### Proposal States
- Draft
- Published
- Discussion Requested
- Revised
- Accepted
- Superseded
- Withdrawn if needed

### Versioning
Published versions are historical snapshots.

Accepted version:
- no edit
- no delete
- remains viewable/downloadable

Changes after acceptance require new version/addendum.

### Client Proposal
Client:
- View
- Download PDF
- Request Discussion
- Accept

No client editing.

## 18. Package Templates

Location:

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

PM copies template into project package.

Changing template does not change already-published/accepted proposals.

## 19. Pricing

Location:

**Admin → Pricing**

Architectural:
- service
- pricing type
- rate
- minimum charge
- included revisions
- extra revision rate
- active/inactive

Construction:
- Basic/Standard/Premium base rate
- description
- active/inactive

Master pricing changes affect new calculations/new proposals only.

Historical confirmed prices remain unchanged.

## 20. Service Areas

Location:

**Admin → Service Areas**

Manage:
- city
- area
- PIN
- active/inactive

Controls construction availability only.

## 21. Agreement

Flow:
**Proposal Accepted → Agreement Prepared → Client Reviews → Agreement Confirmed → Initial Payment → Activate Construction**

Client can:
- View
- Download
- Request Discussion
- Confirm Agreement

V1 confirmation is in-platform acknowledgement, not legal e-signature.

## 22. Construction Activation

Admin/PM checklist:
- Architecture Completed
- BOQ ready
- serviceable
- proposal accepted
- agreement confirmed
- initial payment confirmed

Action:
**Activate Construction**

Then:
- same project moves to Construction
- client construction navigation unlocks
- Civil Engineer can be assigned
- architecture history remains

## 23. Construction

Client dashboard:
- project summary
- overall progress
- current stage
- stage progress
- start date
- expected completion
- latest site update
- next activity
- team
- current payment milestone
- action required
- quick links

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

Statuses:
- Not Started
- In Progress
- Completed
- On Hold

Progress is manual in V1.

## 24. Site Updates

Fields:
- date/time
- stage
- uploader
- type
- note
- photos
- optional video
- progress
- next activity
- expected date

Types:
- Progress Update
- Stage Completed
- Upcoming Work
- Issue / Hold
- Client Action Required

Client is view-only.

## 25. Handover

Checklist:
- stages complete
- pending/snags cleared
- final inspection
- final payment
- final photos
- completion documents
- warranty documents

Action:
**Complete & Handover Project**

Client completion:
- Your Home Is Ready
- Project Completed
- final gallery
- completion date
- final value
- package
- PM
- Civil Engineer
- final documents
- feedback

## 26. Final Admin Sidebar

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

## 27. Admin Dashboard

Cards:
- New Leads
- Active Architecture Projects
- Construction Projects
- Pending Payments

Sections:
- Recent Leads
- Projects Requiring Attention
- Recent Activity

No heavy analytics.

## 28. Admin Leads

Actions:
- Add
- View
- Edit
- Delete safe unconverted lead
- Close
- Assign PM
- Convert to Project

Statuses:
- New
- Contacted
- Registered
- Converted
- Closed

## 29. Admin Projects

Tabs:
- Overview
- Client
- Team
- Architecture
- Construction
- Chat
- Payments
- Documents
- Activity

Prefer Archive over destructive deletion when history exists.

## 30. Team Panels

### PM Sidebar
- Dashboard
- My Projects
- Chat
- Notifications
- Drawings
- Documents
- Package & Proposal
- Construction Progress
- Profile
- Help
- Logout

### Architect Sidebar
- Dashboard
- My Projects
- Chat
- Notifications
- Drawings
- Documents
- Profile
- Help
- Logout

### Structural Sidebar
- Dashboard
- My Projects
- Chat
- Notifications
- Structural Drawings
- Documents
- Profile
- Help
- Logout

### Civil Engineer Sidebar
- Dashboard
- My Projects
- Chat
- Notifications
- Progress
- Site Updates
- Drawings
- Documents
- Profile
- Help
- Logout

## 31. V1 Non-Goals

Do not build:
- separate Architectural Services landing page
- public Construction page
- public cost calculators
- ERP
- procurement
- vendors
- inventory
- labour attendance
- payroll
- accounting
- advanced CRM
- marketing automation
- heavy analytics
- Gantt
- CAD/BIM editor
- structural analysis
- automated BOQ
- AI package generation
- legal e-signature
- fake payment processing
- fake OTP
- React Native/Expo frontend for the first web build

## 32. Acceptance

A feature is complete only when:
- approved UI is preserved
- mobile works
- desktop works
- permissions are enforced
- data persists
- loading/empty/error states exist
- historical commercial records are protected
- external integrations are honest
- critical flow is tested


### Public visual regression acceptance

Before a shared visual/theme/component change is approved:

- compare `/` and `/projects/:id` against the preserved reference and current verified baseline
- verify 390px, 430px, 768px, 1024px and 1440px
- verify both Light and Dark where applicable
- verify no horizontal page overflow
- verify Intro, Navbar, drawer, search, auth modal, audio, sticky CTA and Footer layering
- verify Project Detail overlap card, sticky tabs, A4 galleries and fullscreen viewer
- verify motion respects `prefers-reduced-motion`

A backend/business feature is not allowed to silently redesign the public baseline.

## 33. Mobile App-Shell Acceptance

The mobile authenticated client experience is incomplete unless:
- sticky top bar is present
- hamburger opens secondary navigation
- BDesigner logo is centered
- theme toggle works
- notification icon/badge works
- bottom navigation remains fixed
- bottom order is Home / Search / Project / Site Updates / Account
- active destination has clear selected state
- Project may use the approved emphasized center treatment
- content never sits behind the fixed navigation
- safe-area inset is respected
- Site Updates shows a locked/empty state before construction
- the public website exposes a real Download App / install option without fake store behavior
