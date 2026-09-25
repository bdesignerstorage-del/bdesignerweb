# BDesigner V1 — Frozen UI/UX Design System

**Status:** Frozen  
**Target:** Responsive React web application

## 1. Design Character

BDesigner must feel:

**Premium + Minimal + Architectural + Trustworthy + Simple**

Use:
- premium dark interface
- warm light equivalent
- charcoal cards
- warm white text
- muted gold accents
- rounded cards
- thin borders
- real architectural photography
- minimal shadow
- Lucide outline icons
- strong whitespace
- simple client UX
- compact professional admin UX

## 1A. Existing Visual Baseline Is the Primary Reference

The current cleaned repository already contains the approved public Homepage and Public Project Detail UI. The file `docs/reference-homepage.png` and the running `/` route are the baseline to preserve.

Existing visual elements must be reused rather than recreated from scratch:
- intro/loading composition
- Navbar
- mobile drawer
- hero image/video behavior
- light/dark mode
- section card language
- typography and spacing rhythm
- sticky CTA
- audio control
- Trending Project cards
- Homeowner Stories
- FAQ
- Footer
- Public Project Detail cards/gallery/viewer

New sections and logged-in panels must visually extend this system. They must not cause a Homepage redesign.

## 1B. Verified UI DNA — Code-Derived Source of Truth

This document has been re-audited against the preserved implementation, not only the reference image. The following files are the visual source used for this pass:

- `frontend/src/index.css`
- `frontend/src/App.js`
- `frontend/src/context/ThemeContext.jsx`
- `frontend/src/components/Navbar.jsx`
- `frontend/src/components/MobileDrawer.jsx`
- `frontend/src/components/ThemeToggle.jsx`
- `frontend/src/components/ProjectCard.jsx`
- `frontend/src/components/HorizontalScroll.jsx`
- `frontend/src/components/CategoryGallery.jsx`
- `frontend/src/components/FullscreenViewer.jsx`
- `frontend/src/components/bd/BDIntro.jsx`
- `frontend/src/components/bd/BDRouteTransition.jsx`
- `frontend/src/components/bd/BDVideoBackground.jsx`
- `frontend/src/components/bd/BDAudioPlayer.jsx`
- `frontend/src/components/bd/BDStickyCta.jsx`
- `frontend/src/components/home/*`
- `frontend/src/pages/Home.jsx`
- `frontend/src/pages/ProjectDetail.jsx`
- `docs/reference-homepage.png`

### Visual precedence

When old CSS comments, old Tailwind classes, generic design prose and the final CSS cascade disagree, use this order:

1. **Current rendered `/` and `/projects/:id` baseline**
2. **Final effective CSS token/cascade rules near the end of `index.css`**
3. **This Verified UI DNA section**
4. Earlier legacy CSS declarations/comments

The repository contains several historical visual experiments. Do **not** copy every old declaration into new modules. Reuse the final effective design language only.

### Product-scope precedence

The current Project Detail code still contains some legacy functions such as Comments, Download Files and an old `/architecture-services` CTA. Those are useful only as **visual-reference components**. Product scope is controlled by `prd.md` and `rules.md`; do not restore obsolete product features merely because old UI code exists.

## 2. Theme Tokens

The final effective public-site palette is a restrained **black / white / soft-grey system with selective warm-gold accents**. Earlier warm-brown glass tokens still exist in historical CSS, but the final `html[data-theme]` rules override them and are the source of truth.

### Dark mode — final effective tokens

```text
--background-primary:   #0B0B0B
--background-secondary: #111111
--background-card:      #151515
--background-elevated:  #1A1A1A
--surface-secondary:    #1A1A1A

--border-primary:       #292929
--border-strong:        #383838
--border-divider:       #242424

--text-primary:         #F5F5F5
--text-secondary:       #B5B5B5
--text-muted:           #777777

--button-primary:       #F5F5F5
--button-primary-text:  #0B0B0B
--button-primary-hover: #E8E8E8

--input-background:     #111111
--input-border:         #2A2A2A
--input-text:           #F5F5F5
--input-placeholder:    #777777

--accent-gold:          #C9A24A
```

### Light mode — final effective tokens

```text
--background-primary:   #F7F7F7
--background-secondary: #FFFFFF
--background-card:      #FFFFFF
--background-elevated:  #FFFFFF
--surface-secondary:    #F7F7F7

--border-primary:       #D9D9D9
--border-strong:        #C8C8C8
--border-divider:       #E5E5E5

--text-primary:         #111111
--text-secondary:       #555555
--text-muted:           #888888

--button-primary:       #111111
--button-primary-text:  #FFFFFF
--button-primary-hover: #222222

--input-background:     #FFFFFF
--input-border:         #D9D9D9
--input-text:           #111111
--input-placeholder:    #888888

--accent-gold:          #C9A24A
```

### Functional status colors

Use only when status meaning requires them:

```text
Success #22C55E
Warning #F59E0B
Error   #EF4444
Info    #3B82F6
```

### Gold usage — very restrained

Warm gold `#C9A24A` is allowed for:

- `.bd-eyebrow` section labels
- `.bd-label-gold` premium/category labels
- `.bd-price-accent` important price values
- rating stars
- selected/premium micro-emphasis where already approved

Do **not** use gold for:

- full page backgrounds
- large card fills
- generic primary buttons
- decorative gradients
- glows/shadows
- every icon

The final CSS explicitly neutralizes old gold glows and many old gold utility classes. New screens should use the final token system directly instead of relying on legacy gold utilities.

### Theme behavior

- Theme state lives on `<html data-theme="dark|light">`.
- User choice persists in `localStorage` under `bd-theme`.
- First visit follows device `prefers-color-scheme`; fallback is Dark.
- During a theme switch, background/border/text/fill/shadow transition over **300ms ease**.
- The temporary `theme-anim` class is removed after approximately **360ms**.
- Light mode navbar is approximately `rgba(255,255,255,0.90)` with `#E5E5E5` border.
- The white logo is filtered to black in the light navbar/footer rather than swapping visual identity.

## 3. Typography

The rendered baseline is **Inter-first**. Do not introduce another heading font into new modules unless specifically approved.

`index.css` imports Inter, Outfit, Manrope and language-support fonts, but the effective public design system uses Inter for both body and display roles.

### Body baseline

```text
font-family: Inter, system-ui, -apple-system, sans-serif
font-weight: 400
font-size: 16px
line-height: 1.6
letter-spacing: -0.011em
font-feature-settings: "cv11", "ss01"
font smoothing: antialiased
```

### Display baseline

```text
font-family: Inter
font-weight: 700
letter-spacing: -0.02em
```

### Existing reusable type scale

| Token | Desktop | Mobile ≤640px | Weight | Line height | Tracking |
|---|---:|---:|---:|---:|---:|
| `.t-display` | 56px | 38px | 700 | 1.2 | -0.03em |
| `.t-page` | 36px | 28px | 700 | 1.2 | -0.02em |
| `.t-section` | 28px | 23px | 700 | 1.25 | -0.02em |
| `.t-card` | 22px | 20px | 700 | 1.3 | -0.01em |
| `.t-subtitle` | 18px | same | 600 | 1.5 | normal |
| `.t-body` | 16px | same | 500 | 1.65 | normal |
| `.t-small` | 15px | same | 500 | 1.6 | normal |
| `.t-label` | 14px | same | 600 | 1.4 | normal |
| `.t-eyebrow` | 12px | same | 700 | 1.2 | 0.18em |
| `.t-stat-num` | 34px | same | 700 | 1.1 | -0.02em |

### Homepage heading pattern

Current sections typically use:

- eyebrow: `11px` mobile → `12px` small+, uppercase, `600–700`, `0.18em` tracking
- section heading: `24px` mobile → `30px` small → `36px` large where the section is high emphasis
- compact sections may use `20px → 24px → 30px`
- body/support text: mostly `12–16px`
- card titles: generally `16–18px`, medium/semibold/bold depending on hierarchy

### Gold eyebrow primitive

`.bd-eyebrow`:

```text
color: #C9A24A
font-size: 0.72rem (~11.5px)
font-weight: 700
letter-spacing: 0.16em
text-transform: uppercase
line-height: 1.4
```

### Multilingual intro type

Intro words use:

```text
Inter + Noto Sans Devanagari + Noto Sans Kannada fallbacks
font-weight: 600
font-size: clamp(2.2rem, 8vw, 5rem)
line-height: 1.05
letter-spacing: 0.01em
```

The BDesigner brand/logo slot is visually stronger (`800` if text is used; current implementation uses the logo image for the BDesigner step).

## 4. Spacing

The code uses a compact mobile-first rhythm rather than oversized SaaS whitespace.

### Main public container

```text
max-width: max-w-7xl ≈ 1280px
mobile horizontal padding: 16px (`px-4`)
small/tablet padding: 24px (`sm:px-6`)
large/desktop padding: 32px (`lg:px-8`)
```

Some compact blocks use `max-w-6xl`; reading-focused content can use narrower widths.

### Homepage vertical rhythm

Most major sections:

```text
mobile: py-10 = 40px
small+: py-14 = 56px
```

Construction Process:

```text
mobile: py-8 = 32px
small+: py-12 = 48px
```

Horizontal-scroll section:

```text
mobile: py-5 = 20px
small+: py-8 = 32px
```

Homepage top spacer after hero:

```text
mobile: 32px
small: 48px
large: 64px
```

### Card/rail gaps

- common card gap: `12–16px`
- homeowner story gap: `16px` mobile / `20px` small+
- project rail gap: `16px`
- section heading bottom gap: generally `12–32px` depending on section
- cards commonly use `16px` inner padding; larger panels use `20–32px`

Do not arbitrarily increase spacing in new panels. Reuse this compact architectural rhythm.

## 5. Radius

Use rounded geometry consistently, but do not make every element a giant pill.

Observed baseline:

- general/global card: **14px**
- common homepage card: **16px** (`rounded-2xl`)
- premium card/panel: **18–24px**
- large section containers: **24px** (`rounded-3xl`)
- input field: **14px** common premium baseline
- icon chip: **10–12px**
- mobile sticky CTA button: **16px**
- modal/premium containers: approximately **20–24px**
- chips/tabs/badges/primary pill actions: **999px / full pill**

Legacy `--bd-radius-sm/md/lg` values exist (`12/20/28px`), but new components should visually match the rendered component family rather than force 28px everywhere.

## 6. Borders & Shadows

BDesigner uses borders for separation more than heavy elevation.

### Borders

- default light hairline: `#D9D9D9` or `#E5E7EB`
- default dark hairline: `#292929`
- dark subtle white-alpha borders over photography/glass: usually `rgba(255,255,255,0.08–0.20)`
- hover may strengthen to the `--border-strong` token

### Shadows

Keep shadows restrained:

- normal cards: none or very low shadow
- Project card idle: approximately `0 2px 10px rgba(15,23,42,0.05)` before final theme mapping
- Project card hover: approximately `0 10px 28px rgba(15,23,42,0.10)`
- navbar after scroll: `0 6px 24px rgba(0,0,0,0.35)`
- drawer: `0 10px 40px rgba(0,0,0,0.5)`
- audio pill: `0 8px 30px rgba(0,0,0,0.28)`

The final CSS explicitly removes old warm-gold glow shadows. Do not recreate gold glow effects.

### Glass

Theme-aware glass primitives:

- `.glass` → `var(--bd-glass)` + theme border
- `.glass-strong` → `var(--bd-glass-strong)` + theme border
- common blur: **14–24px** for overlay surfaces
- dark-content backdrop on Homepage uses the final token-driven surface, not a random grey overlay

Use glass only where the existing page uses it: overlapping project hero card, nav, drawers, overlays, floating controls. Normal dashboard cards should usually use solid token surfaces.

## 7. Icons

Use **Lucide React** outline icons throughout.

Current package: `lucide-react ^0.507.0`.

Observed sizes:

- 14px micro/stat icon
- 16px standard inline
- 18–20px action/icon-chip
- 20–22px navbar/mobile controls
- 24–28px larger feature icons

Stroke widths normally stay around Lucide default or explicitly `1.75–1.9` for refined top-bar controls.

Neutral icon chips are preferred. Only active/selected/premium states receive stronger inversion/accent treatment.

## 8. Buttons

The main button system is monochrome inversion, not gold-filled CTA design.

### Primary action

Light mode:
- black/dark background
- white text

Dark mode:
- white/light background
- near-black text

Typical behavior:
- medium/semibold (`600–700` depending on importance)
- pill or rounded-16 geometry
- active press `scale(0.98–0.99)`
- hover changes neutral surface and may lift by `0.5px` on older shared buttons

### Mobile sticky CTA

Current public sticky CTA:

```text
height: 50px
radius: 16px
font-size: 14px
font-weight: 700
```

Light: black button / white text.  
Dark: white button / black text.

### Secondary/outline

- theme surface background
- 1px neutral border
- primary text color
- subtle hover surface
- no heavy shadows

### White-over-photo action

For hero/photo overlays, white outline CTA may use:

```text
border: rgba(255,255,255,0.6)
hover background: rgba(255,255,255,0.14)
```

### Rule

Prefer **one dominant action** per screen/card group. Do not create multiple equal-weight CTAs.

## 9. Responsive

The current implementation is mobile-first and relies mainly on Tailwind breakpoints.

Use these verification widths:

- **390px** — primary mobile reference
- **430px** — larger mobile
- **640px** — Tailwind `sm` transition
- **768px** — tablet / Tailwind `md`
- **1024px** — desktop / Tailwind `lg`
- **1440px** — large desktop visual regression

Important implementation behavior:

- public Navbar desktop controls appear at `md` (768px+)
- mobile drawer is `md:hidden`
- public sticky consultation CTA is `sm:hidden` (<640px)
- hero uses `100svh`
- page must never exceed `100vw`
- horizontal rails hide their scrollbar and use native touch swipe + snap
- desktop mouse wheel is translated to horizontal scrolling inside `HorizontalScroll`
- orientation, not just width, chooses portrait vs landscape hero video

## 10. Mobile Rules

- main public page padding: **16px**
- minimum touch target: **44px**, with many top-bar buttons at **40px** only where the current baseline already uses them
- no page-level horizontal overflow
- horizontal rails must be intentional, scroll-snap enabled and scrollbar-hidden
- use cards instead of squeezed tables in logged-in panels
- respect `env(safe-area-inset-top/bottom)`
- fixed/sticky controls must reserve content space
- public sticky CTA adds bottom page padding so content is never covered
- audio control sits above the sticky CTA on mobile
- mobile drawer and modal states must hide conflicting floating CTA/audio controls
- mobile authenticated client panel later uses its own fixed bottom navigation; do not stack public sticky CTA underneath it

## 11. Desktop Adaptation

Desktop is a deliberate composition, not stretched mobile.

Public pages:
- use `max-w-7xl` containers
- retain horizontal rails where they are part of the visual language
- use larger project/detail hero height (`62vh` at `sm`+)
- use multi-column layouts only where the current content benefits

Operational panels:
- fixed/collapsible left sidebar
- compact top bar
- tables where the data genuinely benefits from columns
- content max-width and spacing derived from public tokens
- no unrelated enterprise-dashboard visual language

## 12. Intro Screen

Preserve the current `BDIntro` behavior unless the user explicitly changes it.

### Composition

- fixed full viewport
- z-index above all app chrome
- blurred architectural background (`blur(6px)`, image scale `1.08`)
- dark vertical overlay approximately `rgba(20,16,9,0.42 → 0.58)`
- exactly **one** center word/value visible at a time
- large numeric counter bottom-right
- no buttons or spinner

### Current multilingual sequence

```text
Hello
Welcome
to
BDesigner
नमस्ते
स्वागत
ನಮಸ್ಕಾರ
ಸ್ವಾಗತ
नमस्कार
Home
```

### Timing

Normal motion:

```text
STEP per word: 560ms
fade part of each step: 30% ≈ 168ms
last-word hold: 420ms
component reveal window: 820ms
```

The CSS curtain keyframe is authored as `1000ms cubic-bezier(0.76,0,0.24,1)` while the JS lifecycle completes at the component reveal window. **Do not “clean this up” casually; preserve current observed behavior unless a dedicated intro refinement is approved.**

### Counter

- uses tabular numerals
- `font-weight: 300`
- `clamp(2rem, 6vw, 3.4rem)`
- padded 2-digit display until it reaches 100

### Reveal

Bottom-to-top curtain via `clip-path`.

### Reduced motion

The sequence speeds up substantially (`STEP 240ms`, hold `160ms`, reveal `340ms`) and animation-heavy treatments are disabled/reduced.

## 13. Homepage

The current `Home.jsx` is the approved baseline. Preserve it first; new sections must extend its UI DNA.

### 13.1 Hero

Current implementation:

- section height: `100svh`
- fixed video canvas behind page content
- `object-fit: cover`
- no gradient wash over footage
- no Ken Burns
- no zoom/parallax animation
- no visible playback controls
- autoplay + loop + muted + `playsInline`
- portrait orientation → `/hero-portrait.mp4`
- landscape orientation → `/hero-landscape.mp4`
- only one orientation-specific video is mounted at a time
- hero remains visually clean; current logo/tagline content is intentionally removed

Desktop/small+ scroll cue:
- centered bottom
- `10px` uppercase text
- tracking `0.28em`
- thin `40px` vertical line
- line animation: `2.4s ease-in-out infinite`

### 13.2 Content-over-hero behavior

After the empty hero viewport, the Homepage content begins in the `bd-content-glass` surface with a top breathing spacer:

- mobile `32px`
- small `48px`
- large `64px`

The visual idea is **clean architectural hero first, structured content surface second**.

### 13.3 Repeated section-heading DNA

Common pattern:

1. warm-gold eyebrow
2. bold Inter heading
3. optional short support copy
4. content/cards directly below

Eyebrow is usually `11px → 12px`, uppercase, tracking `0.18em`.

### 13.4 Trust Indicators

- `max-w-6xl`
- rounded-2xl container
- 2×2 mobile → 4 columns small+
- no individual stat cards/icons
- border around the whole strip only
- number `20px → 26px → 30px`, bold, tight line-height
- label around `9.5–11px`, uppercase, tracking `0.14em`
- generous but compact vertical spacing

### 13.5 Construction Process

- horizontal touch/scroll rail
- card width `230px` mobile / `260px` small+
- card radius 16px
- card padding 16px
- icon chip 44×44px
- step number micro-label
- arrows between cards only at desktop where appropriate
- one full-width section CTA below

### 13.6 Available in Bengaluru / Service Area

- 1 column → 2 columns at large desktop
- image panel is square, max about `448px`
- image card radius 24px
- bottom photo gradient for copy legibility
- service areas use small pill chips
- CTA remains compact, not oversized

### 13.7 Guarantees You Deserve

Distinctive interaction pattern worth reusing selectively:

- left vertical icon selector
- right portrait image panel
- grid columns approximately `76px / remaining` mobile, `100px / remaining` small, `220px / remaining` large
- active icon uses ring/accent and slight scale
- portrait panel ratio `3:4` mobile, `4:5` small, `3:4` large
- max panel height about `560px`
- content anchored at bottom over image gradient
- active guarantee auto-rotates every **6s** until user interacts
- panel change uses roughly `500ms` fade behavior

### 13.8 Why Choose BDesigner

- 3-column comparison table
- first feature column roughly `54–60%`
- BDesigner/Others approximately `20–23%` each
- `table-fixed` so mobile does not produce page-level horizontal overflow
- rounded-3xl outer container
- quiet row separators
- success/error/partial indicators are small semantic pills/icons
- dark-mode visual is deep neutral; final Light mode converts this to a clean white card with dark text while keeping geometry identical

### 13.9 Trending Projects

Uses the shared `HorizontalScroll` + `ProjectCard` patterns described later.

### 13.10 Homeowner Stories

Current visual baseline:

- horizontal scroll-snap rail
- card width `290px` mobile / `340px` small+
- 16–20px gaps
- radius 16px
- border, no heavy shadow
- quote icon
- 5-star row; active stars use gold accent
- review body around 14px
- desktop has left/right round controls

**Current code is manual horizontal scrolling.** The product target may later add timed auto-rotation, but preserve this visual structure when doing so.

### 13.11 FAQ

- left-aligned heading
- accordion directly below
- max reading width about `48rem` (`max-w-3xl`)
- rounded-2xl container
- one open item at a time
- rows use `16–20px` horizontal padding, `16px` vertical
- chevron rotates 180° on open

### 13.12 Planned Architectural Services Section

Add inside Homepage only, not as a separate route.

Use the same section-heading/card language. Service cards should contain:
- image/icon
- service title
- short description

Do not place one button on every service card.

One section CTA:
**Plan Your Dream Home**

### 13.13 Homepage visual freeze rule

Do not globally “modernize” the Homepage while adding future sections. Any new component must be visually compared with the existing sections before approval.

## 14. Public Navigation

### Current public Navbar baseline

- fixed at top
- height: **64px** (`h-16`)
- z-index: very high so it stays above content
- max content width: `max-w-7xl`
- horizontal padding: 16 / 24 / 32px
- backdrop blur: `backdrop-blur-xl`
- transition duration: **300ms**

Over the Homepage hero:

```text
background approximately rgba(20,16,9,0.30)
white/15 bottom border
white nav text
```

After scrolling more than ~10px:

```text
background approximately rgba(20,16,9,0.85)
white/10 bottom border
shadow 0 6px 24px rgba(0,0,0,0.35)
```

Final Light mode maps the navbar to approximately:

```text
rgba(255,255,255,0.90)
border #E5E5E5
black controls/text
white logo filtered to black
```

Desktop navigation appears at `md` (768px+). Icon action buttons are approximately **40×40px**, round.

### Public mobile drawer

- left-side slide-in
- backdrop: `rgba(0,0,0,0.45)`
- panel width: **90vw**, max **420px**
- height: `100dvh`
- respects top safe area
- backdrop and panel animation: **300ms ease-out**
- panel background uses dark translucent/blurred shell in the current baseline
- scrollable body; sticky search near top
- internal body fade: about **340ms ease-out** from `translateY(4px)`
- swipe gesture can close the drawer
- opening drawer hides floating sticky CTA/audio so controls do not collide

### Target public menu items

Per product rules, final public navigation is:
- Home
- Projects
- How It Works
- About Us
- FAQs
- Contact Us
- Plan Your Dream Home
- Download App / Get BDesigner App
- Login

Old drawer/footer links such as Packages, Cost Calculator, News or separate Architectural Services are legacy visual references only until rebuilt/removed according to the PRD.

### Search overlay

Preserve the current interaction language:
- full-screen overlay
- sticky search header
- search-down entry: **220ms** using `cubic-bezier(0.22,1,0.36,1)` from `translateY(-8px)` + fade
- input is a rounded pill
- live-search debounce: **220ms**
- result cards use compact image + text + chevron

### Download App / Get BDesigner App

Keep one visible but non-intrusive public install entry. Do not scatter app-download buttons through every section.

## 15. Public Project UI

The current `/projects/:id` page is a major visual reference for future project/drawing/document experiences.

### 15.1 Hero

```text
mobile height: 52vh
sm+ height: 62vh
image: full-width object-cover
overlay: dark gradient from bottom upward
```

Gallery previous/next controls:
- 40×40px round
- semi-transparent black
- backdrop blur
- centered vertically at left/right

### 15.2 Overlapping project summary card

The main summary card overlaps the hero:

```text
mobile overlap: -128px
sm+ overlap: -176px
container: max-w-7xl
card: glass-strong
radius: 24px
padding: 24px mobile / 32px sm+
```

Content hierarchy:
1. small tag/style pills
2. large project title
3. location
4. small activity statistics
5. share action
6. quick specification grid

Project title baseline:
- `30px` mobile (`text-3xl`)
- `48px` small+ (`text-5xl`)
- bold Inter/display
- tight tracking

Quick specs:
- 2 columns mobile
- 4 columns small
- 5 columns large
- compact icon + 10px uppercase label + small semibold value

### 15.3 Sticky project tab rail

- sticky below navbar at `top: 64px`
- z-index ~30
- theme-aware translucent surface + backdrop blur
- horizontal overflow allowed on narrow screens
- scrollbar hidden
- pill tabs
- active state uses high-contrast selected styling

**Product-scope note:** current baseline includes Overview / 2D Floor Plan / 3D Elevation / Comments / Download Files. Future V1 should show only the tabs approved by `prd.md`; reuse the visual tab rail, not obsolete legacy functionality.

### 15.4 Content panels

- main container `max-w-7xl`
- mobile 16px padding / larger 24–32px
- top content margin about 40px
- overview uses 1 column → 3-column desktop grid
- core content can span 2/3 columns
- `.glass` panels use radius 16px and padding `20–24px`

### 15.5 Floor-plan / elevation gallery

`CategoryGallery` is an approved drawing-view pattern:

- category pills wrap rather than forcing page overflow
- active category visibly selected
- vertical image stack, not a sideways drawing carousel
- drawing card max width: **560px**
- A4 portrait ratio: **210 / 297**
- gap: **20px** mobile / **24px** small+
- `object-contain` so plans are never cropped
- maximize control appears over card
- bottom-left image count pill

This pattern is highly reusable for future Client Drawings.

### 15.6 Fullscreen viewer

Keep it minimal and distraction-free:

- full-screen dark canvas
- image centered and aspect ratio preserved
- close top-right
- previous/next navigation
- wheel zoom desktop
- pinch zoom mobile
- double-tap zoom mobile
- drag/pan when zoomed
- swipe left/right when not zoomed
- keyboard Left/Right/Esc/+/-/0

Viewer constants in current implementation:

```text
minimum zoom: 1x
maximum zoom: 5x
zoom step: 0.5x
double-tap zoom: 2.5x
double-tap window: 300ms
swipe threshold: 60px
swipe velocity: 0.3 px/ms
```

### 15.7 Project cards — exact Trending Projects DNA

Compact card widths:

```text
mobile: 200px
small: 240px
large: 280px
```

Image:
- exact `1:1` square
- object-cover
- hover zoom to **1.05**
- image transition **700ms**

Card:
- radius 16px
- border hairline
- body padding **16px**
- body vertical gap **12px**
- hover lift **-4px**
- card transition **300ms**

Content order:
1. style chip
2. title
3. budget/price
4. views + shares

Title:

```text
18px
weight 600
line-height 1.4
maximum 2 lines
```

Budget:
- ~15px
- one line
- `.bd-price-accent` gold

Stats:
- ~11px
- small 14px icons

Use this card family when future modules need visual project previews; do not replace it with generic dashboard tiles.

## 16. How It Works

Numbered premium cards:
1. Share Requirement
2. Get Pricing
3. Create Account
4. Team Assigned
5. Design & Review
6. Final Drawings + BOQ
7. Construction Proposal
8. Construction Execution

## 17. About

- hero/image
- gold eyebrow
- company story
- architecture Pan India
- turnkey construction
- trust/process
- CTA
- optional audio

## 18. FAQs

Use approved accordion.

Categories may include:
- Architecture
- Payments
- Revisions
- Construction
- Account & Project

## 19. Contact

- Call
- Email
- Book A Call
- Office details
- simple contact form

## 20. Requirement Form

Mobile:
- header
- step title
- short support text
- selectable cards
- sticky bottom price/action
- horizontal-scroll groups

Desktop:
- left: progress/project summary/live price
- right: active form

Do not redesign approved cards.

## 21. Login / Register

Match premium form language.

Registration:
- after summary/pricing
- email/password
- optional Google
- phone disabled/Coming Soon if visible

## 22. Client Navigation

### Mobile Authenticated Client Shell

Use the uploaded mobile reference as layout inspiration while preserving the BDesigner visual system.

#### Sticky Top Bar
Approximate height: 64–72px plus top safe area where required.

Layout:
- **Top-left:** hamburger / three-line icon
- **Center:** BDesigner logo/wordmark, optically centered to viewport
- **Top-right:** Light/Dark toggle
- **Far top-right:** notification bell with optional unread dot/count

Use a subtle bottom border and current theme surface. The logo must not be pushed left/right by unequal side controls.

#### Fixed Sticky Bottom Navigation
Approximate visual height: 64–72px plus `safe-area-inset-bottom`.

From left to right:
1. **Home**
2. **Search**
3. **Project**
4. **Site Updates**
5. **Account**

Use Lucide-style icons and short labels.

Active item:
- muted gold accent
- clear active icon/label state

**Project**:
- center position
- may use a raised circular/rounded action treatment inspired by the reference
- may use muted-gold fill with dark icon
- do not make it oversized or visually disconnected from the rest of the UI

Behavior:
- Home → dashboard
- Search → authenticated client search
- Project → current project; My Projects when multiple
- Site Updates → site-update feed
- Account → profile/account

Before construction:
- Site Updates remains visible
- destination shows **Available after construction starts**
- do not change the bar order

#### Hamburger Drawer
Secondary destinations:
- Chat
- Drawings
- Documents
- Payments
- Book A Call
- Notifications
- Help / Support
- Logout

### Desktop / Tablet
Continue using the approved sidebar/top-navigation experience. Do not force the mobile bottom bar onto desktop.

### Construction Access
Construction-specific content remains locked until activation.

## 23. Dashboard

Architecture order:
1. Project summary
2. Current stage
3. Services
4. Team
5. Book A Call
6. Track Status
7. Payments
8. Recent updates

Construction expansion:
1. Project summary
2. Current construction stage
3. Action Required
4. Latest Site Update
5. Next Activity
6. Payment milestone
7. Team
8. Progress
9. Quick Access

Do not create a visually unrelated second dashboard.

## 24. Drawings

Flow:
Service Card → Service Drawings → Drawing → Fullscreen Viewer

Viewer:
- Back
- Title
- Zoom
- Pan
- Swipe
- Download

No CAD tools.

## 25. Chat

Mobile:
- full-screen conversation
- project title
- members
- messages
- composer

Composer:
- attachment
- text
- voice
- send

Desktop:
- left list
- center conversation
- optional right info

## 26. Documents

- category cards
- search
- simple filters
- Final Documents first
- Previous Versions collapsed

Client:
- View
- Download

## 27. Notifications

Tabs:
- All
- Project
- Payments
- Construction

Item:
- icon
- title
- short message
- project
- time
- unread state

## 28. Admin Visual System

- fixed/collapsible dark sidebar
- top search
- compact metric cards
- charcoal panels
- thin borders
- muted gold accent
- dense readable tables
- clear active state
- mobile cards/hamburger

No heavy analytics.

## 29. Final Admin Sidebar

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

## 30. Website CMS

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

Desktop:
- secondary tab navigation
- main editor
- optional preview panel

Mobile:
- horizontal tab chips/dropdown
- one editor
- Preview action

CMS edits content only.

## 31. Website CMS — Homepage

Subsections:
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

Editor can expose:
- text
- media
- active/show toggle
- allowed ordering
- Save
- Preview

No CSS/layout controls.

## 32. Admin Dashboard

Only:
- New Leads
- Active Architecture Projects
- Construction Projects
- Pending Payments
- Recent Leads
- Projects Requiring Attention
- Recent Activity

## 33. Admin Leads

Desktop:
- compact table

Mobile:
- cards

Header:
- Leads
- Search
- Filter
- Add Lead

Actions:
- View
- Edit
- Assign PM
- Convert
- Close
- Delete when safe

## 34. Admin Project Detail

Header:
- Project ID
- Client
- Location
- Phase
- Stage
- PM
- Payment status

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

## 35. Package Builder

Desktop:
- Admin sidebar
- header
- stepper
- editor ~70%
- sticky summary ~30%

Steps:
1. Project
2. Package
3. Specifications
4. Inclusions
5. Variations
6. Cost
7. Payments
8. Timeline
9. Preview

Mobile:
- horizontal step pills
- one editor card
- tables → cards
- sticky actions

## 36. Construction Progress

Mobile:
- vertical stage cards

Desktop:
- stage list left
- selected stage detail right

No Gantt.

## 37. Site Updates

Photo-led feed:
- date
- stage
- uploader
- status/type
- note
- media
- next activity

Fullscreen viewer:
- swipe
- zoom
- caption/date

## 38. Handover

Client:
- Your Home Is Ready
- Completed
- final image/gallery
- summary
- final documents
- checklist
- feedback

Admin/PM:
- checklist
- Complete & Handover Project

## 39. Form Anatomy

- label
- control
- helper/error

Primary mobile input:
- ~52–56px

States:
- default
- focus
- filled
- disabled
- error
- success

## 40. Status Badges

Neutral:
- Draft
- Not Started

Info:
- In Review

Warning:
- Action Required
- Payment Due

Success:
- Approved
- Paid
- Completed
- Available

Error:
- Failed
- Overdue

Status must not rely only on color.

## 41. Motion

BDesigner motion is slow enough to feel architectural/premium but not theatrical.

### Motion tokens observed in code

| Interaction | Timing | Easing / movement |
|---|---:|---|
| Section scroll reveal | 720ms | `cubic-bezier(0.22,1,0.36,1)`, `translateY(24px)` |
| Reveal trigger | — | IntersectionObserver threshold `0.12`, bottom root margin `-8%` |
| Page content entry | 520ms | same premium cubic, `translateY(10px)` → 0 |
| Internal veil in | 260ms | ease-out |
| Route word | 520ms | `cubic-bezier(0.22,1,0.36,1)` |
| Route veil begins out | after ~420ms | state timing |
| Internal veil out | 460ms | ease-in |
| Route transition total | ~900ms | then unmount |
| Theme switch | 300ms | ease; helper class removed at ~360ms |
| Navbar surface | 300ms | transition-all |
| Mobile drawer | 300ms | ease-out, horizontal slide |
| Drawer body fade | 340ms | ease-out, `translateY(4px)` |
| Search overlay entry | 220ms | premium cubic, `translateY(-8px)` |
| Project card hover | 300ms | lift up 4px + shadow |
| Project image hover zoom | 700ms | scale 1 → 1.05 |
| General tactile card | 350ms | `cubic-bezier(0.2,0.8,0.2,1)` |
| Guarantee panel | ~500ms | fade-in |
| Guarantee auto-rotation | 6000ms | stops after user interaction |
| Sticky CTA hide/show | 320ms | transform + opacity |
| Audio button hover | 150ms | scale to ~1.06 |
| Audio progress fill | 200ms | linear |
| Skeleton shimmer | 1400ms | repeating |
| Hero scroll cue | 2400ms | ease-in-out infinite |

### Internal route transition rule

The word/veil transition applies to public/internal marketing routes, but the old code explicitly avoided route veil transitions inside operational dashboard routes. Preserve that principle: **panel navigation should feel immediate**, not play a full marketing transition on every dashboard click.

### Reduced motion

Respect `prefers-reduced-motion`:
- reveal elements become immediately visible
- smooth document scrolling is disabled
- page fade disabled
- intro animation substantially reduced
- skeleton/hero cue animations disabled or reduced
- route veil duration shortened

### Motion rule

Do not add random bounces, parallax, spring effects or large zooms. Reuse the existing fade/translate/scale vocabulary.

## 42. Accessibility

Minimum requirements:

- WCAG AA text contrast where applicable
- semantic headings
- keyboard-accessible controls
- visible focus states
- meaningful button labels / `aria-label` for icon-only actions
- alt text for meaningful project/media images
- modal/drawer `role="dialog"` and appropriate modal semantics
- body scroll lock for full-screen overlays/viewers where already used
- minimum practical touch targets
- status meaning cannot rely on color alone
- respect `prefers-reduced-motion`
- fullscreen project viewer supports keyboard navigation and Escape
- drawer/backdrop and search overlay must remain dismissible
- plans/drawings use `object-contain`, not crop, so information is not lost

## 43. Reusable Components

- Button
- IconButton
- Input
- Textarea
- Select
- Checkbox
- RadioCard
- Toggle
- Chip
- Badge
- Tabs
- Accordion
- Card
- ImageCard
- ServiceCard
- ProjectCard
- MetricCard
- Stepper
- ProgressBar
- Drawer
- BottomSheet
- Modal
- Toast
- Skeleton
- EmptyState
- Navbar
- Sidebar
- BottomNav
- Breadcrumb
- Table
- Pagination
- FileUploader
- FileCard
- DrawingCard
- ChatMessage
- NotificationItem
- TeamMemberCard
- PriceSummary
- StatusBadge
- CMSSectionEditor
- MediaPicker
