

# Lookbook -- Final World-Class Polish Pass

## Current State Assessment

The Lookbook has been through 4 refinement passes and is structurally excellent:
- Hero: cinematic 032c-style with massive editorial type -- **strong**
- Layout variants: 5-variant index-cycling system (full-bleed, split, bottom-bar) -- **strong**
- Mobile: 65/35 split, compact CTA, SwipeLookbook drawer -- **functional**
- Swipe-to-cart: products load correctly, card stack with haptic feedback -- **working**
- Design system: rounded-none enforced across all non-dot elements -- **consistent**
- Navigation: desktop dot rail + mobile pill -- **functional**

### What's Missing for True World-Class

After thorough audit across desktop (1024px) and mobile (390px), these are the gaps between "very good Shopify lookbook" and "DAZED / 032c editorial experience":

---

## 1. VideoEmbed.tsx -- Remaining Design System Violations

`VideoEmbed.tsx` still has `rounded-lg` on the container and `rounded-full` on the play button and platform badge. While this component isn't actively rendered on the page (no demo looks have `video_url`), it's part of the lookbook component library and should match the system.

**File:** `src/components/lookbook/VideoEmbed.tsx`
- Line 41: `rounded-lg` on container to `rounded-none`
- Line 61: Play button `rounded-full` to `rounded-none` (square play button is more 032c)
- Line 67: Platform badge `rounded-full` to sharp

---

## 2. ShopTheLook Position Tag -- Stray `rounded`

In `ShopTheLook.tsx`, the position tag on product cards (line 95) still uses `rounded` (default Tailwind border-radius). This is a subtle inconsistency.

**File:** `src/components/lookbook/ShopTheLook.tsx`
- Line 95: Remove `rounded` from position tag class

---

## 3. Mobile Swipe Drawer -- Drawer Handle Inconsistency

The `SwipeLookbook` drawer uses the default Vaul drawer handle (the small gray pill at the top of the drawer). This rounded pill conflicts with the sharp-edged aesthetic. The drawer should either hide the handle or replace it with a sharp horizontal line.

**File:** `src/components/lookbook/SwipeLookbook.tsx`
- Add a custom handle element or hide the default one via DrawerContent styling
- Replace with a sharp `w-12 h-0.5 bg-white/20 mx-auto mt-3` line element

---

## 4. Desktop ShopTheLook -- "Swipe to Shop" Button Showing on Desktop

In `ShopTheLook.tsx`, the "Swipe to Shop" CTA (line 311-326) is gated by `isMobile` which uses `useIsMobile()`. However, this component is already wrapped in `hidden lg:block` in `LookSection.tsx`, so the mobile swipe CTA inside ShopTheLook is redundant when viewed on desktop. On tablet (768-1023px), where ShopTheLook might render, the "Swipe to Shop" button would still show. This is fine but the button text says "Swipe" which doesn't apply to tablet users who may not have the same swipe gesture.

**File:** `src/components/lookbook/ShopTheLook.tsx`
- Hide the "Swipe to Shop" button entirely inside ShopTheLook since mobile users access swipe via the LookSection's compact CTA button instead
- Or rename to "Shop Items" on tablet

---

## 5. Completion Screen Micropolish

The SwipeLookbook completion screen (when all products are swiped through) has a `PartyPopper` icon in a square container. For a luxury editorial brand, the celebration should be more restrained -- the drawn check icon is already available and more on-brand.

**File:** `src/components/lookbook/SwipeLookbook.tsx`
- Replace `PartyPopper` icon with `DrawCheckIcon` for the success state (lines 142-149)
- This aligns the completion celebration with the same visual language used in SwipeCard's individual success overlay

---

## 6. FitGuideSection -- "View Details" Badge Always Visible on Mobile

In `FitGuideSection.tsx` (line 299-312), the "View Details" badge is set to `opacity-100` on mobile and `opacity-0 md:group-hover:opacity-100` on desktop. On mobile this creates a persistent overlay on every model card, which clutters the clean photography. Since mobile users understand tapping on a card, the badge is unnecessary.

**File:** `src/components/lookbook/FitGuideSection.tsx`
- Change the "View Details" badge to `opacity-0 group-hover:opacity-100` on all viewports, or hide on mobile entirely with `hidden md:flex`
- Mobile users will tap naturally; the card already has `active:scale-[0.98]` feedback

---

## Files Modified Summary

| File | Change | Impact |
|------|--------|--------|
| `src/components/lookbook/VideoEmbed.tsx` | Remove `rounded-lg`, `rounded-full` | Design system consistency |
| `src/components/lookbook/ShopTheLook.tsx` | Remove stray `rounded` from position tag; clean up redundant mobile CTA | Visual consistency + cleaner logic |
| `src/components/lookbook/SwipeLookbook.tsx` | Custom sharp drawer handle; swap PartyPopper for DrawCheckIcon | Brand coherence |
| `src/components/lookbook/FitGuideSection.tsx` | Hide "View Details" overlay on mobile | Cleaner photography presentation |

## What Does NOT Change

- LookSection.tsx (polished)
- LookbookHero.tsx (polished)
- SwipeCard.tsx (polished)
- SwipeActions.tsx (intentional circular buttons)
- SwipeProgress.tsx (intentional dots)
- LookNavigation.tsx / LookNavigationMobile.tsx (intentional dots)
- FitGuideModal.tsx (polished)
- SwipeableLookCard.tsx (polished)
- No layout changes, no data changes, no new dependencies

