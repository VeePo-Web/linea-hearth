
Goal: make PDP “Add to Bag” reliably add the selected variant and immediately reflect in the cart drawer/header count (“Your Bag (N)”), based on the live audit where the click succeeds visually but cart state remains unchanged.

What I audited
- Verified the live flow on `/product/stay-holy-hoodie`:
  - Selected size M.
  - Clicked Add to Bag.
  - Opened cart drawer and confirmed it still shows `Your Bag (0)` with empty state.
- Confirmed in code:
  - `ProductDetail.tsx` already passes `onAddToBag` to `useCart().addItem(...)`.
  - `CartDrawer` and header cart badge both read from the same `useCart` context.
  - There is only one `CartProvider` in `App.tsx`.
- This isolates the issue to PDP CTA interaction path (button/control wiring), not cart provider wiring.

Likely root cause
1) The animated Add-to-Bag control in `ProductInfo.tsx` uses `Button asChild` + nested `motion.button` + duplicated disabled/click props.
2) In this composition, the visible button can appear interactive, but click handling/disabled state propagation can be inconsistent.
3) Result: `onAddToBag` callback is not consistently invoked in the non-reduced-motion branch even when size/color are selected.

Implementation plan
1. Normalize PDP Add-to-Bag control to a single native button event path
- File: `src/components/product/ProductInfo.tsx`
- Replace the non-reduced-motion Add-to-Bag block:
  - Remove `asChild` + nested `motion.button` composition for the primary CTA.
  - Keep animation wrapper on container (`motion.div`) if desired, but make the clickable element a single `Button` with direct `onClick`.
  - Keep `id="main-add-to-bag"` for sticky observer compatibility.
  - Keep `disabled={!canAddToBag}` on that same button only.
- This eliminates event propagation ambiguity and ensures callback execution is deterministic.

2. Harden single-color auto-selection effect
- File: `src/components/product/ProductInfo.tsx`
- Keep existing auto-select logic, but make effect dependencies explicit/stable:
  - Include `selectedColor` and `onColorChange` in deps.
  - Guard against unnecessary re-runs.
- Purpose: guarantee `canAddToBag` is true once a size is chosen for single-color products.

3. Keep PDP add handler direct to cart state
- File: `src/pages/ProductDetail.tsx`
- Retain direct `addItem(...)` callback currently wired in `onAddToBag`.
- Verify payload fields are complete (`id`, `name`, `price`, `priceFormatted`, `image`, `category`, `size`, `color`, `quantity`, `productId`).
- Do not reroute this main PDP CTA through quick-add path.

4. Validate end-to-end in live preview (desktop + mobile)
- Desktop:
  - Open PDP.
  - Confirm color is preselected for single-color products.
  - Select size.
  - Click Add to Bag.
  - Confirm drawer auto-opens and shows item row.
  - Confirm header/cart count increments > 0.
- Mobile:
  - Repeat PDP add flow.
  - Confirm cart drawer and count are in sync.
- Repeat on both available products to ensure variant handling is robust.

5. Regression checks
- Ensure `HighIntentPrompt` and `MobileStickyATC` still use quick-add behavior without breaking.
- Ensure no changes to cart storage key behavior, bundle logic, or saved-for-later indicators.
- Confirm no console errors introduced by the CTA rewrite.

Acceptance criteria
- Clicking PDP Add to Bag after valid selection always adds item to cart.
- Cart drawer opens with the new line item visible.
- Header/cart indicator and drawer title both show updated non-zero count.
- Works on desktop and mobile for both active products.
