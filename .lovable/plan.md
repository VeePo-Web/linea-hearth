

# Round 20 — iOS Scroll Position Fix + Veepo Footer Final Polish

## Issue 1: iOS Scroll Position Loss on Overlay Open/Close

**Problem:** The `position: fixed` iOS fallback in the scroll lock CSS resets `window.scrollY` to 0 when an overlay opens. When the overlay closes, the page jumps to the top instead of staying where the user was. This affects all 6 overlay surfaces (MobileMenu, CartDrawer, AuthModal, FavoritesDrawer, SearchOverlay, FullScreenNav).

**Fix:** Update the global CSS to use a `top` offset approach, and create a shared utility function that saves/restores scroll position:

| File | Change |
|------|--------|
| `src/index.css` | Update the iOS `position: fixed` rule to include `top: calc(-1 * var(--scroll-y, 0px))` so the body stays visually in place while locked |
| `src/lib/scrollLock.ts` | **New file.** Export `lockScroll()` and `unlockScroll()` functions that: (1) save `window.scrollY` to a CSS custom property `--scroll-y`, (2) add/remove `scroll-locked` class, (3) on unlock restore `window.scrollTo(0, savedY)`. Single source of truth for all overlays. |
| `src/components/header/MobileMenu.tsx` | Replace `classList.add/remove('scroll-locked')` with `lockScroll()`/`unlockScroll()` |
| `src/components/header/FullScreenNav.tsx` | Same replacement |
| `src/components/cart/CartDrawer.tsx` | Same replacement |
| `src/components/auth/AuthModal.tsx` | Same replacement |
| `src/components/favorites/FavoritesDrawer.tsx` | Same replacement |
| `src/components/header/SearchOverlay.tsx` | Same replacement |

### scrollLock utility pattern:
```typescript
let scrollY = 0;
export function lockScroll() {
  scrollY = window.scrollY;
  document.documentElement.style.setProperty('--scroll-y', `-${scrollY}px`);
  document.documentElement.classList.add('scroll-locked');
}
export function unlockScroll() {
  document.documentElement.classList.remove('scroll-locked');
  document.documentElement.style.removeProperty('--scroll-y');
  window.scrollTo(0, scrollY);
}
```

### Updated CSS:
```css
@supports (-webkit-touch-callout: none) {
  html.scroll-locked body {
    position: fixed;
    width: 100%;
    top: var(--scroll-y, 0px);
  }
}
```

## Issue 2: Veepo Footer — Add Tagline for Full Brand Identity

The attribution strip works well but is missing Veepo's core tagline. Adding "Where Vision Meets Precision" as a whisper line below the domain creates a complete brand moment.

| File | Change |
|------|--------|
| `src/components/footer/Footer.tsx` | Replace the `veepo.ca` span with a stacked pair: `veepo.ca` domain label + `Where Vision Meets Precision` tagline in `text-[9px] tracking-[0.15em] italic text-white/20 group-hover:text-white/40`. Keeps idle state subtle, reveals on hover. |

## What Is NOT Changed
- No layout, typography, or spacing changes
- No database changes
- Auth system logic untouched
- Admin dashboard untouched (verified solid)

