

# Upgrade About Hover: From Bulky MegaMenu to Compact Inline Dropdown

## Problem

The "About" nav item triggers the same full-width MegaMenu component used by "Shop." Shop has 5 categories with 3-5 subcategories each plus 2 images — the mega panel makes sense there. But About has just 3 flat links (Our Story, Size Guide, Customer Care) and 1 image, resulting in a massive empty panel that feels clunky, blocks content, and breaks editorial restraint.

## Solution

Create a compact, minimal dropdown specifically for About — a tight column of 3 links that drops directly beneath the "About" nav item. No images. No "View All" CTA. No full-width panel. Just clean, confident, Swedish-restraint navigation.

## Design Specifications

- **Width:** `180px` fixed — just enough for the link text
- **Position:** Anchored directly below the "About" nav link (not full-width)
- **Padding:** `py-4 px-5` — tight but breathable
- **Links:** 3 items, `text-sm font-light`, `space-y-2.5` between them
- **Hover state:** `text-foreground` to `text-muted-foreground` with underline reveal (matches existing MegaMenu subcategory pattern)
- **Animation:** Fade in + slight `y: -6 to 0` — faster than MegaMenu (200ms)
- **Border:** `border border-border` with subtle `shadow-sm` — not the heavy `shadow-lg` of the MegaMenu
- **Background:** Same `bg-background` as MegaMenu for consistency
- **No image, no "View All" CTA, no bottom border divider**

## Implementation

### File 1: `src/components/header/Navigation.tsx`

**Change the About item's hover behavior.** Instead of feeding About's data into MegaMenu, render a new `AboutDropdown` component inline within the nav item's `<div>`. The MegaMenu condition already checks `items.length > 0` — we change About's `submenuItems` to an empty array in the `navItems` config, and instead handle it with a dedicated compact dropdown.

Specifically:
- Move About's submenu links out of `navItems[3].submenuItems` (set to `[]` so MegaMenu ignores it)
- Inside the About nav `<div>` (the one with `onMouseEnter/onMouseLeave`), add a compact `AnimatePresence` dropdown that renders when `activeDropdown === "About"`

### File 2: No new component file needed

The dropdown is small enough (roughly 25 lines of JSX) to live inline in `Navigation.tsx` inside the About nav item's wrapper div. This avoids an extra file for 3 links.

### What the dropdown looks like

```text
+------------------+
|  Our Story       |
|  Size Guide      |
|  Customer Care   |
+------------------+
```

180px wide. Clean border. Appears directly below the "About" text. Disappears on mouse leave. No images. No arrows. Just links.

### Changes summary

| File | Change |
|------|--------|
| `src/components/header/Navigation.tsx` | Empty About's `submenuItems` array; add inline compact dropdown when `activeDropdown === "About"` |

- **1 file changed**
- **~25 lines added** (compact dropdown JSX)
- **3 lines modified** (About navItems config)
- **Zero new dependencies**
- MegaMenu component unchanged — Shop still uses it as-is

