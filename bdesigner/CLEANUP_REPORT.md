# BDesigner Legacy Cleanup Report

## Goal

Create a safe clean baseline from the uploaded legacy repository while
preserving the approved public Homepage and the Project Detail screen linked
from Homepage Trending Projects.

## Preserved frontend

Only the dependency graph required by these preserved experiences remains:

- Homepage
- Project Detail
- Navbar / mobile drawer
- Search overlay
- Footer
- Intro / background / hero video system
- Theme system
- Login/Create Account modal
- Homepage lead modal/form
- Homepage advisor visual entry point
- Project share/gallery/viewer support

## Removed frontend

Removed the old Admin, PM, Client ERP, Civil Engineer, Brand Partner,
marketplace, commercial, package, payment, agreement, CRM and other legacy page
implementations. Legacy public page components outside the clean Homepage base
were also removed.

## Preserved backend surface

The backend was replaced with a deliberately small public API supporting:

- `/api/health`
- authentication needed by the existing modal
- `/api/settings`
- `/api/homepage/sections`
- public project listing/detail/share/comments
- project-only search
- homepage enquiry submission
- lightweight click tracking
- homepage advisor when configured

The old operational ERP/backend modules were removed.

## Security cleanup

`admin_token.txt` was removed from the cleaned repository. If that file ever
contained a real active credential, rotate/revoke the credential before using
this repository publicly.

## Route behavior

Only `/` and `/projects/:id` are retained as real public content routes.
Legacy links that remain visible in the preserved UI are temporarily redirected
to `/` until their replacement modules are built from the new product docs.

## Next build step

Verify the preserved public visual baseline first. Then build the new platform
phase-by-phase from `/docs/task.md` rather than restoring legacy modules.

## Cleanup result

- Original uploaded repository: 728 files, approximately 24 MB extracted.
- Clean baseline: 83 files, approximately 8.3 MB extracted (the visual reference image in `/docs` accounts for most of this size).
- Preserved reachable frontend source graph: 50 local source files.
- Legacy Admin/PM/Client ERP/Civil/Brand/marketplace source directories: removed.
- Legacy backend ERP/deprecated source directories: removed.
- Local frontend import validation: passed with 0 unresolved local imports.
- Python syntax validation for the clean backend: passed.

### Build validation note

A full `npm install` / production frontend build could not be completed in the
current sandbox because dependency installation exceeded the available command
time. The source dependency graph was validated statically and contains no
unresolved local imports. Run `npm install && npm run build` in Emergent/GitHub
CI before replacing the live deployment.
