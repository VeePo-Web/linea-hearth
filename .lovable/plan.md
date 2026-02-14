

# Fix Nav Logo: Replace LINEA SVG with "LINE OF JUDAH" Text Wordmark

## Problem

The SVG file at `/logo.svg` renders "LINEA" — the old brand name. The brand is now "Line of Judah." The SVG asset is outdated and does not match the current identity.

## Solution

Replace the `<img src="/logo.svg">` in both header files with a styled text wordmark reading "LINE OF JUDAH" — the same Fear of God-style treatment that was working before, using DM Sans at light weight with wide editorial tracking.

## Files Changed

| File | Change |
|------|--------|
| `src/components/header/Navigation.tsx` | Replace `<img>` with text `<span>` wordmark |
| `src/components/header/CheckoutHeader.tsx` | Same swap |

## Exact Code

Both files get the same replacement — swap the `<img>` tag for:

```tsx
<span className="text-[0.7rem] sm:text-xs font-light tracking-[0.35em] text-foreground uppercase whitespace-nowrap">
  LINE OF JUDAH
</span>
```

## What Does NOT Change

- Homepage — zero changes
- Nav structure — zero changes
- Footer — unchanged
- No new files or dependencies

