

# Fix: Prepend Verse Overlapping "LINE OF JUDAH" Title

## The Problem

On MacBook-sized viewports, hovering over "Exodus 28:2" causes the prepended verse context ("And thou shalt make holy garments for Aaron thy brother,") to expand upward and visually collide with the "LINE OF JUDAH" title. The current CSS positions the prepend at `bottom: 100%` of the verse block, which places it above the *entire* element (including the 80-120px padding-top), launching it straight into the title zone.

## Root Cause

```
Current layout math:
- verse-unified-block has padding-top: 120px (desktop)
- .verse-prepend uses bottom: 100% (positions ABOVE the entire block)
- This means prepend sits above the padding zone, overlapping the title
```

## The Fix: Anchor Prepend Inside the Padding Zone

Instead of `bottom: 100%`, position the prepend at `top: 0` so it sits inside the protected padding zone. The 80px (mobile) / 120px (desktop) padding-top already reserves exactly the right amount of space for it.

### File 1: `src/index.css`

**Change `.verse-prepend` positioning:**

Current:
```css
.verse-prepend {
  position: absolute;
  bottom: 100%;         /* PROBLEM: above entire block */
  left: 50%;
  transform: translateX(-50%);
  ...
  margin-bottom: 12px;
}
```

New:
```css
.verse-prepend {
  position: absolute;
  top: 0;               /* FIX: anchored inside the padding zone */
  left: 50%;
  transform: translateX(-50%);
  ...
  /* Remove margin-bottom, no longer needed */
}
```

**Desktop media query update:**

Remove `margin-bottom: 16px` from the desktop `.verse-prepend` override (no longer needed since it sits inside the padding zone).

### Why This Works

The padding-top on `.verse-unified-block` (80px mobile / 120px desktop) creates a "protected zone" above the content. By switching from `bottom: 100%` to `top: 0`, the prepend text renders inside this reserved zone instead of above the entire block. This guarantees it never touches the "LINE OF JUDAH" title regardless of viewport size.

```
Before (broken):
  LINE OF JUDAH
  ──────
  [prepend floats HERE - overlapping title]
  ┌─ verse-unified-block ──────────────────┐
  │  (120px padding-top)                    │
  │  "for glory and for beauty."            │
  │  Exodus 28:2                            │
  └─────────────────────────────────────────┘

After (fixed):
  LINE OF JUDAH
  ──────
  ┌─ verse-unified-block ──────────────────┐
  │  [prepend renders HERE - safe zone]     │  ← top: 0 (inside padding)
  │  (remaining padding)                    │
  │  "for glory and for beauty."            │
  │  Exodus 28:2                            │
  └─────────────────────────────────────────┘
```

### Summary of Changes

| File | Change |
|------|--------|
| `src/index.css` | `.verse-prepend`: change `bottom: 100%` to `top: 0`, remove `margin-bottom: 12px` |
| `src/index.css` | Desktop `.verse-prepend`: remove `margin-bottom: 16px` |

Two lines of CSS. Zero risk. Complete fix.

