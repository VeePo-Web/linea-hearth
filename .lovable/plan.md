

# World-Class Lookbook Page Redesign

## Current State Audit

### What's Working (Preserve)
- Dark stone-900 palette with amber-500 accent creates strong brand identity
- Snap-scroll vertical navigation is on-trend for editorial lookbooks
- Desktop right-rail dot navigation with hover labels is clean
- Mobile bottom pill nav with Instagram-style dots is intuitive
- Swipe-to-add gesture on mobile is innovative (Tinder-pattern)
- Clip-path image reveals and cinematic motion timing feel premium
- Scripture references as editorial eyebrows are unique brand storytelling
- "Shop the Look" product grid with quick-add is functional

### What's Hurting Premium Perception
1. **Hero feels flat** -- pure black with text only, no atmospheric imagery or editorial tension; compares poorly to DAZED/032c magazine openers that always lead with a striking visual
2. **Look sections are repetitive** -- every look uses the identical 60/40 image-text split; no editorial pacing variation (quiet/loud/quiet rhythm)
3. **Scroll indicator positioning conflicts** -- "SCROLL" text and the animated line overlap with "SS25" season tag on smaller desktops, creating visual clutter
4. **Content side feels empty on desktop** -- the 40% text panel has too much negative space with no products visible (they're only in "Shop the Look" below the fold of each snap section)
5. **Mobile look sections split 50/50** -- the image gets only half the viewport, losing the full-bleed impact that makes lookbooks compelling on mobile
6. **No editorial transitions between looks** -- snap-scrolling from one look to the next is abrupt; no interstitial or visual breathing
7. **FitGuide section breaks the dark editorial flow** -- it's functional but feels like a different page
8. **"Swipe to Shop" button uses rounded-lg** -- violates the site's `rounded-none` design system standard
9. **Gender badge uses rounded-full** -- same violation; should be sharp-edged
10. **No video integration** -- VideoEmbed component exists but is never used in look sections despite `video_url` field existing

### Highest-Impact Changes (Lowest Risk)

| Priority | Change | Impact |
|----------|--------|--------|
| 1 | Hero: add background image with overlay for editorial weight | Massive first-impression upgrade |
| 2 | Vary look layouts (full-bleed, split, asymmetric) per index | Breaks monotony, creates magazine pacing |
| 3 | Mobile: 70/30 image/content split instead of 50/50 | Products still visible, image dominates |
| 4 | Add subtle interstitial dividers between looks | Smoother editorial rhythm |
| 5 | Fix border-radius violations (rounded-lg/full to rounded-none) | Design system consistency |
| 6 | Surface 2 product thumbnails in the content panel on desktop | Converts "browse" to "shop" without leaving the look |

---

## Luxury Upgrade Rules (Design System for Lookbook)

### Spacing Scale
- 4px (micro-gap between badges), 8px (card gaps), 16px (section inner padding), 24px (between content blocks), 48px (between major elements), 80px (section breathing on mobile), 120px (section breathing on desktop)

### Typography Hierarchy
- Look index: `text-[20rem]` font-extralight at 3% opacity (background watermark) -- already in place
- Headline (faith statement): `text-4xl lg:text-5xl` font-extralight italic
- Look name: `text-xl` font-light
- Scripture reference: `text-xs` uppercase tracking-wide amber-500
- Body: `text-sm` font-light white/60
- Eyebrow labels: `text-[10px]` uppercase tracking-[0.25em]

### Button Hierarchy
- Primary CTA: `bg-amber-600 text-white rounded-none` (Add Complete Look)
- Secondary CTA: `bg-white/10 text-white rounded-none border border-white/20` (Swipe to Shop)
- Ghost: `bg-transparent text-white/50 hover:text-white`
- All buttons: `rounded-none` (NO rounded-lg or rounded-full)

### Border-Radius Discipline
- **Zero radius everywhere** except: mobile bottom nav pill (keeps rounded-full for ergonomic thumb target), size picker buttons (keep rounded-lg for touch)
- Gender badges: switch from `rounded-full` to `rounded-none` with border

### Image Treatment
- Aspect ratio: 3:4 for product cards, full-bleed for hero/look images
- Hover: subtle 3% scale with editorial easing
- Grayscale-to-color transition on hover (for product thumbnails)
- Clip-path mask reveals on scroll-into-view (already in place)

### Motion Rules
- Respect `prefers-reduced-motion` throughout (already in place)
- Cinematic timing (1.0s) for hero and image reveals
- Slow timing (0.7s) for text reveals and content fade-ins
- Spring config for interactive elements (buttons, cards)
- No motion on scroll navigation dots (instant state change)

---

## Page-by-Page Premium Upgrade Plan

### 1. LookbookHero.tsx -- "The Opening Spread"

**Current:** Pure gradient black with text. Feels like a loading screen.

**Upgrade:**
- Add a cinematic background image (the `/nav-hero-hoodie.png` or similar product shot) with heavy dark overlay (stone-950/80) and the existing noise grain texture
- Shift layout to bottom-left aligned (032c magazine cover style) instead of vertically centered
- Make "THE LOOKBOOK" text truly massive: `text-[12vw] lg:text-[10rem]`
- Move season tag "SS25" to top-right corner as a discrete counter
- Keep scroll indicator centered on mobile, bottom-left on desktop
- Add a thin horizontal rule between title and subtitle for editorial structure

### 2. LookSection.tsx -- "The Editorial Spread System"

**Current:** Every look uses the same 60/40 split with alternating left/right.

**Upgrade -- Variable Layouts by Index:**

```text
Look 0 (The Shepherd):  Full-bleed image, content overlaid bottom-left
Look 1 (The Warrior):   40/60 split (text left, image right) -- reversed weight
Look 2 (The Disciple):  Full-bleed image, content overlaid bottom-right
Look 3 (The Vessel):    60/40 split (image left, text right) -- current style
Look 4 (Street Evang.): Full-width image top 70%, content bar bottom 30%
```

This creates the DAZED-style quiet-loud-quiet rhythm. Full-bleed looks feel like magazine covers; split looks feel like editorial spreads.

**For each layout variant:**
- Full-bleed: image covers 100% with heavy gradient overlay, text positioned over image
- Split: current clip-path reveal + gradient overlay logic
- Bottom bar: cinematic horizontal layout, products visible inline

**Mobile:**
- All layouts collapse to 70/30 (image 70% / content 30%) instead of current 50/50
- This gives the image the dominance it needs while keeping content scannable
- Product thumbnails show as a horizontal scroll strip (max 2 visible)

### 3. ShopTheLook.tsx -- "The Product Strip"

**Fixes:**
- Replace `rounded-lg` on buttons with `rounded-none`
- Replace `rounded-full` on gender badge in LookSection with sharp border
- Mobile: keep 2-column product grid but make cards tighter (reduce aspect ratio padding)
- "Swipe to Shop" button: `rounded-none` with amber border accent

### 4. FitGuideSection.tsx -- "The Fit Story"

**Fixes:**
- Replace `rounded-lg` on model cards with `rounded-none`
- Replace `rounded-full` on gender toggle with sharp pill alternative (border-bottom indicator instead)
- "View Details" badge: `rounded-none`
- Tighten overall section padding for editorial density

### 5. LookNavigation.tsx + LookNavigationMobile.tsx

**Keep as-is.** The desktop dot nav and mobile bottom pill are working well. The mobile rounded-full pill is an intentional ergonomic decision for thumb reach -- this is the one exception to the zero-radius rule.

### 6. WearTheMissionCTA -- "The Closing Spread"

**Already strong.** Minor fix: ensure it renders properly within the snap container.

---

## Implementation Plan

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/lookbook/LookbookHero.tsx` | Add background image, reposition layout to bottom-left, increase type scale, move SS25 to top-right |
| `src/components/lookbook/LookSection.tsx` | Introduce layout variants by index (full-bleed, split, bottom-bar), change mobile split from 50/50 to 70/30 |
| `src/components/lookbook/ShopTheLook.tsx` | Fix all `rounded-lg` to `rounded-none`, fix button styling |
| `src/components/lookbook/FitGuideSection.tsx` | Fix `rounded-lg` and `rounded-full` to sharp edges, redesign gender toggle |
| `src/components/lookbook/SwipeableLookCard.tsx` | Fix `rounded-xl` on buttons to `rounded-none` |
| `src/components/lookbook/SwipeLookbook.tsx` | Fix `rounded-xl` and `rounded-full` on buttons |
| `src/index.css` | Update `.lookbook-half-height` to support 70/30 mobile split with new utility classes |

### What Does NOT Change
- Desktop snap-scroll architecture
- LookNavigation and LookNavigationMobile (dot nav)
- Data fetching logic (useQuery + Supabase)
- Demo looks data structure
- Cart integration and quick-add logic
- Swipe gesture physics
- Animation timing system (lib/animations.ts)
- No new dependencies

### Safe Workflow
1. All changes are CSS/layout-only within existing components
2. No database changes, no new routes, no new components
3. Each file change is isolated and testable independently
4. Demo data continues to work as fallback

