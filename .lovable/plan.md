

# Round 18 — UI/UX Stress Test Fixes + Veepo Footer Brand Upgrade

## Issues Found

### 1. Background Scroll Bleed on Mobile Overlays
All overlay components use `document.body.style.overflow = 'hidden'` for scroll lock, but on iOS Safari this is insufficient — the background still scrolls on touch. Missing `overscroll-behavior: contain` on overlay panels and `touch-action: none` on backdrops. Affects:
- `FullScreenNav` (lines 112-127)
- `MobileMenu` (lines 112-123)
- `CartDrawer` (lines 134-148)
- `AuthModal` (lines 43-54)
- `FavoritesDrawer`
- `SearchOverlay`

**Fix:** Add `overscroll-contain` class to all scrollable overlay panels and `touch-none` to all backdrop elements. Also add a global CSS rule for `body.overflow-hidden` with `-webkit-overflow-scrolling: auto` and `position: fixed` pattern for iOS.

### 2. AuthModal Uses Bouncy Spring Animations
The `AuthModal` panel uses `type: 'spring', stiffness: 300, damping: 30` which creates a bouncy effect inconsistent with the editorial `tween` animations used by `CartDrawer`, `MobileMenu`, and `FavoritesDrawer`. This reads as cheap/playful rather than premium.

**Fix:** Replace spring with the editorial tween pattern (`duration: 0.35, ease: editorialEase`) matching the cart drawer exactly.

### 3. Veepo Footer — Brand Identity Upgrade with Orange/Green
Current implementation is monochrome `text-white/40`. User wants Veepo's orange and green brand colors incorporated for a bold, bespoke attribution that pops.

**Fix:** Upgrade the attribution strip with:
- "This Vision Is Powered By" text with `tracking-[0.15em] uppercase`
- Key words "Vision" and "Powered" get Veepo brand color accents on hover: orange (`#FF6B35`) for "Vision", green (`#4CAF50`) for "Powered"
- Veepo logo with hover brightness lift
- Subtle animated gradient underline on hover using Veepo's orange→green
- `group` hover scales the unit `1.02` with `duration-500` for premium feel

## Implementation Details

| File | Change |
|------|--------|
| `src/index.css` | Add global scroll-lock styles: `body.scroll-locked { position: fixed; width: 100%; overflow: hidden; }` with `-webkit-overflow-scrolling` handling for iOS |
| `src/components/header/FullScreenNav.tsx` | Add `overscroll-contain` to the root `motion.div`. Use class-based body scroll lock (`scroll-locked`) instead of inline style |
| `src/components/header/MobileMenu.tsx` | Add `touch-none` to backdrop, `overscroll-contain` to panel. Use class-based scroll lock |
| `src/components/cart/CartDrawer.tsx` | Add `touch-none` to backdrop, `overscroll-contain` to drawer panel. Use class-based scroll lock |
| `src/components/auth/AuthModal.tsx` | Replace spring animations with editorial tween (`duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94]`). Add `touch-none` to backdrop, `overscroll-contain` to panel. Use class-based scroll lock |
| `src/components/favorites/FavoritesDrawer.tsx` | Add `touch-none` to backdrop, `overscroll-contain` to panel |
| `src/components/header/SearchOverlay.tsx` | Add `overscroll-contain` to container |
| `src/components/footer/Footer.tsx` | Upgrade Veepo attribution: add orange (`#FF6B35`) hover on "Vision", green (`#4CAF50`) hover on "Powered", animated gradient underline reveal, brighter logo hover. Keep idle state subtle (`text-white/40`) to respect host brand |

### Scroll Lock Pattern (shared across all overlays)
```typescript
// Replace inline overflow: hidden with class toggle
document.documentElement.classList.add('scroll-locked');
// cleanup:
document.documentElement.classList.remove('scroll-locked');
```

```css
/* index.css */
html.scroll-locked,
html.scroll-locked body {
  overflow: hidden;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: auto;
}
/* iOS position:fixed fallback */
@supports (-webkit-touch-callout: none) {
  html.scroll-locked body {
    position: fixed;
    width: 100%;
  }
}
```

### Veepo Footer Design
- Idle: subtle `text-white/40`, monochrome
- Hover: "Vision" transitions to `text-[#FF6B35]` (Veepo orange), "Powered" to `text-[#4CAF50]` (Veepo green), logo opacity 100% + brightness lift
- A thin gradient line (`bg-gradient-to-r from-[#FF6B35] to-[#4CAF50]`) scales from 0 to full width on hover beneath the text
- All transitions use `duration-500` for smooth, premium feel

## What Is NOT Changed
- No layout, typography, or spacing changes
- No database/schema changes
- Auth system logic untouched (only animation timing)

