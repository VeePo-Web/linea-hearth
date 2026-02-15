

# Fix aria-hidden Accessibility Warning on SwipeLookbook Drawer

## Root Cause

When the Vaul drawer opens, it sets `aria-hidden="true"` on the main app content to trap focus inside the drawer (standard modal behavior). The "Shop This Look" button that triggered the drawer sits inside this now-hidden content tree. During the brief transition, the button may still hold focus while its ancestor is `aria-hidden`, triggering the browser warning:

> "aria-hidden on a focused element"

## Fix (2 Files)

### 1. SwipeLookbook.tsx -- Add missing DrawerDescription + auto-focus management

The drawer is missing a `DrawerDescription` (required by Radix/Vaul for screen reader announcements). Adding it eliminates the "missing description" accessibility warning and improves the drawer's ARIA structure.

Additionally, add `autoFocus` to the close button so focus moves immediately into the drawer content on open, preventing the brief window where focus sits on the now-hidden trigger button.

**Changes:**
- Import `DrawerDescription` from the drawer component
- Add a visually-hidden `DrawerDescription` inside the `DrawerHeader`: "Swipe through products to add them to your bag"
- Add `autoFocus` to the close `Button` so the drawer grabs focus immediately on open
- Add `aria-label="Close swipe lookbook"` to the close button (currently has no label)

### 2. LookSection.tsx -- Blur trigger button before drawer opens

The cleanest way to prevent the warning is to remove focus from the trigger button *before* the drawer's `aria-hidden` kicks in. Call `document.activeElement?.blur()` or use a ref to blur the button in the `onClick` handler, right before setting `swipeOpen(true)`.

**Changes:**
- In `LookContent`, update the mobile CTA `onClick`:
  ```
  onClick={(e) => {
    (e.currentTarget as HTMLElement).blur();
    setSwipeOpen(true);
  }}
  ```
- Same pattern for the bottom-bar layout's "Shop This Look" button in `LookSection`

## Files Modified

| File | Change | Impact |
|------|--------|--------|
| `src/components/lookbook/SwipeLookbook.tsx` | Add `DrawerDescription`, `autoFocus` on close button, `aria-label` | Proper ARIA structure, immediate focus capture |
| `src/components/lookbook/LookSection.tsx` | Blur trigger buttons before opening drawer | Prevents focus-inside-aria-hidden warning |

## What Does NOT Change

- No visual changes whatsoever
- No layout, spacing, or typography modifications
- DrawerContent, SwipeCard, SwipeActions, SwipeProgress -- untouched
- No new dependencies

