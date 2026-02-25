

# Navigation Bar Overhaul: Full Audit and Fix Plan

## Problems Identified

### 1. Community Page: Useless Filter Bar
The sticky `StoryFilters` component on `/community` shows "All | Reviews | Testimonies | Transformations | All Products | Most Recent" -- cluttering the page with no real value. It will be removed entirely.

### 2. Header Hide/Show Animation Feels Cheap
The current header uses a **spring** animation (`stiffness: 300, damping: 30`) to slide in/out. Springs create a bouncy, app-like feel that reads as cheap for an editorial fashion brand. Fix: switch to a smooth, damped `tween` with an editorial easing curve and shorter duration.

### 3. Header Covers Page Content on Multiple Routes
Pages using `immersiveHero` (Community, Index) intentionally remove `pt-[var(--header-height)]`. But when the header is visible (after scroll-up or on non-home pages), it overlaps content on:
- **Community page**: The hero manifesto section starts at the very top of the viewport; the header sits on top of it, covering the "Not For Everyone" eyebrow text.
- **Our Story page**: Uses `<Layout>` without `immersiveHero`, so it has `pt-[var(--header-height)]`. This is correct but the header still overlaps because `--header-height: 100px` doesn't account for all scenarios.
- **Lookbook page**: Uses raw `<Header />` without `Layout` at all -- no padding offset, content starts behind the header.

### 4. No Mobile Filter Bar on Community
`StoryFilters` only renders a `hidden md:flex` desktop bar -- mobile users see nothing. Since we're removing the entire component, this is resolved automatically.

---

## Implementation Plan

### Step 1: Remove StoryFilters from Community Page
**File: `src/pages/Community.tsx`**
- Remove `StoryFilters` import and component usage
- Remove the `selectedProduct`, `selectedType`, `selectedGender`, `sortBy` state variables (no longer needed)
- Pass no filter props to `StoryGrid` -- it will show all stories sorted by recent by default

**File: `src/components/community/StoryGrid.tsx`**
- Make filter/sort props optional with sensible defaults (`"all"` / `"recent"`)
- Grid continues to work without filters

### Step 2: Fix Header Animation Quality
**File: `src/components/header/Header.tsx`**
- Replace the `spring` transition with a `tween` using an editorial easing curve:
  ```
  transition: {
    duration: 0.4,
    ease: [0.25, 0.46, 0.45, 0.94]
  }
  ```
- This produces a smooth, confident slide that matches the brand's DAZED/032c editorial feel -- no bounce, no jank.
- Increase the scroll threshold from `50` to `80` to reduce false triggers on small scroll movements (prevents the header from flickering on micro-scrolls).

### Step 3: Fix Header Overlap on Community Page
**File: `src/pages/Community.tsx`**
- Remove `immersiveHero` from the `Layout` wrapper. The Community page is not a cinematic landing -- it's a content page with a dark hero section. Using standard `pt-[var(--header-height)]` ensures the manifesto content starts below the header.
- The hero already has `pt-20 lg:pt-0` internally, but that's insufficient when the header is visible. With Layout's standard padding, the hero content will clear the nav correctly.

### Step 4: Fix Header Overlap on Lookbook Page
**File: `src/pages/Lookbook.tsx`**
- The Lookbook page uses raw `<Header />` + `<Footer />` instead of `<Layout>`. The hero content starts at `top: 0` with no offset.
- Add `pt-[var(--header-height)]` to the main content wrapper, or migrate to use `<Layout>` for consistency.

### Step 5: Audit All Other Pages
Verified that these pages correctly use `<Layout>` without `immersiveHero`, so they already have `pt-[var(--header-height)]` applied:
- `/category/:category` (Category.tsx) -- uses Layout, correct
- `/product/:productId` (ProductDetail.tsx) -- uses Layout, correct
- `/about/our-story` (OurStory.tsx) -- uses Layout, correct
- `/contact` (Contact.tsx) -- uses ServicePageLayout which includes its own header offset, correct
- `/faq`, `/returns`, `/shipping`, `/accessibility` -- use service layouts, correct
- `/ambassador` -- uses Layout, correct

The only exception: `/home` (Index.tsx) correctly uses `immersiveHero` because the header starts hidden and reveals on scroll-up -- this is the intended cinematic behavior.

### Step 6: Harden the Scroll Direction Hook
**File: `src/hooks/useScrollDirection.ts`**
- No structural changes needed, but increase the default threshold to `80` at the call site in `Header.tsx` to reduce sensitivity.

---

## Files Changed Summary

| File | Change |
|------|--------|
| `src/pages/Community.tsx` | Remove StoryFilters, remove `immersiveHero`, remove filter state |
| `src/components/community/StoryGrid.tsx` | Make filter props optional with defaults |
| `src/components/header/Header.tsx` | Replace spring with editorial tween, increase scroll threshold |
| `src/pages/Lookbook.tsx` | Add header offset padding to prevent content overlap |

## Expected Result
- Community page loads clean: hero manifesto visible below nav, no filter bar clutter
- Header slides in/out with smooth, premium editorial motion -- no spring bounce
- No page on the site has content hidden behind the header
- Works consistently across desktop, tablet, and mobile viewports

