

# Lookbook Page -- World-Class Refinement Pass

## Current State (Post-Implementation Audit)

The previous plan successfully delivered:
- Cinematic hero with background image, bottom-left 032c-style typography
- Variable layout system (5 variants cycling per look index)
- 65/35 mobile image/content split
- Consistent `rounded-none` across all buttons and badges
- Sharp-edged gender toggles and fit guide cards

### Remaining Issues Found Across Viewports

**Mobile (390px)**
1. Content area (35%) is too cramped -- the "Shop the Look" section with product grid, "Add Complete Look" button, and "Swipe to Shop" CTA all stack within that 35% slice, causing overflow and requiring internal scrolling that fights against the snap-scroll container
2. The mobile bottom nav pill overlaps with the content area bottom edge on shorter viewports
3. The "Swipe right to add look" hint floats over the image at an awkward position (bottom quarter)

**Tablet (834px)**
1. Tablet uses the mobile layout (hamburger + mobile nav dots) but has desktop-scale viewport -- it's a dead zone where neither mobile nor desktop layout shines
2. The mobile nav dots container is oversized on tablet, taking too much visual weight
3. Look sections use `lookbook-image-height` / `lookbook-content-height` on tablet (sub-1024px) which wastes the larger canvas

**Desktop (1440px+)**
4. Full-bleed layouts: the content overlay at bottom-left has no max-width on the description text, so it can run uncomfortably wide on ultra-wide displays
5. The oversized look index watermark (`text-[20rem]`) is hidden below `lg` -- it should also show on tablet landscape

**Cross-Viewport**
6. The `lookbook-content-height` class sets `overflow-y: auto` which creates a nested scrollable area inside a snap-scroll container -- this causes scroll-fighting on iOS Safari where the inner scroll captures the gesture before the outer snap can take over
7. No tablet-specific breakpoint in the CSS utilities -- the 1024px cutoff means iPads in portrait (834px / 820px) get the cramped mobile treatment

## Plan

### 1. Fix Mobile Content Overflow (Highest Priority)

**Problem:** The 35% content area tries to fit too much: gender badge + scripture + headline + name + description + Shop the Look section (with product grid + buttons). This overflows and creates nested scrolling.

**Solution:** On mobile, simplify the content panel to show only the essential info (name, headline, scripture) and a single "Shop This Look" button that opens the existing SwipeLookbook drawer. The full product grid only shows on desktop within the split/full-bleed content panels.

**File: `src/components/lookbook/LookSection.tsx`**
- In the `LookContent` component, wrap the `ShopTheLook` component in a `hidden lg:block` so it only renders on desktop
- Add a mobile-only compact CTA button that triggers the SwipeLookbook drawer directly
- Remove `line-clamp-3` on description and replace with `hidden md:block` to hide it entirely on mobile (the headline + name are sufficient for the editorial snap)

### 2. Fix Scroll-Fighting on iOS

**Problem:** `overflow-y: auto` on `.lookbook-content-height` creates a nested scroll trap inside the snap container.

**File: `src/index.css`**
- Remove `overflow-y: auto` from `.lookbook-content-height`
- Instead, add `overflow: hidden` so content that doesn't fit simply clips (which is acceptable since we're removing the product grid from mobile in step 1)

### 3. Tablet Breakpoint Optimization

**Problem:** Tablets (768px-1023px) get the cramped mobile layout but have enough space for a richer presentation.

**File: `src/index.css`**
- Add a `@media (min-width: 768px)` breakpoint that changes the image/content split from 65/35 to 60/40 on tablets, giving more breathing room to content
- At this breakpoint, content should also show a condensed 2-product grid (not the full ShopTheLook, but enough to create shoppability)

**File: `src/components/lookbook/LookSection.tsx`**
- Use `md:` breakpoint classes to show a simplified product preview on tablet (2 product thumbnails inline) while keeping the full ShopTheLook hidden until `lg:`

### 4. Cap Content Width on Ultra-Wide

**File: `src/components/lookbook/LookSection.tsx`**
- In full-bleed layouts, the content overlay `div` already has `lg:max-w-lg` -- this is correct but the description text inside has no max-width. Add `max-w-sm` to the description paragraph to keep line lengths readable.

### 5. Show Look Index Watermark on Tablet

**File: `src/components/lookbook/LookSection.tsx`**
- Change the oversized index watermark from `hidden lg:block` to `hidden md:block` so it appears on tablets, reinforcing the editorial magazine feel at that viewport.

### 6. Mobile Content Panel Density

**File: `src/components/lookbook/LookSection.tsx`** (in LookContent)
- Reduce `mb-4` gaps to `mb-2` on mobile using responsive classes: `mb-2 md:mb-4`
- Scripture reference: `text-xs` on mobile (already good)
- Headline: reduce from `text-xl` to `text-lg` on mobile to prevent wrapping
- Hide look name on mobile (`hidden md:block`) since the headline already tells the story
- Add a compact "Shop This Look" button (amber, full-width, 44px tall) visible only on mobile that opens the SwipeLookbook drawer

### Files Modified

| File | Change |
|------|--------|
| `src/components/lookbook/LookSection.tsx` | Hide ShopTheLook on mobile, add compact mobile CTA, tighten mobile spacing, show watermark on md, cap description width |
| `src/index.css` | Fix overflow-y on content-height, add tablet breakpoint at 768px for 60/40 split |

### What Does NOT Change
- Hero component (already polished)
- Desktop layouts (working beautifully)
- Navigation components (dot nav and mobile pill)
- ShopTheLook component itself (only its visibility context changes)
- FitGuideSection (already fixed)
- SwipeLookbook/SwipeableLookCard (already fixed)
- Data fetching, cart logic, animation system
- No new dependencies

