# BDesigner V1 — Strict Emergent Build Rules

These rules are mandatory for Emergent AI and all future contributors.

## 1. Documentation Priority

Before coding, read in this order:

1. `rules.md`
2. `prd.md`
3. `design.md`
4. `architecture.md`
5. `task.md`
6. `memory.md`

If something conflicts, follow the higher document.

## 1A. Clean Baseline Is Protected

The cleaned repository is the starting point, not disposable scaffolding.

Preserve:
- `/` Homepage
- `/projects/:id` Public Project Detail
- Intro/loading
- hero/background media behavior
- light/dark theme
- Navbar and mobile drawer UI
- Footer
- auth modal UI
- search overlay UI
- Homepage lead modal
- sticky CTA/audio UI
- current public API compatibility

Do not restore deleted legacy ERP/Admin/PM/Client/Engineer/marketplace modules. New panels must be rebuilt from these docs.

Do not replace the repository with a new scaffold merely because another framework is preferred.

## 2. Frozen UI

Do not redesign approved BDesigner UI.

Do not:
- introduce a generic SaaS theme
- change card language
- change typography without approval
- change navigation without approval
- add unnecessary buttons
- add new sections because they seem useful

Desktop adapts the approved UI; it does not replace it.

## 2A. Verified Public UI DNA Must Be Reused

The public Homepage and Public Project Detail have now been code-audited. `design.md` contains the exact effective token/motion/component rules.

For every new Client/Admin/PM/Architect/Structural/Civil screen:

- use the final Light/Dark tokens from `design.md`
- use Inter-first typography
- use the existing radius/border/card hierarchy
- use Lucide icons
- use monochrome primary button inversion
- reserve `#C9A24A` gold for approved accent roles only
- do not create gold glows
- do not invent random gradients or pastel cards
- reuse the current page/section motion vocabulary
- panel route changes should remain fast and should not play the full public marketing route veil
- use the current Project Card / Project Detail gallery language when showing projects or drawings
- use the current A4 `210:297` drawing-card pattern for plan/drawing previews unless a different document ratio is required

When old CSS comments conflict with final CSS rules, use the final effective cascade documented in `design.md`.

## 3. Web First

V1 is a responsive web application.

Use the existing clean baseline:
- React 19 web frontend
- JavaScript / JSX
- CRA + CRACO
- Tailwind CSS
- FastAPI backend
- MongoDB

Do **not** migrate the V1 repository to Next.js or TypeScript unless the user explicitly approves that migration.

Do not build Expo/React Native for the initial website.

## 4. One Master Project

Mandatory lifecycle:

**Lead → Project → Architecture → Proposal → Construction → Handover → Completed**

Never create separate architecture and construction projects for the same job.

## 5. Fixed Roles

- Admin
- Client
- PM
- Architect
- Structural Designer
- Civil Engineer

No extra V1 roles.

## 6. Backend Authorization

Every private FastAPI endpoint must verify:
- authentication
- role
- project ownership/membership
- allowed action

Do not rely on hidden frontend buttons as security.

## 7. No Separate Architectural Services Page

Architectural Services exists only as a Homepage section.

Do not create:
- `/services`
- separate service landing pages
- separate CTA buttons on every service card

Use one section CTA:

**Plan Your Dream Home**

## 8. Public Navigation

- Home
- Projects
- How It Works
- About Us
- FAQs
- Contact Us
- Plan Your Dream Home
- Login

If Services appears in navigation, it scrolls to the Homepage service section.

## 9. Removed Public Features

Do not build:
- public Construction page
- public cost calculators

The requirement form may calculate architectural charges using Admin Pricing.

## 10. One Website CMS

Admin sidebar contains one website-management item:

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

Do not create separate sidebar items for each CMS content area.

## 11. CMS Edits Content Only

Admin can edit:
- text
- images
- video
- audio
- ordering where allowed
- show/hide where allowed
- public portfolio data
- FAQs
- stories
- SEO basics

Admin cannot edit:
- CSS
- layout structure
- typography
- spacing
- component design
- responsive rules

No drag-and-drop page builder.

## 12. Pricing Is Separate

Use:

**Admin → Pricing**

Pricing controls:
- architectural pricing type
- rate
- minimum charge
- included revisions
- extra revision price
- construction base rates

Do not store business pricing inside CMS copy.

## 13. Package Templates Are Separate

Use:

**Admin → Package Templates**

Admin edits master templates.

PM can copy a template into a project.

PM cannot alter the master template.

Template changes must not change published/accepted proposal history.

## 14. Service Areas Are Separate

Use:

**Admin → Service Areas**

Requirement form checks serviceability from this configuration.

## 15. Requirement Form Rules

Mandatory:
- preserve Back data
- autosave
- mobile-first
- horizontal-scroll cards where approved
- no duplicated second row
- dynamic architectural pricing
- conditional elevation step
- architecture continues when construction unavailable
- registration after summary/pricing

Do not add extra form steps without approval.

## 16. Backend Pricing Authority

Frontend may display live price.

FastAPI must validate official pricing.

Do not hardcode rates in React components.

## 17. Preserve Historical Pricing

Changing current Admin pricing must not modify:
- old confirmed quote
- paid service amount
- published proposal
- accepted proposal
- invoice
- receipt

Snapshot historical commercial values.

## 18. Phone OTP

Phone OTP is disabled in V1.

If shown:
- disabled
- Coming Soon

Never fake OTP verification.

## 19. External Integrations

For Google login, payment, maps, email, file storage or OTP:

If real credentials are missing:
- disable feature or use approved fallback
- do not simulate success

## 20. Payments

Never fake a successful online payment.

Without gateway:
- allow Admin manual payment recording
- keep client payment state accurate
- disable actual online checkout

## 21. Large Files

Do not store large image/video/PDF/CAD binaries in normal MongoDB documents.

Use external object/media storage.

MongoDB stores metadata/reference.

## 22. Public vs Private Media

Public CMS media may be public/CDN accessible.

Private project files require authorization.

Never expose private files through public routes.

## 23. Client Architecture Navigation

Before construction:
- Dashboard
- My Project
- Chat
- Documents
- Payments
- Notifications
- Account
- Construction locked

Do not put every project sub-feature in sidebar.

## 24. Construction Activation

Required sequence:

Architecture Complete  
→ Proposal  
→ Client Acceptance  
→ Agreement Confirmation  
→ Initial Payment  
→ Admin/PM Activate Construction

Do not auto-activate construction.

## 25. One Project Chat

V1 has one project chat.

Do not build:
- Slack-style channels
- department chats
- separate proposal negotiation chat

Internal notes are separate and staff-only.

## 26. Drawing Workflow

**Architect Upload → PM Review → PM Sends Client → Client Approve / Request Changes**

Architect cannot approve for client.

## 27. Revision Counting

A revision is based on a real client feedback/revision cycle.

Do not count every file upload.

## 28. Documents

Project Documents is the official archive.

Chat attachments are not automatically official.

Client can View/Download only.

## 29. Package Builder Steps

Fixed:
1. Project Summary
2. Package Setup
3. Specifications
4. Inclusions / Exclusions
5. Variations
6. Cost
7. Payments
8. Timeline
9. Preview

Do not add procurement/vendor/inventory functions.

## 30. Proposal Versioning

Draft:
- editable
- deletable when safe

Published:
- immutable historical version
- revision can be created

Accepted:
- locked
- no edit
- no delete

New changes require new version/addendum.

## 31. Payment Schedule

Before publish:
- total percentage must equal 100%
- calculated total must match proposal value within rounding tolerance

## 32. Construction Progress

Manual in V1.

PM/Civil Engineer updates:
- status
- progress
- dates
- notes
- photos
- next activity

Do not derive progress from BOQ/materials.

## 33. Site Updates

Client is view-only.

PM/Civil can create/update according to permissions.

No labour/material inventory diary in V1.

## 34. Handover

Completed project history must remain accessible.

Do not delete completed project data.

## 35. Delete vs Archive

Hard delete only safe unused drafts/config records.

Prefer archive/deactivate for:
- active/completed projects
- team users with history
- published proposals
- accepted proposals
- agreements
- payments
- official documents

Destructive actions require confirmation.

## 36. Admin CRUD

Admin gets approved CRUD for:
- Leads
- Projects where safe
- Team
- Pricing
- Package Templates
- Service Areas
- Website CMS
- Public portfolio

Historical integrity overrides deletion convenience.

## 37. MongoDB Rules

- index common queries
- scope queries by authorized user/project
- paginate growing lists
- do not embed unbounded chat messages
- do not embed unbounded site updates
- avoid full collection scans for common screens

## 38. API Rule

React must not connect directly to MongoDB.

Use:

**React → FastAPI → MongoDB / Storage / Integrations**

## 39. Reusable Components

Reuse:
- Button
- Input
- Select
- RadioCard
- Card
- ProjectCard
- ServiceCard
- MetricCard
- StatusBadge
- Stepper
- Tabs
- Accordion
- Drawer
- Modal
- BottomSheet
- FileCard
- DrawingCard
- ChatMessage
- NotificationItem
- Table
- EmptyState
- Skeleton
- CMSSectionEditor
- MediaPicker

Do not duplicate near-identical role-specific components.

## 40. Mobile Rules

- 16px page padding
- minimum 44px touch target
- no page-level horizontal overflow
- cards instead of squeezed tables
- bottom sheets where appropriate
- safe-area support
- sticky actions only where approved

## 40A. Visual Regression Is Mandatory

Before accepting changes to public/shared design-system code, compare against the preserved baseline at:

- 390px
- 430px
- 768px
- 1024px
- 1440px

Check both Light and Dark where supported.

At minimum verify:
- Intro
- Homepage hero
- Navbar
- section heading rhythm
- service/process/project cards
- horizontal rails
- Guarantees
- Why Choose comparison
- Homeowner Stories
- FAQ
- Footer
- Search overlay
- Auth modal
- Public Project Detail hero/overlap/tabs/gallery/viewer

Do not approve a new shared CSS rule that changes the frozen public baseline unintentionally.

## 41. Desktop Rules

- proper desktop composition
- fixed/collapsible sidebar for operations panels
- tables where useful
- max-width containers
- do not simply stretch mobile

## 42. States

Every important data screen must support:
- loading
- empty
- error
- success
- disabled
- permission denied

## 43. No Scope Creep

Do not add:
- AI assistant/chatbot
- AI package generation
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
- digital signature system

unless explicitly approved later.

## 44. Code Quality

Required:
- JavaScript/JSX frontend matching the current clean baseline
- FastAPI with Pydantic validation
- clear service/repository separation
- shared API client
- environment variables
- no secrets in code
- tests for critical workflows/business calculations
- clear errors

## 45. Git Rules

Save stable milestones to GitHub.

Commit:
- frontend
- backend
- tests
- docs
- example config

Never commit:
- `.env`
- secrets
- private client files
- production credentials

## 46. Build Discipline

Do not implement the entire platform in one giant build prompt.

Follow `task.md`.

After each phase:
1. test
2. inspect Preview
3. fix
4. run health/build checks
5. save to GitHub
6. continue

## 46A. Mobile Client App Shell Is Mandatory

For the authenticated **client mobile panel**, always use:

Top:
- hamburger left
- centered BDesigner logo
- theme toggle right
- notifications at far right

Bottom, fixed left-to-right:
1. Home
2. Search
3. Project
4. Site Updates
5. Account

Rules:
- Project may use the emphasized center treatment
- active item must be clear
- respect device safe area
- page content must never hide behind the fixed bottom bar
- secondary destinations belong in hamburger drawer
- before construction, Site Updates stays in position and shows a locked/empty state
- never dynamically reorder the five destinations

This overrides older generic mobile-navigation interpretations.

## 46B. Website Download App Must Be Real

The public website must expose **Download App / Get BDesigner App**.

V1 behavior:
- use real PWA installation when supported
- later use real Play Store/App Store URLs when configured
- otherwise show honest Add to Home Screen guidance or Coming Soon

Never:
- fake an app download
- show fake store links
- claim a native app is installed when it is not

The PWA does not change the rule that V1 is a React web app, not an Expo/React Native build.

## 47. Future Mobile

After web is stable and deployed:
- use Emergent Web → Mobile
- build Expo/React Native frontend
- reuse FastAPI backend
- reuse MongoDB
- reuse login/accounts

Do not create a second unrelated backend.
