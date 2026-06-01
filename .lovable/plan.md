## Fix "All" Shop Dropdown Link to /catalogue

The previous implementation incorrectly routed the "All" option under Shop to `/category`. It should go to `/catalogue` — the unified product catalogue page that shows all items with category filters.

### Changes
1. **Navigation.tsx**
   - Change `{ name: "All", href: "/category" }` to `{ name: "All", href: "/catalogue" }` in the Shop `submenuItems` array.

2. **MegaMenu.tsx**
   - Change the "View All" CTA link for the Shop dropdown from `/category` to `/catalogue`.

### Verification
- Hovering Shop shows "All" as the first link.
- Clicking "All" navigates to `/catalogue`.
- The "View All Shop" CTA at the bottom of the mega menu also goes to `/catalogue`.