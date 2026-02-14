

# Fix Mobile/Tablet Menu: Use Slide-Out Drawer Instead of Full-Screen Nav

## Problem

On mobile and tablet, tapping the hamburger icon opens the `FullScreenNav` component -- a full-screen overlay with a background image that behaves like a landing page, not a menu. Users expect a standard slide-out drawer menu (`MobileMenu`) that lets them browse categories, access account features, and navigate without losing context.

## Change

In `src/components/header/Navigation.tsx`:

1. **Replace the import** of `FullScreenNav` with `MobileMenu` (line 14)
2. **Replace the component** at line 304: swap `<FullScreenNav>` for `<MobileMenu>`, passing the required props (`isOpen`, `onClose`, `navItems`, `onSearchOpen`, `onFavoritesOpen`, `onAuthOpen`)

## Exact edits

**Line 14** -- change import:
```tsx
// FROM:
import FullScreenNav from "./FullScreenNav";
// TO:
import MobileMenu from "./MobileMenu";
```

**Line 303-304** -- swap component:
```tsx
// FROM:
<FullScreenNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} onSearchOpen={() => setIsSearchOpen(true)} onFavoritesOpen={() => setOffCanvasType('favorites')} onAuthOpen={() => setIsAuthModalOpen(true)} />

// TO:
<MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} navItems={navItems} onSearchOpen={() => setIsSearchOpen(true)} onFavoritesOpen={() => setOffCanvasType('favorites')} onAuthOpen={() => setIsAuthModalOpen(true)} />
```

The key difference: `MobileMenu` requires the `navItems` array prop so it can render the expandable Shop categories with subcategories. `FullScreenNav` had its own hardcoded flat link list.

## Scope

- **1 file** changed: `src/components/header/Navigation.tsx`
- **2 lines** modified (import + component swap)
- Zero new files, zero new dependencies

