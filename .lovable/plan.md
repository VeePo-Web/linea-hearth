

# Fix: Enter Button, Full Verse on Mobile, Glory/Beauty Glow

## Issues Found

1. **Enter button does not navigate** -- The button has `onClick={(e) => e.stopPropagation()}` which prevents the click from reaching the `<main>` handler, but never calls `handleEnter` itself. Result: clicking the Enter button does nothing.

2. **Full verse hidden on mobile** -- The `.verse-prepend` (the "And thou shalt make holy garments for Aaron thy brother," context) is `opacity: 0; visibility: hidden` and only reveals on `:hover`. Since mobile has no hover, the prepend is permanently invisible.

3. **Glory/beauty words not glowing on mobile** -- The gold text-shadow illumination on "glory" and "beauty" is triggered by `.verse-unified-block:hover`. On mobile, these words remain in their dim default state.

---

## Fixes

### File 1: `src/pages/LandingPage.tsx`

**Enter button fix (line 295):**
Change the button's onClick from just stopping propagation to also calling `handleEnter`:

```tsx
// Before:
onClick={(e) => e.stopPropagation()}

// After:
onClick={(e) => { e.stopPropagation(); handleEnter(); }}
```

This ensures the button works as a direct navigation trigger while still preventing the event from double-firing via the `<main>` click handler.

### File 2: `src/index.css`

**Mobile-always-visible verse prepend and glow:**

Add a mobile-only media query (max-width: 767px) that:

1. Makes `.verse-prepend` always visible (opacity: 1, visibility: visible, no transition delay)
2. Makes `.glory-word` and `.beauty-word` always have their illuminated gold color and text-shadow glow
3. Makes `.verse-asv-attribution` always visible

This uses the same styles already defined for the `:hover` state, but applied unconditionally on touch/mobile viewports. The hover behavior remains unchanged on desktop.

```css
/* Mobile: always show full verse + glow (no hover available) */
@media (max-width: 767px) {
  .verse-prepend {
    opacity: 1;
    visibility: visible;
    transition-delay: 0s;
  }

  .verse-asv-attribution {
    opacity: 1;
    visibility: visible;
  }

  .glory-word,
  .beauty-word {
    color: hsla(45 55% 82% / 0.95);
    text-shadow: 
      0 0 12px hsla(45 60% 70% / 0.4),
      0 0 30px hsla(45 50% 60% / 0.15);
  }
}
```

---

## What Does NOT Change

- Desktop hover behavior (prepend reveals on hover, glory/beauty illuminate on hover)
- The parallax system (already confirmed dormant on mobile -- no `onMouseMove` fires)
- Exit transition choreography
- Visual design, layout, spacing, typography
- Reduced motion behavior

## Result

| Viewport | Verse Prepend | Glory/Beauty Glow | Enter Button |
|----------|--------------|-------------------|-------------|
| Desktop | Hover to reveal | Hover to illuminate | Works (click navigates) |
| Mobile | Always visible | Always glowing | Works (tap navigates) |

Two files, approximately 20 lines of CSS added and 1 line changed in TSX.
