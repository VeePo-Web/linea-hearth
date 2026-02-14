

# Fix Logo: Replace Broken Image with Fear of God-Style Text Wordmark

## Problem

The center logo uses `<img src="/logo.png">` which is not rendering correctly. Instead of debugging asset files, the superior editorial approach is a typographic wordmark — matching the Fear of God aesthetic of ultra-tracked, uppercase, light-weight lettering.

## Solution

Replace the `<motion.img>` element with a styled `<span>` text wordmark reading "LINE OF JUDAH" in a Fear of God-inspired typographic treatment.

## Design Specifications

- **Text:** "LINE OF JUDAH" (all caps)
- **Font:** DM Sans (already the site font) at weight 300 (light)
- **Letter-spacing:** `0.35em` — wide, confident, editorial tracking
- **Font size:** `text-[0.7rem]` on mobile, `text-xs` on desktop — small but commanding
- **Color:** `text-foreground` (black) — high contrast, no ambiguity
- **No image dependency** — pure CSS text, resolution-independent, always renders

## Implementation

### File: `src/components/header/Navigation.tsx`

**Lines 160-171** — Replace the `<motion.img>` block with a text wordmark:

```tsx
{/* Center logo */}
<div className="absolute left-1/2 transform -translate-x-1/2">
  <Link to="/" className="block">
    <span className="text-[0.7rem] sm:text-xs font-light tracking-[0.35em] text-foreground uppercase whitespace-nowrap">
      LINE OF JUDAH
    </span>
  </Link>
</div>
```

## Scope

- **1 file** changed: `src/components/header/Navigation.tsx`
- **3 lines** modified (swap img for span)
- Zero new dependencies, zero new assets
- Hover animation removed (text wordmarks don't scale on hover in premium fashion — it looks cheap)

