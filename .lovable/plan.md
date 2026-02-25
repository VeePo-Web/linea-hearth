

# Site-Wide Dark Colorway Conversion

## Strategy

The most efficient and maintainable approach is to swap the CSS custom property values at `:root` level so the default theme IS dark. This means every component using semantic tokens (`bg-background`, `text-foreground`, `bg-muted`, etc.) automatically becomes dark without touching any component files.

Then we surgically fix the few components that will break or need adjustment.

---

## Phase 1: Root CSS Variable Swap

**File:** `src/index.css` (lines 9-73)

Swap the `:root` values to match the current `.dark` values:

| Variable | Current (light) | New (dark) |
|----------|----------------|------------|
| `--background` | `30 6% 98%` (warm white) | `0 0% 4%` (near black) |
| `--foreground` | `0 0% 4%` | `30 6% 98%` |
| `--nav-background` | `30 6% 98%` | `0 0% 6%` |
| `--nav-foreground` | `0 0% 15%` | `0 0% 80%` |
| `--nav-hover` | `0 0% 4%` | `30 6% 98%` |
| `--primary` | `0 0% 4%` | `30 6% 98%` |
| `--primary-foreground` | `30 6% 98%` | `0 0% 4%` |
| `--primary-hover` | `0 0% 12%` | `0 0% 85%` |
| `--secondary` | `30 4% 94%` | `0 0% 12%` |
| `--secondary-foreground` | `0 0% 15%` | `0 0% 80%` |
| `--muted` | `30 4% 92%` | `0 0% 12%` |
| `--muted-foreground` | `0 0% 40%` | `0 0% 55%` |
| `--border` | `30 4% 88%` | `0 0% 18%` |
| `--input` | `30 4% 88%` | `0 0% 18%` |
| `--ring` | `0 0% 4%` | `30 6% 98%` |
| `--card` | `30 6% 98%` | `0 0% 6%` |
| `--card-foreground` | `0 0% 4%` | `30 6% 98%` |
| `--popover` | `30 6% 98%` | `0 0% 6%` |
| `--popover-foreground` | `0 0% 4%` | `30 6% 98%` |
| `--sidebar-*` | light variants | dark variants |

The `.dark` class block can then be removed or kept as-is (it would just be redundant).

---

## Phase 2: Components That Need Surgical Fixes

After the root swap, these components use hardcoded color classes that may conflict:

### 2a. CollectionHero bottom gradient
- **File:** `src/components/category/CollectionHero.tsx` (line 208)
- Current: `bg-gradient-to-t from-background to-transparent` -- this will now correctly fade to dark, which is perfect against the dark gradient hero. No change needed.

### 2b. Category page body area
- **File:** `src/pages/Category.tsx` (line 115)
- The `pt-6 md:pt-8 pb-safe` div inherits `bg-background` from Layout -- now dark automatically. Product cards use `bg-muted` for image placeholders which will now be dark gray. This is correct.

### 2c. MissionBlock floating card
- **File:** `src/components/homepage/MissionBlock.tsx` (line 34)
- Current: `bg-background` card overlay -- this will become dark, creating a dark card on a dark image. Need to either make this explicit `bg-stone-950` with `text-white` or swap to a light explicit treatment.
- **Fix:** Change to `bg-white/95` with `text-stone-950` to maintain the contrast card effect. Or alternatively, make it borderless text-only on the dark image.

### 2d. EditorialHero product tag
- **File:** `src/components/homepage/EditorialHero.tsx` (line 226)
- Current: `bg-background/95` -- was a light tag on dark image. Now it'll be dark-on-dark.
- **Fix:** Change to `bg-white/95 backdrop-blur-sm` and update child text to `text-stone-950` and `text-stone-600`.

### 2e. ValueStackBanner
- **File:** `src/components/homepage/ValueStackBanner.tsx` (line 31)
- Uses `bg-muted border-y border-border` -- will now be dark gray with dark border. This actually works well for a dark theme. No change needed.

### 2f. TestimonySpotlight
- **File:** `src/components/homepage/TestimonySpotlight.tsx` (line 10)
- Uses `bg-muted` -- will become dark gray. The quote text uses `text-foreground` which will be white. This works. No change needed.

### 2g. DropGrid index badges
- **File:** `src/components/homepage/DropGrid.tsx` (line 143)
- Uses `text-foreground bg-background` -- will become white text on dark bg. On dark product images this loses contrast.
- **Fix:** Change to explicit `text-stone-950 bg-white` for the index badge.

### 2h. RecentlyViewed quick-add badges
- **File:** `src/components/homepage/RecentlyViewed.tsx` (lines 42-45, 62)
- Uses `bg-background/90` -- will become dark. On dark product images, the button disappears.
- **Fix:** Change to explicit `bg-white/90` and update hover states.

### 2i. Product cards (search overlay, favorites drawer, etc.)
- Various components use `bg-muted` for product image placeholders -- dark gray is fine, this is correct editorial behavior.

### 2j. Navigation bar
- Uses `--nav-background` which we're swapping to dark. The nav will become dark. This is the desired outcome -- dark header on dark site.
- **Verify:** Status bar already uses `bg-status-bar` (black). Nav will now also be dark. Logo and text need to read as white, which they will since `--nav-foreground` flips to light.

### 2k. Footer
- Already `bg-stone-900 text-white` -- hardcoded dark. No change needed.

### 2l. FAQAccordionGroup
- Line 39: `data-[state=open]:bg-stone-50` -- explicit light. 
- **Fix:** Change to `data-[state=open]:bg-stone-900/50` (remove the light variant).

### 2m. LegalPageLayout
- Line 104: `bg-stone-50` explicit.
- **Fix:** Change to `bg-stone-900/50`.

---

## Phase 3: Page-Level Verification

Pages that will "just work" after root swap (no changes needed):
- **Homepage:** EditorialHero, FeaturedDrop, MarqueeStrip, EmailOptIn, MissionBlock (after fix), CategoryTiles all already use `bg-foreground` (which is the dark color, now becomes light -- wait, this inverts).

**CRITICAL INSIGHT:** Some components like EditorialHero and FeaturedDrop use `bg-foreground` to get the dark background, and `text-background` to get white text. After swapping root vars, `bg-foreground` becomes LIGHT and `bg-background` becomes DARK. This would BREAK these components.

### Revised Strategy

Instead of swapping root variables (which breaks `bg-foreground`/`text-background` usage throughout), the correct approach is to **keep root variables as-is** and instead convert individual page sections from `bg-background` to `bg-foreground` (or explicit dark classes).

The components that need conversion are those using `bg-background` (currently light) that should become dark:

| Component | Current | Change to |
|-----------|---------|-----------|
| CategoryTiles | `bg-background` | `bg-foreground` + flip all child text tokens |
| FeaturedCollection | `bg-background` | `bg-foreground` + flip child tokens |
| DropGrid | `bg-background` | `bg-foreground` + flip child tokens |
| InstagramFeed | `bg-background` | `bg-foreground` + flip child tokens |
| TestimonySpotlight | `bg-muted` | `bg-foreground` + flip child tokens |
| ValueStackBanner | `bg-muted` | `bg-foreground` + flip child tokens |
| MissionBlock | light card overlay | dark treatment |
| Category page body | inherits `bg-background` | Add `bg-foreground` to wrapper |

---

## Final Implementation Plan

### Files to modify:

1. **`src/components/homepage/CategoryTiles.tsx`**
   - Line 62: `bg-background` to `bg-foreground`
   - Line 75: `text-muted-foreground` to `text-background/50`
   - Line 87-88: `text-foreground` to `text-background`
   - Line 92: `bg-foreground` to `bg-background` (divider line flips)

2. **`src/components/homepage/FeaturedCollection.tsx`**
   - Line 80: `bg-background` to `bg-foreground`
   - All child text: `text-foreground` to `text-background`, `text-muted-foreground` to `text-background/50`
   - Links: update hover colors

3. **`src/components/homepage/DropGrid.tsx`**
   - Line 80: `bg-background` to `bg-foreground`
   - All child text tokens flipped
   - Index badge: `bg-background` stays (now light badge on dark section -- actually this needs to become `bg-foreground` context -- simpler to use explicit `bg-white text-stone-950`)

4. **`src/components/homepage/InstagramFeed.tsx`**
   - Line 26: `bg-background` to `bg-foreground`
   - Icon/text: `text-foreground` to `text-background`

5. **`src/components/homepage/TestimonySpotlight.tsx`**
   - Line 10: `bg-muted` to `bg-foreground`
   - All child text tokens flipped to `text-background` variants

6. **`src/components/homepage/ValueStackBanner.tsx`**
   - Line 31: `bg-muted border-y border-border` to `bg-foreground border-y border-background/10`
   - Text: `text-muted-foreground` to `text-background/60`

7. **`src/components/homepage/MissionBlock.tsx`**
   - Line 34: Card changes from `bg-background` to transparent/dark glass treatment
   - Text tokens flip accordingly

8. **`src/pages/Category.tsx`**
   - Add dark background class to the main content wrapper
   - Product grid area gets `bg-foreground` wrapper

9. **`src/components/category/FilterSortBar.tsx`**
   - Update text and border colors for dark context

10. **`src/components/category/ProductCard.tsx`**
    - Update hover states and text colors for dark grid context

11. **`src/components/homepage/RecentlyViewed.tsx`**
    - Update badge colors for dark context

12. **`src/components/homepage/EditorialHero.tsx`**
    - Line 226: Product tag -- change from `bg-background/95` to explicit dark styling since it sits on a dark hero

### What stays untouched:
- EditorialHero (main section) -- already `bg-foreground` (dark)
- FeaturedDrop -- already `bg-foreground` (dark)
- MarqueeStrip -- already `bg-foreground` (dark)
- EmailOptIn -- already `bg-foreground` (dark)
- Footer -- already hardcoded dark
- About/Our Story -- already converted to dark
- CollectionHero -- already dark gradients

### Estimated scope: ~12 files, purely class name changes (no logic changes)

