# BDesigner V1 — Emergent-Native System Architecture

**Status:** Frozen V1  
**Primary target:** Responsive web app in Emergent AI  
**Future:** Expo/React Native mobile app sharing the same backend/database/login

## 1. Stack

### Web Frontend — Match the Existing Clean Baseline

Current repository stack:
- React 19
- JavaScript / JSX
- Create React App (`react-scripts` 5)
- CRACO
- React Router
- Tailwind CSS 3.4
- Lucide React
- Radix primitives where already used
- Sonner for toasts

**Do not migrate the existing V1 repository to Next.js or TypeScript as part of normal feature development.** The approved Homepage is already working in JSX/CRACO and preserving it is more important than a framework migration. New V1 frontend modules should use the same JavaScript/JSX conventions unless the user explicitly approves a later migration.

Add installable PWA capability to this existing React web app in a later dedicated phase. The PWA supports the website's **Download App / Get BDesigner App** experience before a native app exists.

**Do not use Expo/React Native for the V1 website.**

### Backend
- Python
- FastAPI
- Motor async MongoDB driver
- Pydantic
- bcrypt password hashing
- PyJWT access tokens
- HttpOnly auth cookie support
- REST APIs
- WebSocket only later where useful for live chat/notifications

The clean baseline currently uses `backend/server.py` plus `backend/homepage_cms.py`. Do not reorganize this into a completely different backend framework during the first build phases. Split services/modules gradually as the application grows.

### Database
- MongoDB
- Emergent's normal MongoDB deployment workflow
- optimized indexes and scoped queries

### Authentication
- FastAPI-backed authentication
- email/password
- secure password hashing
- JWT/session handling suitable for web
- Google OAuth only with real credentials
- phone OTP disabled in V1

### File Storage
MongoDB stores metadata, not large binaries.

Use external storage for:
- project images
- PDFs
- CAD files
- agreements
- invoices/receipts
- site photos/videos
- public hero/project media

Preferred:
- S3-compatible storage for private project files
- Cloudinary optional for optimized public media

### Deployment
- Emergent Preview during development
- Emergent production deployment
- GitHub connected for source/version history

## 2. Architecture Principles

1. One master project across all phases.
2. React never accesses MongoDB directly.
3. Frontend → FastAPI → MongoDB/storage/integrations.
4. FastAPI enforces role/project permissions.
5. Mutable drafts, immutable published/accepted history.
6. Public portfolio data is separate from private client data.
7. Business settings are database-driven.
8. Large files are external to MongoDB.
9. Integrations are feature-flagged.
10. No fake success states.
11. Keep V1 simple.
12. APIs should be reusable by future mobile frontend.

## 3. Current Repository Structure

The clean baseline currently uses this structure and should be evolved in place:

```text
/
├── frontend/
│   ├── public/
│   │   ├── hero/background media
│   │   └── BDesigner logos
│   ├── src/
│   │   ├── components/
│   │   │   ├── home/
│   │   │   ├── bd/
│   │   │   └── ui/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   └── ProjectDetail.jsx
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   ├── craco.config.js
│   └── tailwind.config.js
├── backend/
│   ├── server.py
│   ├── homepage_cms.py
│   ├── requirements.txt
│   └── .env.example
├── docs/
│   ├── prd.md
│   ├── architecture.md
│   ├── rules.md
│   ├── design.md
│   ├── task.md
│   ├── memory.md
│   └── reference-homepage.png
├── .emergent/
├── .gitignore
└── README.md
```

As new modules are built, create additional frontend folders such as `pages/client`, `pages/admin`, `pages/pm`, `pages/architect`, `pages/structural`, and `pages/engineer`, and split backend logic into focused modules/services. **Do not replace the repository wholesale just to match a theoretical folder tree.**

## 3A. Existing Public API Contract

The preserved Homepage currently depends on these routes. Treat them as compatibility contracts during the next phases:

```text
GET  /api/health
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
POST /api/auth/forgot
GET  /api/settings
GET  /api/homepage/sections
GET  /api/projects
GET  /api/projects/{project_id}
POST /api/projects/{project_id}/share
GET  /api/projects/{project_id}/comments
POST /api/projects/{project_id}/comments
GET  /api/search
POST /api/erp/enquiries
POST /api/track
```

The historical `/api/erp/enquiries` path is retained temporarily only for Homepage compatibility. It can be migrated later behind the same UI without breaking the approved Homepage.

## 3B. Shared UI Architecture — Preserve Existing DNA

The cleaned repository already has a working shared public UI layer. Extend it rather than creating a second theme implementation.

### Existing shared UI sources

```text
frontend/src/index.css                 final token/cascade source
frontend/src/context/ThemeContext.jsx global theme state + persistence
frontend/src/components/ThemeToggle.jsx
frontend/src/components/Navbar.jsx
frontend/src/components/MobileDrawer.jsx
frontend/src/components/HorizontalScroll.jsx
frontend/src/components/ProjectCard.jsx
frontend/src/components/CategoryGallery.jsx
frontend/src/components/FullscreenViewer.jsx
frontend/src/components/bd/*            intro/transitions/audio/sticky CTA/video
frontend/src/components/home/*          public section patterns
```

### Required architecture for new screens

Create/reuse shared primitives instead of defining module-local design systems:

```text
shared theme tokens
shared typography classes
shared Button variants
shared Card/Surface variants
shared StatusBadge
shared IconChip
shared FormField/Input/Select
shared Tabs/Pills
shared Modal/Drawer/BottomSheet
shared ProjectCard
shared DrawingCard / A4 preview
shared FullscreenViewer
shared MobileClientTopBar
shared MobileClientBottomNav
```

### Theme contract

- one global `data-theme="dark|light"` on `<html>`
- one ThemeContext source
- business modules consume CSS variables/tokens
- avoid hardcoded per-panel colors unless a functional status requires it
- no separate Admin theme engine

### Motion contract

Public marketing shell may use the established intro/reveal/page-transition vocabulary.
Operational panels should use compact micro-transitions and should **not** run the full marketing route veil on every navigation action.

### Visual regression contract

Shared CSS/component changes must be checked against the preserved `/` and `/projects/:id` baseline before merge. This is particularly important because `index.css` contains legacy declarations followed by final override layers; the final effective cascade must not be accidentally reordered.

## 4. API Structure

Suggested:

```text
/api/v1/auth
/api/v1/public
/api/v1/cms
/api/v1/leads
/api/v1/projects
/api/v1/drawings
/api/v1/chat
/api/v1/documents
/api/v1/payments
/api/v1/proposals
/api/v1/agreements
/api/v1/construction
/api/v1/site-updates
/api/v1/admin
```

Use Pydantic request/response schemas.

Never return raw unrestricted MongoDB documents.

## 5. Authentication & Authorization

### Roles
- admin
- client
- pm
- architect
- structural_designer
- civil_engineer

Every private API must:
1. authenticate user
2. read role
3. verify ownership/project membership
4. scope database query
5. return only allowed fields

MongoDB does not provide Supabase-style RLS, so FastAPI authorization is mandatory.

### Client
Own projects only.

### PM
Assigned projects only unless Admin.

### Architect / Structural / Civil
Only active project assignments and role-relevant actions.

### Admin
Business-wide access.

## 6. MongoDB Collections

### `users`
```text
_id
role
full_name
email
phone
password_hash
avatar_url
city
status
created_at
updated_at
```

### `client_addresses`
```text
_id
client_id
label
address_line
locality
city
state
pin_code
country
is_default
```

### `leads`
```text
_id
lead_number
client_user_id
name
phone
email
city
project_name
project_type
construction_interest
construction_serviceable
matched_service_area_id
estimated_architectural_charge
status
assigned_pm_id
source
created_at
updated_at
```

### `lead_requirements`
Structured nested document:
```text
_id
lead_id
plot
floors
built_up_area
vastu
facing
parking
family_members
room_requirements
elevation_requirements
additional_notes
form_version
created_at
updated_at
```

### `service_catalog`
```text
_id
code
name
short_description
pricing_type
rate
minimum_charge
included_revisions
extra_revision_rate
active
sort_order
created_at
updated_at
```

### `lead_services`
```text
_id
lead_id
service_id
applicable_area
quoted_amount
selected
```

### `service_areas`
```text
_id
city
area_name
pin_code
active
created_at
updated_at
```

Indexes on city, pin_code, active.

### `projects`
Master project:
```text
_id
project_number
client_id
originating_lead_id
project_name
location
service_area_id
plot
built_up_area
floors
facing
design_style
current_phase
current_stage
overall_progress
assigned_pm_id
status
construction_requested
construction_serviceable
architecture_completed_at
construction_activated_at
completed_at
archived_at
created_at
updated_at
```

Phases:
```text
architecture
proposal
construction
handover
completed
```

### `project_requirements`
```text
_id
project_id
version
requirements
created_at
updated_at
```

### `project_services`
```text
_id
project_id
service_id
assigned_member_id
status
quoted_amount
paid_amount
included_revisions
completed_revisions
extra_revisions_purchased
started_at
completed_at
```

### `project_members`
```text
_id
project_id
user_id
role
chat_enabled
upload_enabled
update_progress_enabled
view_payments_enabled
construction_access
active
assigned_at
removed_at
```

### `drawings`
```text
_id
project_id
project_service_id
category
title
description
current_version_id
status
created_by
created_at
updated_at
```

### `drawing_versions`
```text
_id
drawing_id
version_number
draft_label
file_url
preview_url
storage_key
uploaded_by
status
created_at
approved_at
```

Statuses:
- draft
- pm_review
- client_review
- approved
- superseded

### `drawing_feedback`
```text
_id
drawing_version_id
project_id
client_id
action
rating
comment
created_at
```

Actions:
- approve
- request_changes

### `chat_threads`
One main thread per project:
```text
_id
project_id
thread_type
created_at
```

### `chat_messages`
Do not embed unlimited messages in the thread document.
```text
_id
thread_id
project_id
sender_id
message_type
body
attachments
metadata
created_at
edited_at
deleted_at
```

Indexes on thread_id + created_at.

### `internal_notes`
```text
_id
project_id
author_id
body
created_at
updated_at
```

### `documents`
```text
_id
project_id
category
title
storage_key
file_url
mime_type
file_size
version
status
client_visible
uploaded_by
created_at
supersedes_document_id
```

### `notifications`
```text
_id
user_id
project_id
type
title
body
target_path
read_at
created_at
```

### `call_bookings`
```text
_id
project_id
client_id
assigned_staff_id
scheduled_at
status
note
created_at
updated_at
```

### `payments`
```text
_id
project_id
phase
project_service_id
proposal_version_id
milestone_id
amount
due_date
paid_at
status
payment_method
transaction_reference
invoice_document_id
receipt_document_id
notes
created_at
updated_at
```

### `package_templates`
Bounded template data can be embedded:
```text
_id
name
package_type
base_rate
description
specifications
inclusions
exclusions
payment_schedule
active
created_by
created_at
updated_at
```

### `proposals`
```text
_id
project_id
current_version_id
status
created_by
created_at
updated_at
```

### `proposal_versions`
```text
_id
proposal_id
project_id
version_number
package_name
package_type
built_up_area
rate_per_sqft
base_value
approved_variations_total
discount_amount
tax_mode
tax_amount
final_value
estimated_duration
expected_start_date
expected_completion_date
valid_until
client_note
internal_note
status
snapshot
pdf_document_id
published_at
accepted_at
accepted_by
created_by
created_at
updated_at
```

Published/accepted snapshots are immutable.

### `agreements`
```text
_id
project_id
proposal_version_id
version
document_id
status
summary
ready_at
confirmed_at
confirmed_by
supersedes_agreement_id
created_at
```

### `construction_stages`
```text
_id
project_id
stage_code
stage_name
sort_order
status
progress
start_date
expected_completion_date
completed_at
note
created_at
updated_at
```

### `construction_substages`
```text
_id
construction_stage_id
project_id
name
status
sort_order
```

### `site_updates`
```text
_id
project_id
construction_stage_id
author_id
update_type
note
progress
next_activity
expected_date
created_at
updated_at
```

### `site_update_media`
```text
_id
site_update_id
project_id
storage_key
file_url
media_type
caption
sort_order
created_at
```

### `handover_checklists`
```text
_id
project_id
all_stages_complete
pending_works_cleared
final_inspection_complete
final_payment_complete
final_photos_uploaded
completion_documents_uploaded
warranty_documents_uploaded
override_reason
completed_by
completed_at
updated_at
```

### `team_feedback`
```text
_id
project_id
reviewer_id
target_member_id
communication_rating
work_quality_rating
timeliness_rating
overall_rating
comment
created_at
```

### `project_activity`
Important event audit:
```text
_id
project_id
actor_id
type
title
metadata
created_at
```

## 7. Website CMS Collections

### `cms_homepage`
```text
_id
hero
trust
architectural_services
process_preview
why_bdesigner
featured_project_ids
about_preview
final_cta
footer
section_visibility
updated_by
updated_at
published_at
```

`architectural_services.services[]`:
```text
service_code
title
short_description
image_url
sort_order
active
```

No separate service landing page content model.

### `portfolio_projects`
```text
_id
title
slug
location
project_type
plot_size
floors
budget_text
timeline_text
description
highlights
cover_image_url
published
featured
sort_order
created_at
updated_at
```

### `portfolio_media`
```text
_id
portfolio_project_id
category
file_url
storage_key
caption
sort_order
```

### `homeowner_stories`
```text
_id
client_display_name
location
story
image_url
project_id_optional
active
sort_order
```

### `faqs`
```text
_id
category
question
answer
active
sort_order
```

### `cms_about`
```text
_id
heading
story
sections
images
audio_url
updated_at
published_at
```

### `cms_how_it_works`
```text
_id
steps
updated_at
published_at
```

### `cms_contact`
```text
_id
phone
email
office
working_hours
page_content
updated_at
published_at
```

### `media_assets`
```text
_id
type
title
storage_key
file_url
mime_type
file_size
alt_text
uploaded_by
created_at
```

### `seo_settings`
```text
_id
page_key
title
meta_description
og_image_url
canonical
updated_at
```

### `app_settings`
For non-secret configuration:
- company identity
- support contact
- hero timeline points
- default theme
- invoice/receipt prefixes
- feature flags
- integration enabled/disabled flags

Secrets stay in environment/secret management.

## 8. Pricing Engine

Backend is authoritative.

Inputs:
- service
- pricing type
- applicable area
- rate
- minimum charge

Example:
```text
per_sqft = max(area × rate, minimum_charge)
fixed = configured value
starting_from = configured starting value
```

Frontend can display live pricing, but backend validates official quote.

Changing current rate must not change historical confirmed quotes.

## 9. Serviceability Engine

Input:
- city
- area
- PIN

Lookup active `service_areas`.

Return:
- serviceable
- matched area
- message

Architecture remains available if construction is unavailable.

## 10. Proposal Service

Backend functions:
- calculate_base_package
- calculate_variation
- calculate_approved_variations
- calculate_discount
- calculate_tax
- calculate_final_value
- validate_payment_schedule
- publish_snapshot

Publish checks:
- package name
- area
- rate
- base
- specifications
- inclusion/exclusion
- payment schedule = 100%
- timeline
- final value

Publishing:
- create immutable version snapshot
- generate/store PDF
- notify client

Revision:
- copy previous version into new draft
- never overwrite history

Acceptance:
- lock accepted version
- record user/date/time

## 11. File Storage

Private:
- drawings
- BOQ
- invoices
- receipts
- agreements
- site photos/videos
- completion docs

Public:
- hero media
- portfolio media
- About audio

Backend verifies authorization before private file access.

Never expose private project files through public CMS paths.

## 12. Chat

- REST for history
- WebSocket for live messages if stable
- fallback refresh/polling acceptable if needed

Never store all messages inside one unbounded project document.

## 13. Notifications

Backend event-driven in-app notifications:
- assignment
- drawing
- revision
- payment
- proposal
- agreement
- activation
- site update
- stage complete
- handover

Email is optional.

## 14. Construction Activation

Validate:
- architecture complete
- BOQ ready
- serviceable
- proposal accepted
- agreement confirmed
- initial payment

If valid:
- project phase → construction
- activation timestamp
- create standard construction stages
- notify client/team

No auto-activation.

## 15. Deletion / Archive

Hard delete only safe unused drafts.

Archive/deactivate:
- active/completed projects
- team with history
- published/accepted proposals
- confirmed agreements
- payments
- official documents

## 16. Search & Performance

Use indexes and pagination.

Index commonly queried:
- email
- role
- lead status
- project client_id
- project assigned_pm_id
- project phase/status
- project member project_id/user_id
- chat thread/date
- notifications user/date
- service area PIN
- portfolio slug/published

No Elasticsearch in V1.

## 17. Error Shape

Use consistent API errors:
```json
{
  "success": false,
  "error": {
    "code": "PROJECT_ACCESS_DENIED",
    "message": "You do not have access to this project."
  }
}
```

## 18. Environment Variables

Example:
```text
MONGO_URL=
DB_NAME=
JWT_SECRET=
APP_URL=
FRONTEND_URL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

EMAIL_PROVIDER=
EMAIL_API_KEY=

MAPS_PROVIDER=
MAPS_API_KEY=

PAYMENT_PROVIDER=
PAYMENT_KEY_ID=
PAYMENT_KEY_SECRET=
PAYMENT_WEBHOOK_SECRET=
```

Never commit secrets.

## 19. Preview vs Production

Emergent Preview and Production use separate data environments.

Therefore:
- use demo/seed data in Preview
- create explicit production Admin/setup flow
- never assume preview data exists in production
- test production configuration separately

## 20. Testing

Unit:
- pricing
- serviceability
- proposal math
- payment schedule validation
- permission helpers
- revision count
- construction activation

Integration:
- auth
- lead conversion
- project access
- drawing review
- proposal publish/revise/accept
- agreement confirm
- construction activation
- site update
- handover

E2E:
1. public form → registration
2. Admin lead → project
3. Architect → PM → client review
4. architecture completion
5. proposal acceptance
6. agreement → activation
7. engineer site update
8. construction payment
9. handover

## 20A. Mobile Client Shell + PWA Install

### Authenticated Mobile Client Shell

Create reusable components:
```text
MobileClientShell
MobileTopBar
MobileBottomNav
AppInstallCTA
AppInstallBanner
NotificationButton
ThemeToggle
```

Top bar:
- hamburger left
- centered BDesigner logo
- theme toggle right
- notification icon at far right

Bottom navigation:
- Home
- Search
- Project
- Site Updates
- Account

Rules:
- fixed to viewport bottom
- respect `env(safe-area-inset-bottom)`
- reserve content padding equal to nav height + safe area
- derive active state from router location
- Project may use the emphasized center treatment
- Site Updates route stays in place before construction and renders a locked/empty state
- hamburger contains secondary routes

### Client Search

Use a simple authenticated endpoint such as:
```text
GET /api/v1/search?q=
```

Search only data the client is authorized to access, such as:
- own project names/IDs
- client-visible drawings
- client-visible documents
- client-visible site updates

Never perform cross-client search.

### PWA / Download App

Minimum:
- web app manifest
- app name / short name
- icons
- theme/background colors
- standalone display mode where supported
- install-prompt handling
- HTTPS in production
- service worker/caching strategy appropriate to the generated web stack

Do not cache sensitive private API responses or unrestricted project files for offline use.

Website CTA resolution order:
1. real native store link after native app release
2. real PWA install prompt when available
3. Add to Home Screen guidance or honest Coming Soon state

Suggested non-secret settings:
```text
pwa_enabled
android_app_url
ios_app_url
app_install_cta_enabled
app_install_cta_label
```

No fake download completion.

## 21. Future Mobile

Do not build mobile in V1.

Later:
- use Emergent Web → Mobile
- Expo / React Native frontend
- same FastAPI backend
- same MongoDB
- same accounts/login
- independent mobile UI adapted for native use

Backend changes after mobile launch affect both frontends.

## 22. Emergent Platform Basis

Architecture is aligned with Emergent's current documented stack:
- Web target: preserve current React/CRACO/JSX frontend + FastAPI + MongoDB
- Mobile: Expo/React Native + FastAPI + MongoDB
- Web ↔ Mobile can share backend, database and login
- MongoDB is the default database
- external file/media storage is recommended for large assets

References:
- https://help.emergent.sh/faqs
- https://help.emergent.sh/mobile-app-development
- https://help.emergent.sh/web-mobile
- https://help.emergent.sh/platform-documentation
