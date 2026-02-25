

# Fix: Navigation Bar Inline White Background

## Problem
The navigation bar in `src/components/header/Navigation.tsx` (line 83) uses a hardcoded inline style:
```
style={{ backgroundColor: 'rgba(255, 255, 255, 0.97)', backdropFilter: 'blur(12px)' }}
```
This overrides the dark CSS variable system, rendering a white nav bar against the fully dark site. Every other section on the About page passes the dark colorway check -- this is the sole remaining break.

## Fix

**File:** `src/components/header/Navigation.tsx` (line 83)

Replace the inline `style` with Tailwind classes that reference the CSS variable:

```tsx
// Before (line 83):
<nav className="relative h-[var(--nav-height)]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.97)', backdropFilter: 'blur(12px)' }}>

// After:
<nav className="relative h-[var(--nav-height)] bg-nav/[0.97] backdrop-blur-[12px]">
```

This uses the `bg-nav` token (mapped to `--nav-background: 0 0% 6%`) with 97% opacity, matching the original translucency behavior but now respecting the dark theme.

## Downstream Effects

The nav text already uses `text-nav-foreground` (now `0 0% 80%`, light gray) and `hover:text-nav-hover` (now `30 6% 98%`, near-white). These will read correctly against the dark nav background with no additional changes.

The logo uses `text-foreground` (now near-white) -- also correct.

The About dropdown at line 136 uses `bg-background border-border` -- both now dark -- correct.

The MegaMenu uses `bg-background` -- now dark -- correct.

## Scope
- 1 file changed
- 1 line modified
- Zero risk to other components

