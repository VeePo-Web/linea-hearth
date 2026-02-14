

# Elevate the Nav Bar Logo — Premium Typographic Wordmark

## What We're Fixing

The "LINE OF JUDAH" text in the center of the nav bar currently uses DM Sans at `font-light` with wide tracking. It's clean but reads as generic — it lacks the typographic authority of a true fashion wordmark. The goal is to make it feel like a Fear of God / 032c-level brand mark without changing anything else on the site.

## The Upgrade

### 1. Use the SVG Logo Instead of Plain Text

The project already has a high-quality SVG wordmark at `public/logo.svg` — a custom serif-style "LINE" rendering that looks far more premium than any web font. We will use this SVG inline as the nav logo, sized to fit the nav bar height.

- Render the SVG as an `<img>` tag pointing to `/logo.svg` (not the broken `/logo.png`)
- Height: `h-5` on mobile, `h-6` on desktop — compact, confident, proportional to the 64px nav
- The SVG is black on transparent, which works perfectly against the white nav background
- Add `alt="Line of Judah"` for accessibility

### 2. Files Changed

| File | Change |
|------|--------|
| `src/components/header/Navigation.tsx` | Replace the `<span>LINE OF JUDAH</span>` with `<img src="/logo.svg">` |
| `src/components/header/CheckoutHeader.tsx` | Same swap for checkout consistency |

### 3. Exact Code Change (Navigation.tsx, lines 160-167)

Replace the current text span:
```tsx
{/* Center logo */}
<div className="absolute left-1/2 transform -translate-x-1/2">
  <Link to="/" className="block">
    <img 
      src="/logo.svg" 
      alt="Line of Judah" 
      className="h-5 sm:h-6 w-auto" 
    />
  </Link>
</div>
```

Same pattern for CheckoutHeader.tsx.

### 4. Why SVG Over Text

- The SVG has a custom serif letterform for "LINE" with intentional weight variation between "LINE," "OF," and "JUDAH" — this typographic contrast is what makes premium wordmarks feel designed rather than typed
- Resolution-independent, crisp on all screens
- No additional font download required
- Already exists in the project — zero new assets

### 5. What Does NOT Change

- No homepage changes
- No nav structure changes
- No layout changes
- No new dependencies
- Footer logo stays as-is (different treatment is fine — footer uses the amber accent)
