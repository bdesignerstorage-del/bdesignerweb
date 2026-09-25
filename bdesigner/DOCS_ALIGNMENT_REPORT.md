# BDesigner Docs Alignment Report

The six `/docs` files were updated to match the cleaned repository baseline.

Key alignment changes:

- The clean repository is now explicitly the starting point; Emergent must not create a new scaffold.
- Existing `/` Homepage and `/projects/:id` Project Detail are protected/frozen baseline screens.
- Existing public UI components and minimal FastAPI APIs are documented as compatibility contracts.
- Frontend architecture now matches the real repository: React 19 + JavaScript/JSX + CRA/CRACO + Tailwind, not a forced TypeScript/Next.js migration.
- Backend architecture now matches the real repository: FastAPI + Motor/MongoDB + bcrypt/JWT cookie auth.
- Phase 0 now means verify/replace GitHub with the cleaned baseline, not build a new project.
- Phase 1 extends the existing design system instead of rebuilding the Homepage.
- Phase 2 hardens the existing auth foundation instead of replacing it.
- Phase 3 preserves existing public screens and adds only approved enhancements.
- Website CMS instructions reuse the existing `homepage_cms.py`/Homepage read model instead of creating a competing duplicate CMS.
- Architectural Services remains a future Homepage section only; no separate landing page.
- Mobile client top/bottom navigation and PWA/app-install requirements remain in the documentation.
