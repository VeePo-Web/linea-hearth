

# Fix: "Become an Ambassador" Button Not Working

## Problem Summary

The "Become an Ambassador" button in the `StoryJoinCTA` component is not functioning correctly. After thorough code analysis, I've identified the root cause and solution.

---

## Root Cause Analysis

### Location
**File**: `src/components/about/StoryJoinCTA.tsx` (lines 90-97)

### The Issue
The button uses the `outline` variant which includes `bg-background`:

```typescript
// In button.tsx - outline variant definition
outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
```

The problem: `bg-background` renders the theme's default background color (likely white/light), which:
1. Creates a visual conflict on the dark stone-950 section
2. The hover states `hover:bg-accent` and `hover:text-accent-foreground` also use theme variables that may not work correctly on dark backgrounds

The custom classes `border-white/30 text-white hover:bg-white/10` are attempting to override these, but **Tailwind's class precedence** means the `bg-background` from the variant may take priority depending on CSS order.

---

## Solution

Replace the button's styling to explicitly override the conflicting background styles and ensure proper click handling.

### Change Required

**File**: `src/components/about/StoryJoinCTA.tsx`

**Current Code** (lines 90-97):
```tsx
<Button
  asChild
  variant="outline"
  size="lg"
  className="border-white/30 text-white hover:bg-white/10 px-8"
>
  <Link to="/ambassador">Become an Ambassador</Link>
</Button>
```

**Fixed Code**:
```tsx
<Button
  asChild
  variant="outline"
  size="lg"
  className="border-white/30 text-white bg-transparent hover:bg-white/10 hover:text-white px-8"
>
  <Link to="/ambassador">Become an Ambassador</Link>
</Button>
```

### Key Changes:
1. **Added `bg-transparent`** - Explicitly overrides `bg-background` from the outline variant
2. **Added `hover:text-white`** - Ensures text stays white on hover (overrides `hover:text-accent-foreground`)

---

## Additional Consistency Fix

The Footer also uses plain `<a href>` tags instead of React Router's `<Link>`, which causes full page reloads. While not the immediate issue, this should be fixed for consistency.

**File**: `src/components/footer/Footer.tsx` (line 65)

**Current**:
```tsx
<a href="/ambassador" className="...">Become an Ambassador</a>
```

**Fixed**:
```tsx
<Link to="/ambassador" className="...">Become an Ambassador</Link>
```

This requires adding the import at the top:
```tsx
import { Link } from "react-router-dom";
```

---

## Implementation Summary

| File | Change | Description |
|------|--------|-------------|
| `src/components/about/StoryJoinCTA.tsx` | Line 94 | Add `bg-transparent hover:text-white` to className |
| `src/components/footer/Footer.tsx` | Lines 40-84 | Convert `<a href>` to `<Link to>` for all internal links |

---

## Testing Checklist

After implementation:
- [ ] Navigate to `/about/our-story` and scroll to the CTA section
- [ ] Verify "Become an Ambassador" button is visible with correct styling (transparent bg, white border)
- [ ] Click the button and verify navigation to `/ambassador` page
- [ ] Test on mobile devices for touch responsiveness
- [ ] Verify hover state shows subtle white background
- [ ] Test the footer "Become an Ambassador" link works correctly

---

## Risk Assessment

**Low Risk** - This is a CSS class addition that:
- Does not change component structure
- Uses standard Tailwind utilities
- Only affects visual styling on one button
- Footer changes are standard React Router migration

