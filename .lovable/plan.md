## Add 'All' Shop Dropdown Option

Add an "All" link at the top of the Shop dropdown menu that navigates to `/category` (the unified shop page).

### Changes
1. **Navigation.tsx**
   - Insert `{ name: "All", href: "/category" }` as the first element in the `Shop` > `submenuItems` array (currently starts with "Bottoms").

2. **MegaMenu.tsx**
   - Update the "View All" CTA link at the bottom of the dropdown so that when `activeDropdown === "Shop"`, the destination is `/category` instead of `/category/shop`.

3. **MobileMenu.tsx**
   - No change needed. The mobile slide-out renders `submenuItems` dynamically from the `navItems` prop passed by `Navigation.tsx`, so adding the item there automatically propagates to mobile.

### Verification
- Hovering Shop in the header shows "All" as the first column/category link.
- Clicking "All" navigates to `/category`.
- The "View All Shop" CTA at the bottom of the mega menu also goes to `/category`.
- Mobile menu Shop accordion also lists "All" first.