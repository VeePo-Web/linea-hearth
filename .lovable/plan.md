# Fix "new page opens scrolled down" bug

## Root cause
When a modal/drawer (CartDrawer, QuickViewModal/AuthModal, FavoritesDrawer, SearchOverlay, MobileMenu, FullScreenNav) is open and the user navigates — e.g. tapping "Full Details" in QuickView, "Checkout" in the cart drawer, a search result, or a nav link — two scroll operations race:

1. React Router updates the pathname → `ScrollToTop` (`src/components/ScrollToTop.tsx`) fires `window.scrollTo(0, 0)`.
2. The overlay unmounts → its cleanup calls `unlockScroll()` (`src/lib/scrollLock.ts:18`), which runs `window.scrollTo(0, savedScrollY)` — restoring the scroll position from the *previous* page.

Step 2 runs after step 1, so the new page lands at the old page's Y offset — often near the bottom. The browser's default `history.scrollRestoration = 'auto'` can also re-apply a remembered position on top of our reset.

## Fix

1. **`src/lib/scrollLock.ts`** — track the pathname captured at lock time. On unlock, only restore `savedScrollY` when the pathname is unchanged. If the route changed during the lock, skip the `scrollTo` (the new page handles its own scroll). Also clamp restore to `Math.min(savedScrollY, document.documentElement.scrollHeight - innerHeight)` so it never goes out of bounds.

2. **`src/components/ScrollToTop.tsx`** — 
   - Set `history.scrollRestoration = 'manual'` once on mount so the browser never auto-restores.
   - Use `useLayoutEffect` instead of `useEffect` so the reset happens before paint.
   - Add a follow-up `requestAnimationFrame` `scrollTo(0, 0)` to defeat any late restore (e.g. async unlockScroll from an unmounting modal).
   - Skip the reset when the new URL has a `#hash` (so deep links to FAQ/Legal anchors still land on the anchor).

3. **Verification pass** — walk through these flows and confirm each lands at top:
   - Cart drawer → Checkout button → `/checkout`
   - QuickViewModal → "Full Details" → `/product/:slug`
   - Search overlay → product result → PDP
   - Mobile menu / FullScreenNav → any link
   - Favorites drawer → product link → PDP
   - Auth modal closing while a redirect fires
   - Hash links (`/faq#shipping`, `/legal/...#section`) still scroll to the anchor, not top

## Files touched
- `src/lib/scrollLock.ts`
- `src/components/ScrollToTop.tsx`

No changes to overlay components themselves — the lock/unlock contract still works the same; we just stop it from clobbering the new page's scroll position.
