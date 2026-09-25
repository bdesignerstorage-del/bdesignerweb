# BDesigner V1 — Phased Emergent Implementation Checklist

Build this application phase-by-phase. Do not implement the entire platform in one uncontrolled pass.

After each phase:
1. Test
2. Review Preview
3. Fix issues
4. Run build/health checks
5. Save stable milestone to GitHub
6. Continue only after approval

---

# Phase 0 — Clean Baseline Verification & GitHub Replacement

The clean baseline already exists. Do **not** create a new scaffold.

Already completed in the clean copy:
- [x] Legacy ERP/Admin/PM/Client/Civil/Brand/marketplace code removed
- [x] Approved Homepage preserved
- [x] Public Project Detail preserved
- [x] Minimal FastAPI public backend preserved
- [x] MongoDB connection configuration preserved
- [x] `.env.example` preserved
- [x] README and cleanup report present
- [x] Six product documentation files present in `/docs`
- [x] Legacy credential artifact `admin_token.txt` removed
- [x] Local frontend import graph validated
- [x] Python syntax validation passed

Next actions in Emergent/GitHub:
- [ ] Replace the old GitHub working tree with this clean baseline using a safe commit/backup strategy
- [ ] Confirm Emergent opens the existing React/CRACO web app without regenerating it
- [ ] Run `npm install`
- [ ] Run `npm run build`
- [ ] Start FastAPI backend
- [ ] Confirm MongoDB connection
- [ ] Verify `GET /api/health`
- [ ] Verify `/` visually against `docs/reference-homepage.png`
- [ ] Verify `/projects/:id`
- [ ] Verify light/dark mode
- [ ] Verify intro, Navbar, mobile drawer, search, auth modal, footer, audio and sticky CTA
- [ ] Verify mobile and desktop widths
- [ ] Capture baseline screenshots at 390 / 430 / 768 / 1024 / 1440
- [ ] Capture Light/Dark baseline where applicable
- [ ] Verify exact motion: intro, reveal, route veil, drawer, search, project hover
- [ ] Verify A4 Project Detail galleries + fullscreen zoom/swipe/pan
- [ ] Save the verified clean-baseline commit to GitHub

Exit:
- clean repository is live in GitHub
- production build succeeds
- public baseline still matches the approved design
- backend health/MongoDB work
- no deleted legacy panel has returned

---

# Phase 1 — Extract & Extend the Existing Design System

Do not rebuild the Homepage. Reuse its existing styles/components as the design source.

The code-level UI DNA audit is now documented in `design.md`. During implementation, verify/reuse:
- [ ] final Dark tokens: #0B0B0B / #111111 / #151515 / #1A1A1A + neutral borders/text
- [ ] final Light tokens: #F7F7F7 / #FFFFFF + #D9D9D9 borders + #111/#555/#888 text
- [ ] restrained #C9A24A accent roles only (eyebrow/price/stars/premium micro-state)
- [ ] Inter-first type scale and tracking
- [ ] 16 / 24 / 32px responsive public container padding
- [ ] 14–24px card/radius family + full pills
- [ ] border-led card separation and no gold glow
- [ ] 720ms scroll reveal + premium cubic
- [ ] 520ms public page fade
- [ ] 300ms theme/nav/drawer transitions
- [ ] 220ms search-overlay entry
- [ ] Project Card 200/240/280px widths, 1:1 image, 700ms image zoom, 300ms lift
- [ ] Project Detail 52/62vh hero, overlapping glass card, sticky tabs
- [ ] A4 210:297 drawing cards capped at 560px
- [ ] fullscreen viewer interactions/zoom constants
- [ ] Navbar/mobile drawer patterns
- [ ] existing cards/buttons
- [ ] dialog/dropdown primitives
- [ ] skeleton/toast patterns

Add only missing reusable components needed for new panels:
- [ ] Input
- [ ] Textarea
- [ ] Select
- [ ] RadioCard
- [ ] Checkbox
- [ ] Toggle
- [ ] Chip
- [ ] StatusBadge
- [ ] Tabs
- [ ] Accordion variants where needed
- [ ] Stepper
- [ ] BottomSheet
- [ ] EmptyState
- [ ] ErrorState
- [ ] MobileClientTopBar
- [ ] MobileClientBottomNav
- [ ] AppInstallCTA / AppInstallBanner
- [ ] logged-in panel shell

Exit:
- new reusable components look native to the preserved Homepage
- existing public pages are visually unchanged unless explicitly approved
- no new panel introduces a second color/font/radius/motion system
- shared component changes pass visual regression at the documented widths

---

# Phase 2 — Harden Existing Auth & Add Roles

The baseline already has basic register/login/me/logout cookie/JWT auth for the public modal. Extend it instead of replacing the whole auth UI.

Backend:
- [ ] audit existing `users` collection
- [ ] lock role assignment so public registration cannot self-select privileged roles
- [ ] define role enum: admin/client/pm/architect/structural_designer/civil_engineer
- [ ] keep secure bcrypt password hashing
- [ ] harden JWT/cookie settings for production
- [ ] implement real forgot-password workflow or keep clearly disabled until configured
- [ ] add role guards
- [ ] add project-access guard helpers
- [ ] Admin setup/seed method
- [ ] Google OAuth only behind real credentials
- [ ] phone OTP disabled

Frontend:
- [ ] preserve current Login/Create Account modal visual design
- [ ] connect role-based post-login routing
- [ ] add unauthorized state
- [ ] add future panel routes without breaking `/`

Exit:
- public auth modal still matches approved design
- privileged roles cannot be created from public registration
- unauthorized APIs are blocked

---

# Phase 3 — Preserve Public Baseline + Add Approved Public Enhancements

Already preserved:
- [x] Intro/loading
- [x] Homepage
- [x] hero image/video system
- [x] theme behavior
- [x] Trust Indicators
- [x] Construction Process
- [x] Bengaluru/service-area section
- [x] Guarantees
- [x] Why Choose BDesigner
- [x] Trending Projects
- [x] Homeowner Stories
- [x] FAQ
- [x] footer
- [x] mobile public drawer
- [x] Search overlay
- [x] auth modal
- [x] Public Project Detail
- [x] About audio/sticky CTA foundation

Approved additions/refinements:
- [ ] Architectural Services section inside Homepage only
- [ ] one section-level **Plan Your Dream Home** CTA
- [ ] no separate Architectural Services page
- [ ] Website Download App / Get BDesigner App entry
- [ ] PWA manifest/installability foundation
- [ ] real install prompt where supported
- [ ] honest Add to Home Screen / Coming Soon fallback
- [ ] rebuild Projects listing when required
- [ ] rebuild How It Works page
- [ ] rebuild About page
- [ ] rebuild FAQs page
- [ ] rebuild Contact page
- [ ] no public Construction page
- [ ] no public Cost Calculators

Important:
- do not replace existing Homepage sections just to satisfy this checklist
- new sections must match the existing public design
- legacy links may continue redirecting to `/` until their replacement page is actually built

Exit:
- preserved Homepage remains visually stable
- approved additions are integrated without redesign

---

# Phase 4 — Website CMS

The clean backend already contains `homepage_cms.py`, Homepage block seeding, `homepage_blocks`, `homepage_section_settings`, and the public `/api/homepage/sections` read model. Reuse/refactor this foundation instead of creating a second competing Homepage CMS system.

Extend/create target CMS data only as needed:
- [ ] normalize/extend current Homepage CMS model
- [ ] `portfolio_projects`
- [ ] `portfolio_media`
- [ ] `homeowner_stories`
- [ ] `faqs`
- [ ] `cms_about`
- [ ] `cms_how_it_works`
- [ ] `cms_contact`
- [ ] `media_assets`
- [ ] `seo_settings`

Admin UI:
- [ ] Website CMS sidebar item
- [ ] Homepage tab
- [ ] Projects tab
- [ ] Homeowner Stories tab
- [ ] FAQs tab
- [ ] About tab
- [ ] How It Works tab
- [ ] Contact tab
- [ ] Media tab
- [ ] SEO tab
- [ ] Save
- [ ] Preview
- [ ] Publish where appropriate

Rules:
- [ ] content editing only
- [ ] no page builder
- [ ] no CSS/layout controls
- [ ] public pages consume CMS data

Exit:
- Admin can update public content without code changes

---

# Phase 5 — File Storage

- [ ] choose/configure S3-compatible storage or suitable provider
- [ ] upload service
- [ ] public/private metadata
- [ ] file type validation
- [ ] file size validation
- [ ] authorized private download
- [ ] public media access
- [ ] image optimization
- [ ] sensible video limits

Exit:
- large files are external to MongoDB
- private files are protected

---

# Phase 6 — Pricing & Service Areas

Collections:
- [ ] `service_catalog`
- [ ] `service_areas`

Admin Pricing:
- [ ] service name
- [ ] pricing type
- [ ] rate
- [ ] minimum charge
- [ ] included revisions
- [ ] extra revision rate
- [ ] active/inactive
- [ ] construction base rates

Service Areas:
- [ ] city
- [ ] area
- [ ] PIN
- [ ] active/inactive
- [ ] add/edit/delete/deactivate

Backend:
- [ ] pricing service
- [ ] serviceability service
- [ ] unit tests

Exit:
- new calculations use current pricing
- old confirmed pricing remains unchanged

---

# Phase 7 — Requirement Form + Lead Creation

Collections:
- [ ] `leads`
- [ ] `lead_requirements`
- [ ] `lead_services`

Flow:
- [ ] service selection
- [ ] horizontal service cards
- [ ] plot/project details
- [ ] floors
- [ ] built-up calculation
- [ ] file uploads
- [ ] serviceability
- [ ] construction interest
- [ ] room requirements
- [ ] conditional elevation
- [ ] live architectural pricing
- [ ] summary
- [ ] Edit Requirement
- [ ] local autosave
- [ ] preserve Back data
- [ ] registration after summary
- [ ] attach registered user to lead

Exit:
- anonymous visitor → lead → registered client works

---

# Phase 8 — Admin Leads

- [ ] summary cards
- [ ] desktop table
- [ ] mobile cards
- [ ] search
- [ ] filters
- [ ] lead detail
- [ ] requirements
- [ ] selected services
- [ ] price summary
- [ ] internal notes
- [ ] manual Add Lead
- [ ] Edit
- [ ] Close
- [ ] safe delete
- [ ] Assign PM
- [ ] Convert to Project
- [ ] project-number generation
- [ ] preserve lead history

Exit:
- converted lead cannot destroy project history

---

# Phase 9 — Project Foundation

Collections:
- [ ] `projects`
- [ ] `project_requirements`
- [ ] `project_services`
- [ ] `project_members`
- [ ] `project_activity`

Features:
- [ ] one master project
- [ ] phase/status
- [ ] project membership
- [ ] Admin project list
- [ ] Admin project detail
- [ ] activity history

Exit:
- project remains continuous across architecture and construction

---

# Phase 10 — Client Architecture Dashboard

- [ ] My Projects
- [ ] direct open for single project
- [ ] Dashboard
- [ ] project summary
- [ ] selected services
- [ ] team
- [ ] Book A Call
- [ ] Track Status
- [ ] payment summary placeholder
- [ ] recent updates
- [ ] sticky mobile top bar
- [ ] hamburger left
- [ ] centered BDesigner logo
- [ ] theme toggle right
- [ ] notification button/badge
- [ ] fixed bottom nav: Home / Search / Project / Site Updates / Account
- [ ] emphasized center Project treatment
- [ ] safe-area padding
- [ ] Search screen for client-authorized content
- [ ] secondary menu in hamburger drawer
- [ ] Site Updates locked/empty state before construction
- [ ] Construction locked

Exit:
- client sees only own projects

---

# Phase 11 — Drawings & Revisions

Collections:
- [ ] `drawings`
- [ ] `drawing_versions`
- [ ] `drawing_feedback`

Features:
- [ ] Architect upload
- [ ] PM review
- [ ] PM sends to client
- [ ] Client Approve
- [ ] Client Request Changes
- [ ] revision counters
- [ ] previous versions
- [ ] drawing cards
- [ ] fullscreen viewer
- [ ] download
- [ ] extra revision indicator
- [ ] permission checks

Exit:
- revision count reflects real feedback cycles

---

# Phase 12 — Chat & Internal Notes

Collections:
- [ ] `chat_threads`
- [ ] `chat_messages`
- [ ] `internal_notes`

Features:
- [ ] one project chat
- [ ] text
- [ ] image
- [ ] document
- [ ] link
- [ ] audio
- [ ] design review card
- [ ] system messages
- [ ] member access
- [ ] Media / Docs / Links
- [ ] chat enabled/disabled
- [ ] internal notes staff-only
- [ ] WebSocket or reliable refresh fallback

Exit:
- client cannot see internal notes
- unassigned users cannot access project chat

---

# Phase 13 — Documents & Notifications

Collections:
- [ ] `documents`
- [ ] `notifications`

Documents:
- [ ] categories
- [ ] statuses
- [ ] Final Documents
- [ ] Previous Versions
- [ ] staff upload
- [ ] client View/Download
- [ ] mark final
- [ ] supersede
- [ ] protected access

Notifications:
- [ ] event generation
- [ ] read/unread
- [ ] badge
- [ ] deep links

Exit:
- chat attachment is not automatically official

---

# Phase 14 — Architecture Payments

Collection:
- [ ] `payments`

Features:
- [ ] billing summary
- [ ] service billing
- [ ] paid
- [ ] balance
- [ ] due
- [ ] invoices
- [ ] receipts
- [ ] manual payment recording
- [ ] transaction reference
- [ ] payment-provider feature flag
- [ ] no fake success

Exit:
- payment history persists safely

---

# Phase 15 — Team Management

Admin:
- [ ] Team list
- [ ] Add
- [ ] Edit
- [ ] Activate/deactivate
- [ ] Assigned Projects
- [ ] Role
- [ ] safe delete rules

Project:
- [ ] Assign PM
- [ ] Assign Architect
- [ ] Assign Structural Designer
- [ ] Assign Civil Engineer after construction activation
- [ ] simple member permissions

Exit:
- role boundaries verified

---

# Phase 16 — PM / Architect / Structural Panels

PM:
- [ ] Dashboard
- [ ] My Projects
- [ ] project workspace
- [ ] team
- [ ] drawing review
- [ ] chat
- [ ] documents
- [ ] payments visibility
- [ ] attention items

Architect:
- [ ] Dashboard
- [ ] My Projects
- [ ] Requirements
- [ ] Drawings
- [ ] Feedback
- [ ] Documents
- [ ] Chat

Structural:
- [ ] Dashboard
- [ ] My Projects
- [ ] Architectural Reference
- [ ] Structural Drawings
- [ ] Feedback
- [ ] Documents
- [ ] Chat

Exit:
- all permissions verified

---

# Phase 17 — Architecture Completion

- [ ] completion checklist
- [ ] selected-service completion check
- [ ] final files check
- [ ] client approval check
- [ ] payment check
- [ ] BOQ readiness
- [ ] Mark Architecture Completed
- [ ] client completion state
- [ ] construction-interest next step

Exit:
- architecture completion does not activate construction

---

# Phase 18 — Package Templates

Collection:
- [ ] `package_templates`

Admin:
- [ ] Add
- [ ] Edit
- [ ] Duplicate
- [ ] Activate/deactivate
- [ ] safe delete
- [ ] specifications
- [ ] allowances
- [ ] inclusions
- [ ] exclusions
- [ ] default payment schedule

Exit:
- PM can copy a template
- PM cannot modify master

---

# Phase 19 — Package Builder & Proposal

Collections:
- [ ] `proposals`
- [ ] `proposal_versions`

Builder:
- [ ] Project Summary
- [ ] Package Setup
- [ ] Specifications
- [ ] custom categories
- [ ] Inclusions
- [ ] Exclusions
- [ ] Variations
- [ ] Cost
- [ ] Discount
- [ ] Tax mode
- [ ] Admin override + reason
- [ ] Payment Schedule
- [ ] 100% validation
- [ ] Timeline
- [ ] Client note
- [ ] Internal note
- [ ] autosave
- [ ] live summary
- [ ] Preview
- [ ] readiness validation
- [ ] Publish
- [ ] immutable snapshot
- [ ] PDF
- [ ] version history
- [ ] Request Discussion
- [ ] Create Revision
- [ ] Client Accept
- [ ] lock accepted version

Exit:
- accepted proposal immutable
- previous versions preserved
- calculations tested

---

# Phase 20 — Agreement

Collection:
- [ ] `agreements`

Features:
- [ ] upload agreement
- [ ] version
- [ ] Ready for Review
- [ ] client View/Download
- [ ] Request Discussion
- [ ] Confirm Agreement
- [ ] confirmation timestamp
- [ ] version history
- [ ] official document integration

Exit:
- agreement history preserved

---

# Phase 21 — Construction Activation

Backend validates:
- [ ] Architecture complete
- [ ] BOQ ready
- [ ] Serviceable
- [ ] Proposal accepted
- [ ] Agreement confirmed
- [ ] Initial payment confirmed

Action:
- [ ] Activate Construction
- [ ] update phase
- [ ] activation timestamp
- [ ] create standard stages
- [ ] assign Civil Engineer
- [ ] unlock client construction UI
- [ ] notify team/client

Exit:
- same project continues
- no automatic activation

---

# Phase 22 — Construction Dashboard & Progress

Collections:
- [ ] `construction_stages`
- [ ] `construction_substages`

Client:
- [ ] overview
- [ ] current stage
- [ ] progress
- [ ] latest update
- [ ] next activity
- [ ] payment milestone
- [ ] team
- [ ] quick links
- [ ] action required

Execution:
- [ ] stage status
- [ ] manual progress
- [ ] dates
- [ ] notes
- [ ] substages
- [ ] no Gantt

Exit:
- client is read-only

---

# Phase 23 — Site Updates & Civil Engineer

Collections:
- [ ] `site_updates`
- [ ] `site_update_media`

Civil Engineer:
- [ ] Dashboard
- [ ] My Projects
- [ ] Progress
- [ ] Start/update/complete/hold stage
- [ ] Add Site Update
- [ ] Photos
- [ ] Video
- [ ] Next Activity
- [ ] Action Required
- [ ] approved drawings
- [ ] documents
- [ ] chat

Client:
- [ ] site feed
- [ ] filters
- [ ] media viewer

Exit:
- engineer cannot edit commercial proposal/payment configuration

---

# Phase 24 — Construction Payments

- [ ] contract summary
- [ ] milestones
- [ ] paid
- [ ] balance
- [ ] current due
- [ ] approved variations
- [ ] payment history
- [ ] invoices
- [ ] receipts
- [ ] manual payment
- [ ] notifications

Exit:
- totals remain consistent with accepted proposal + approved variations

---

# Phase 25 — Handover

Collection:
- [ ] `handover_checklists`

Admin/PM:
- [ ] stages complete
- [ ] pending works
- [ ] final inspection
- [ ] final payment
- [ ] final photos
- [ ] completion docs
- [ ] warranty docs
- [ ] Complete & Handover
- [ ] override reason if allowed

Client:
- [ ] Your Home Is Ready
- [ ] Project Completed
- [ ] final gallery
- [ ] summary
- [ ] final docs
- [ ] warranty/completion
- [ ] feedback

Exit:
- completed project preserved as history

---

# Phase 26 — Settings & Integrations

Admin Settings:
- [ ] company info
- [ ] support contacts
- [ ] hero timeline config
- [ ] default theme
- [ ] invoice/receipt prefixes
- [ ] feature flags
- [ ] PWA enabled flag
- [ ] app install CTA enabled/label
- [ ] Android app URL config
- [ ] iOS app URL config

Optional integrations:
- [ ] Google OAuth
- [ ] Maps
- [ ] Email
- [ ] Payment provider
- [ ] File storage

Exit:
- missing credentials never produce fake success

---

# Phase 27 — Search, Indexing & Performance

- [ ] MongoDB indexes
- [ ] Lead search
- [ ] Project search
- [ ] Client search
- [ ] pagination
- [ ] chat pagination
- [ ] site-update pagination
- [ ] query optimization
- [ ] image optimization
- [ ] lazy loading

Exit:
- common screens load efficiently

---

# Phase 28 — Security & QA

- [ ] auth audit
- [ ] project ownership audit
- [ ] role permission audit
- [ ] private file audit
- [ ] proposal immutability
- [ ] agreement history
- [ ] delete/archive safety
- [ ] requirement-form persistence
- [ ] pricing-history test
- [ ] CMS test
- [ ] mobile audit
- [ ] desktop audit
- [ ] dark/light audit
- [ ] accessibility
- [ ] loading states
- [ ] empty states
- [ ] errors
- [ ] permission denied
- [ ] critical E2E flows
- [ ] Emergent health check

---

# Phase 29 — Production Release

- [ ] production MongoDB configured
- [ ] production storage configured
- [ ] production secrets configured
- [ ] production Admin created
- [ ] demo-only data removed
- [ ] verify Preview vs Production differences
- [ ] deploy
- [ ] smoke test live URL
- [ ] verify PWA manifest/installability on supported mobile browser
- [ ] verify Download App CTA fallback on unsupported browser
- [ ] verify mobile top/bottom shell and safe-area behavior
- [ ] custom domain
- [ ] SSL
- [ ] backup/data procedures
- [ ] release saved to GitHub

---

# Phase 30 — Future Mobile App

Not part of V1.

After web is stable:
- [ ] use Emergent Web → Mobile
- [ ] build Expo/React Native frontend
- [ ] share FastAPI backend
- [ ] share MongoDB
- [ ] share login/accounts
- [ ] adapt navigation for native mobile
- [ ] add native features only where useful
