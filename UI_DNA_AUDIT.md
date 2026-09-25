# BDesigner — Existing Homepage & Project UI DNA Audit

This audit was derived from the preserved source code and `docs/reference-homepage.png`. It records what was transferred into the six master documentation files.

## Audited Source

- `frontend/src/index.css` (including final override cascade)
- `App.js`, ThemeContext, Navbar, MobileDrawer, ThemeToggle
- BDIntro, BDRouteTransition, BDVideoBackground, BDAudioPlayer, BDStickyCta
- Home + all preserved Homepage section components
- ProjectCard, HorizontalScroll
- ProjectDetail, CategoryGallery, FullscreenViewer

## Key Findings

1. **Final palette is monochrome-first**, not the older warm-brown/gold-heavy experiments. Dark uses #0B0B0B/#111/#151515/#1A1A1A. Light uses #F7F7F7/#FFF. Gold #C9A24A remains a restrained accent.
2. **Inter is the effective body + display type system.** Manrope/Outfit are imported historically but are not the public baseline to propagate.
3. **Motion is deliberate and slower than generic SaaS UI:** 720ms section reveals, 520ms public page entry, ~300ms navigation/theme/drawer transitions, 700ms project-image hover zoom.
4. **Homepage geometry is compact/mobile-first:** 16/24/32px horizontal container padding, mostly 40/56px major-section vertical padding.
5. **Project cards are exact reusable visual references:** 200/240/280px, 1:1 image, 16px body padding, 18px title, scale-1.05 image hover.
6. **Project Detail defines future drawing/document UX:** 52/62vh hero, overlapping summary glass card, sticky tabs, A4 210:297 drawing cards, max 560px, fullscreen zoom/pinch/pan/swipe.
7. **Old functionality is not automatically product scope.** Comments/downloads/old service route are preserved code references but PRD/rules decide what survives in V1.
8. **Final CSS cascade matters.** Historical declarations exist before final theme override layers. New work must use the final token system, not copy early legacy blocks.

## Documentation Updated

- `docs/design.md` — exact UI DNA and component/motion specifications
- `docs/rules.md` — mandatory reuse + visual regression rules
- `docs/prd.md` — verified public visual baseline and acceptance
- `docs/architecture.md` — shared UI/token/motion architecture contract
- `docs/task.md` — deep visual baseline verification + implementation checklist
- `docs/memory.md` — compact durable UI DNA memory
