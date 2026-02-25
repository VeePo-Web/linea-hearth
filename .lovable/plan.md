

# Site-Wide Dark Colorway -- Root Variable Swap

## Strategy

The previous approach surgically converted individual homepage sections by flipping `bg-background` to `bg-foreground` and all child text tokens. This worked for the homepage but leaves dozens of other pages and UI components (Checkout, PDP, FAQ, Contact, Legal, Account, dialogs, sheets, popovers, form inputs) still rendering with light backgrounds and dark text.

The correct scalable approach: **swap the CSS custom property values at `:root` level** so the entire site defaults to dark. Then fix the ~10 components that were previously using the inverted tokens (`bg-foreground`/`text-background`) to achieve dark -- those would now flip to light and need reverting.

This single CSS change automatically converts: Checkout, Product Detail, FAQ, Contact, Shipping, Returns, Legal pages, Account pages, all Radix UI primitives (Sheet, Dialog, Popover, Command, Select), form inputs, cards, popovers, and every component using semantic tokens.

---

## Phase 1: Root CSS Variable Swap

**File: `src/index.css`** (lines 9-73)

Swap `:root` values to dark palette:

| Token | Current (light) | New (dark) |
|-------|-----------------|------------|
| `--background` | `30 6% 98%` | `0 0% 4%` |
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

The `.dark` block becomes redundant but can be kept for reference.

---

## Phase 2: Revert Previous Surgical Changes

Components that were changed to use `bg-foreground`/`text-background` to get dark now need reverting back to standard semantic tokens (which are now dark by default).

### 2a. Layout wrapper
**File: `src/components/layout/Layout.tsx`** (line 28)
- Revert: `bg-foreground` back to `bg-background`

### 2b. Homepage sections (revert all previous changes)

Each of these was changed from `bg-background` to `bg-foreground` -- now revert:

- **CategoryTiles** -- `bg-foreground` back to `bg-background`, all `text-background` back to `text-foreground`, `text-background/50` back to `text-muted-foreground`, `bg-background` (divider) back to `bg-foreground`
- **FeaturedCollection** -- same pattern reversal
- **DropGrid** -- same pattern reversal. Index badge: `text-stone-950 bg-white` back to `text-foreground bg-background`
- **InstagramFeed** -- revert `bg-foreground` to `bg-background`, all text tokens back
- **TestimonySpotlight** -- revert `bg-foreground` to `bg-background`, text tokens back
- **ValueStackBanner** -- revert `bg-foreground border-background/10` to `bg-muted border-border`, text tokens back
- **MissionBlock** -- card: `bg-white/95` needs to stay as explicit white for contrast on dark image. Text: `text-stone-950`/`text-stone-600` stay explicit.
- **RecentlyViewed** -- explicit `bg-white/90` badges stay (they sit on product images)

### 2c. EditorialHero product tag
- Explicit `bg-white/95` and `text-stone-950`/`text-stone-500`/`text-stone-700` stays -- this is an overlay on an image

---

## Phase 3: Fix Remaining Hardcoded Light Colors

After root swap, these components have explicit light colors that will clash:

### 3a. InfoCard
**File: `src/components/service/InfoCard.tsx`** (line 27)
- Current: `bg-stone-50 dark:bg-stone-900/50`
- Fix: `bg-stone-900/50` (remove light variant)

### 3b. ServiceSidebar contact card
**File: `src/components/service/ServiceSidebar.tsx`** (line 73)
- Current: `bg-stone-100 dark:bg-stone-900`
- Fix: `bg-stone-900`

### 3c. FAQCategoryTabs
**File: `src/components/faq/FAQCategoryTabs.tsx`** (line 45, 67-68)
- Scroll fade: `from-background` -- now dark automatically, correct
- Active tab: `bg-stone-900 text-white` -- now dark-on-dark, needs `bg-white text-stone-950`
- Inactive border: `border-stone-300` -- needs `border-stone-600`

### 3d. FAQAccordionGroup
Already partially fixed. Verify `data-[state=open]:bg-stone-900/50` is correct.

### 3e. LegalPageLayout
**File: `src/components/legal/LegalPageLayout.tsx`**
- Line 42: `bg-background` -- now dark automatically, correct
- Line 95: `bg-stone-100 dark:bg-stone-900` -- fix to `bg-stone-900`
- Line 104: `bg-stone-50 dark:bg-stone-900/50` -- fix to `bg-stone-900/50`

### 3f. Checkout page
**File: `src/pages/Checkout.tsx`**
- Line 293: `bg-background` -- now dark automatically
- Line 312: `bg-background` -- now dark automatically
- Line 328: `bg-muted/20` -- now dark gray, correct
- No changes needed -- semantic tokens handle it

### 3g. Contact page FAQ accordion
**File: `src/pages/Contact.tsx`** (line 298)
- `bg-background hover:bg-muted/30` -- now dark automatically, correct

### 3h. ShippingInfo confidence strip
**File: `src/pages/ShippingInfo.tsx`** (line 121)
- `bg-emerald-50 dark:bg-emerald-950/20` -- fix to `bg-emerald-950/20`
- `border-emerald-200 dark:border-emerald-900` -- fix to `border-emerald-900`
- `text-emerald-900 dark:text-emerald-100` -- fix to `text-emerald-100`

### 3i. ResponseCommitment
**File: `src/components/contact/ResponseCommitment.tsx`** (line 16)
- `text-emerald-700 dark:text-emerald-400` -- fix to `text-emerald-400`

### 3j. FAQ NoResultsState
**File: `src/pages/FAQ.tsx`** (line 206)
- `bg-stone-100 dark:bg-stone-800` -- fix to `bg-stone-800`

### 3k. ServiceHero search input
**File: `src/components/service/ServiceHero.tsx`** (line 161)
- `bg-white text-stone-900` -- this is intentional (white search bar on dark hero), keep as-is

### 3l. body tag
**File: `src/index.css`** (line 120)
- `bg-background text-foreground` -- now dark bg + light text automatically

### 3m. scroll-fade-right
**File: `src/index.css`** (line 451)
- `from-background` fade gradient -- now dark, correct for dark sections

---

## Phase 4: Verify Auto-Fixed Areas

These areas use semantic tokens and will automatically become dark with no code changes:
- All Radix UI primitives (Sheet, Dialog, Popover, Select, Command)
- Form inputs (`bg-input`, `border-input`)
- Cards (`bg-card`, `text-card-foreground`)
- Account pages (AccountDashboard, AccountOrders, AccountProfile, etc.)
- Product Detail page (breadcrumbs, product info, reviews, etc.)
- Checkout progress stepper
- WelcomeBackBanner (`bg-primary/5` -- now light/5 on dark, subtle)
- GuaranteeBadge (`bg-muted/30` -- now dark gray)
- HowItMinisters (`bg-muted/30` -- now dark gray)
- FitFabricSection -- same
- ProductReviews -- same

---

## Files Modified Summary

| File | Change Type |
|------|------------|
| `src/index.css` | Root variable swap (single source of truth) |
| `src/components/layout/Layout.tsx` | Revert bg-foreground to bg-background |
| `src/components/homepage/CategoryTiles.tsx` | Revert to semantic tokens |
| `src/components/homepage/FeaturedCollection.tsx` | Revert to semantic tokens |
| `src/components/homepage/DropGrid.tsx` | Revert to semantic tokens |
| `src/components/homepage/InstagramFeed.tsx` | Revert to semantic tokens |
| `src/components/homepage/TestimonySpotlight.tsx` | Revert to semantic tokens |
| `src/components/homepage/ValueStackBanner.tsx` | Revert to semantic tokens |
| `src/components/service/InfoCard.tsx` | Remove light variant |
| `src/components/service/ServiceSidebar.tsx` | Remove light variant |
| `src/components/faq/FAQCategoryTabs.tsx` | Invert active tab colors |
| `src/components/legal/LegalPageLayout.tsx` | Remove light variants |
| `src/pages/ShippingInfo.tsx` | Remove light variants |
| `src/components/contact/ResponseCommitment.tsx` | Remove light variant |
| `src/pages/FAQ.tsx` | Remove light variant |

**Total: ~15 files, but the root swap does 90% of the work automatically.**

---

## What This Achieves

One CSS change makes the ENTIRE site dark:
- Homepage (already converted, now cleaner with semantic tokens)
- Product Detail pages
- Category/Shop pages
- Checkout flow
- FAQ, Contact, Shipping, Returns pages
- Privacy Policy, Terms of Service
- Account dashboard and all sub-pages
- All modals, drawers, sheets, popovers
- All form inputs and interactive controls
- Navigation (nav-background becomes dark)

The result is a unified, premium dark editorial experience across every page -- consistent with the DAZED/032c magazine aesthetic.

