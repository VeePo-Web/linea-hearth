

# Fix Build Error: SearchOverlay.tsx Stray Character

## Problem
Line 90 of `src/components/header/SearchOverlay.tsx` has a stray `>` character after the className string closes:

```tsx
// Current (broken):
<span className="text-[10px] text-champagne-600 font-medium px-1.5 py-0.5 bg-champagne-500/10 rounded-sm">>
```

The closing `">` should be just `">`, but there's an extra `>` making it `">>` -- the first `>` closes the JSX tag and the second `>` is a literal character that TSX can't parse.

## Fix
Remove the extra `>` on line 90 so it reads:

```tsx
<span className="text-[10px] text-champagne-600 font-medium px-1.5 py-0.5 bg-champagne-500/10 rounded-sm">
```

## Scope
- 1 file: `src/components/header/SearchOverlay.tsx`
- 1 character removal on line 90

