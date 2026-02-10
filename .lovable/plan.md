

# Full-Page Portal Click + Verse Hover-Only

## What Changes

### 1. Entire page becomes a clickable portal to `/home`

The `<main>` wrapper gets an `onClick={handleEnter}` and `cursor: pointer`, turning the whole viewport into the "Enter" button. Clicking anywhere -- background, text, empty space -- triggers the same cinematic exit transition that already exists.

The dedicated "Enter" button text stays visually (it serves as a hint that you should click), but it no longer needs to be the sole click target. The button becomes a visual signifier within a page-wide click zone.

### 2. Verse block becomes hover-only (no click-to-lock)

Currently the verse already uses CSS `:hover` for the revelation effect -- there is no JS click-to-lock in the code. The only artifact suggesting "clickability" is:
- `cursor: pointer` on `.verse-ref-fixed` in CSS
- `tabIndex={0}` on the Exodus 28:2 `<span>`

These get removed so the verse feels purely passive -- it reveals on hover, disappears on mouse-out, and never suggests it's interactive.

### 3. UX safeguards for the full-page click

To keep this "extremely user friendly":
- The verse block gets `onClick={(e) => e.stopPropagation()}` so hovering over the verse to read it doesn't accidentally trigger navigation
- The verse area acts as a "safe zone" -- you can hover and read without navigating
- Clicking anywhere else on the page navigates to `/home`
- Mobile: since there's no hover on mobile, a single tap anywhere (including on the verse) navigates. The verse text is still visible but the hover-revelation effect simply doesn't trigger on touch devices (existing CSS behavior)
- `cursor: pointer` is set on the `<main>` element to signal clickability everywhere

---

## Technical Changes

### File 1: `src/pages/LandingPage.tsx`

| Line | Current | Change |
|------|---------|--------|
| 122 | `<main className="fixed inset-0...">` | Add `onClick={handleEnter}` and `cursor-pointer` class |
| 213-242 | Verse `<motion.div>` block | Add `onClick={(e) => e.stopPropagation()}` to prevent accidental nav while reading |
| 238 | `tabIndex={0}` on Exodus 28:2 span | Remove `tabIndex={0}` -- verse is no longer interactive |
| 244-259 | Enter button block | Keep the button visually but add `e.stopPropagation()` to prevent double-fire |

The `handleEnter` function stays identical -- same exit animation, same timing, same navigation. It just gets called from the `<main>` click instead of only the button.

### File 2: `src/index.css`

| Line | Current | Change |
|------|---------|--------|
| 900 | `.verse-ref-fixed { cursor: pointer; }` | Change to `cursor: default` -- the reference is not clickable |

One CSS property change. That's it.

---

## What Does NOT Change

- The entire visual design (layout, colors, typography, animations)
- The entrance animation sequence and timing
- The exit transition choreography (Divine Illumination burst, perspective zoom, typographic dissolution)
- The verse hover-revelation effect (prepend text, ASV attribution, glory/beauty word illumination)
- The Ken Burns background, glitch layer, smoke, vignette, grain, scanlines
- Reduced motion support
- SEO metadata

---

## Interaction Model

```text
Desktop:
  - Page loads with cinematic entrance sequence
  - User sees "LINE OF JUDAH" + verse + "Enter"
  - Cursor is pointer everywhere (whole page is clickable)
  - Hovering over verse area: revelation effect plays (hover-only, no lock)
  - Moving mouse away from verse: revelation fades out
  - Clicking anywhere EXCEPT the verse area: navigates to /home
  - Clicking on the verse area: nothing (safe zone for reading)

Mobile:
  - Page loads with cinematic entrance sequence
  - Tapping anywhere on the page: navigates to /home
  - No hover effects (CSS hover doesn't apply on touch)
  - Verse text is always visible in its default state
```

## Summary

| File | Change | Lines Affected |
|------|--------|---------------|
| `src/pages/LandingPage.tsx` | Add `onClick` to `<main>`, stopPropagation on verse, remove `tabIndex` | ~4 lines |
| `src/index.css` | `cursor: pointer` to `cursor: default` on `.verse-ref-fixed` | 1 line |

Two files. The page becomes one giant portal button. The verse stays a passive, hover-only revelation. Fantasy.co energy.
