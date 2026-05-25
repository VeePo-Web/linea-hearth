# Fix Product Pagination — Holistic Decision

## The Picture

Looking across the shopping flow:

- **Category/Shop page** (`/shop`, `/category/:slug`) — uses URL `?page=2` as source of truth via `useSearchParams` in `Category.tsx`. Pagination is currently broken (no-op handler).
- **Product detail page** (`/product/:slug`) — no pagination needed.
- **Cart drawer** — no pagination (single scrollable list).
- **Account orders, favorites, admin tables** — separate concerns, not affected.

So pagination is really only a Category-page problem. The cleanest fix aligns with what's already there.

## Decision: Option A (URL-driven, lift handler)

`Category.tsx` already owns `page` state, syncs it to `?page=` in the URL, and scrolls to top. `ProductGrid.tsx` just needs to forward click events up — not own state.

Why this wins over the alternatives:
- **Shareable/bookmarkable URLs** — `/shop?page=3` works on refresh, back button, and shared links. Already half-built.
- **Single source of truth** — filters, sort, and page all live in URL via `Category.tsx`. Splitting page state into `ProductGrid` would fragment that.
- **Minimal change** — 3 lines. No refactor of query keys or filter logic.
- **Filters already reset page to 1** in `handleFilterChange` / `handleSortChange` — that wiring stays intact.

## Changes

1. **`src/components/category/ProductGrid.tsx`**
   - Add `onPageChange: (page: number) => void` to `ProductGridProps`.
   - Pass it to `<Pagination onPageChange={onPageChange} />` instead of `() => {}`.

2. **`src/pages/Category.tsx`**
   - Pass `onPageChange={handlePageChange}` to `<ProductGrid />`. The handler already exists and does the right thing (state + URL + scroll-to-top).

## Out of Scope (noted, not fixing now)

- `totalPages` is computed from server `count`, but size/color/price filters run client-side after the query. On heavily filtered views, page count can be slightly misleading. Proper fix is server-side variant filtering — separate task. Tell me if you want it bundled in.

## Verification

- Click page 2 → URL becomes `?page=2`, grid refetches, page scrolls to top.
- Refresh on `?page=2` → loads page 2 directly.
- Change a filter on page 3 → resets to page 1, URL clears `page`.
