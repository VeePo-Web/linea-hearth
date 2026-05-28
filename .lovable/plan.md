
# Complete the Look — PDP Upsell Plan

Goal: turn the existing `LookbookLookSection` from a passive product strip into a revenue-engineered, Apple-precision / Temu-velocity bundle module that lifts AOV without changing any clothing price.

---

## UX Principles (the bar)

1. **Zero-shift, zero-think** — the user never leaves the PDP to build the look.
2. **One primary action** — "Add the Look" must dominate; everything else is secondary.
3. **Loss-aversion + savings** — show the bundle savings the moment they qualify (no price *changes*, just stacked `bundle_discounts` already in DB).
4. **Default-on intelligence** — sizes pre-selected from `useSizeMemory`; only ask when we don't know.
5. **Editorial, not retail** — keeps the Swedish/LA aesthetic (sharp edges, chrome hairlines, Forest Green accent). No Temu visual chaos — Temu *mechanics*, Apple *finish*.

---

## The Module (replaces current `LookbookLookSection`)

### Layout — Desktop (≥ md)

```text
┌──────────────────────────────────────────────────────────────────┐
│  FROM THE [LOOK NAME]                                            │
│  "Headline" — Scripture                                          │
├──────────────────────┬───────────────────────────────────────────┤
│                      │  [✓] This item                  $XX       │
│                      │  [✓] Sibling 1 · Size M ▾       $XX       │
│   LOOK HERO IMAGE    │  [✓] Sibling 2 · Size L ▾       $XX       │
│   (look.image_url)   │  [ ] Sibling 3 · Pick size ▾    $XX       │
│   aspect 4/5         │                                           │
│                      │  ──────────────────────────────────       │
│                      │  Bundle subtotal      $XXX                │
│                      │  Bundle saving        −$XX  (chip)        │
│                      │  Free shipping at $99 ▓▓▓▓▓░░ $12 to go   │
│                      │                                           │
│                      │  ┌────────────────────────────────────┐   │
│                      │  │  ADD THE LOOK · $XXX  →            │   │ ← primary
│                      │  └────────────────────────────────────┘   │
│                      │  Add selected (3 of 4)  · text link       │ ← secondary
└──────────────────────┴───────────────────────────────────────────┘
```

### Layout — Mobile (< md)

Two-row vertical:
1. Look hero (full-bleed, aspect 4/5) with floating "FROM THE [LOOK]" chip top-left.
2. Horizontal-snap row of compact item rows (checkbox + thumb + name + inline size ▾ + price).
3. Sticky-on-scroll-into-view CTA bar at bottom of section: **ADD THE LOOK · $XXX** (does NOT compete with the global MobileStickyATC — only appears while module is in viewport; uses IntersectionObserver, hides the global ATC while visible to avoid double-CTA).

### Item row — micro-interactions

- Checkbox is the whole row (44px tap target). Tap toggles inclusion with 10ms haptic + chrome-underline pulse.
- Size selector is an **inline pill row** (XS S M L XL) that expands on tap — no dropdown, no modal. Uses existing `InlineQuickSizePicker`.
- If `useSizeMemory` has a size for this category → preselected, badge "Your size" in Forest Green.
- Out-of-stock variants render struck-through, row auto-unchecks and shows "Restocking" micro-label (still allows email-when-back later).
- Removing the current product from the bundle is disallowed (it's anchored, shown with a small chrome lock icon and label "This item").

### The "Add the Look" CTA

- Primary state: `ADD THE LOOK · $XXX` (live total, recalcs on every toggle/size change with 200ms tween).
- If a bundle discount applies (via `useBundleDiscounts` against `bundle_discounts` table where `source_type='lookbook'` + `source_id=look.id`): show strikethrough subtotal + green delta chip "Save $XX as a set".
- If any selected row lacks size → CTA morphs to `Pick sizes (2 left)` and gently scrolls/focuses the first missing picker. Never errors, never throws.
- On confirm: single `addItems()` call (batch), success state = chrome check overlays each row in 60ms stagger, then a single bottom-anchored toast "Look added · 4 items".

### Bundle savings logic (no price changes)

- Reuse existing `bundle_discounts` (already in DB) — query by `source_type='lookbook'` and `source_id=look.id`.
- If no row-level rule exists, fall back to a global "complete the look" rule (config in `/ops-portal/discounts`) — e.g. 10% off when 3+ items from same look.
- Discount is **display-only on PDP** and re-validated server-side in `create-checkout-session` (it already re-validates discount codes — extend the same pattern to bundle rules).

### Swap-and-shop (the Temu mechanic, Apple finish)

- Each non-anchored row has a subtle `›` swap affordance. Tap opens a **horizontal carousel** of 3–6 alternates in the same lookbook position (e.g. other "Bottoms"). Selecting one replaces the row in place — total recalculates, no page jump.
- Powered by querying `lookbook_look_products` for products with the same `position` across active looks (or `categories.slug` fallback).

---

## Smart Fallbacks (when there's no lookbook look)

Order of precedence:
1. **Curated lookbook look** containing this product → render full bundle module above.
2. **Position-based fallback** — products from any active look matching this product's category (compact 4-tile bundle, same CTA, no bundle discount label).
3. **Frequently bought together** — derived from `order_items` co-occurrence (cached 24h). Top-3 sibling products with same Add-the-Look UI but labeled "Often Worn Together".
4. **Editorial fallback** — current `WearWithSection` (last resort).

A small server function `get-complete-the-look` (edge fn) resolves this with caching so the PDP only fires one request.

---

## Telemetry (so we can keep optimizing)

New `upsell_events` table (insert-only, anon-friendly):

| column | type | notes |
|---|---|---|
| id | uuid | pk |
| session_id | text | from existing tracking |
| user_id | uuid | nullable |
| anchor_product_id | uuid | the PDP product |
| look_id | uuid | nullable |
| event_type | text | `impression` / `toggle` / `size_pick` / `swap` / `add_look` / `add_partial` |
| items | jsonb | snapshot of selection |
| subtotal_cents | int |  |
| discount_cents | int |  |
| created_at | timestamptz | default now() |

Required to compute the real metric: **bundle attach rate** (= add_look ÷ impression) and **AOV lift vs. control**.

---

## Implementation steps

1. **Edge fn `get-complete-the-look`** — one query, returns `{ look, anchor, siblings[], bundleRule, fbtFallback[] }` with 5-min cache.
2. **Hook `useCompleteTheLook(productId)`** — wraps the edge fn + selection state (`Map<productId, {included, size}>`) + memoized subtotal/savings.
3. **Component `CompleteTheLookBundle`** (replaces internals of `LookbookLookSection`) — desktop split-pane + mobile stack as drawn above. Anchored current item, inline size pills, swap drawer.
4. **Mobile sticky-on-view CTA** — IntersectionObserver; hides global `MobileStickyATC` while visible (via context or a small `useStickyCtaOwner` hook to prevent double bars).
5. **Bundle pricing display** — `useBundleDiscounts` extended to accept `{ lookId, productIds }`. Pure display; no DB write from client.
6. **Server-side bundle re-validation** in `create-checkout-session` — recompute bundle saving from `bundle_discounts` and apply as a discount line; reject if client-claimed saving exceeds server amount.
7. **Migration**: `upsell_events` table + GRANTs (anon insert, admin select), plus `bundle_discounts` index on `(source_type, source_id, is_active)`.
8. **Telemetry wiring** — fire `impression` on intersection, `toggle/size_pick/swap` on interaction, `add_look/add_partial` on confirm.
9. **Ops portal**: small panel in `/ops-portal/lookbook/[id]` to attach a bundle discount rule directly to a look (writes to `bundle_discounts`).
10. **QA matrix**: look with full siblings · look with OOS sibling · no look (FBT path) · brand-new product (editorial fallback) · reduced-motion · mobile sticky collision with global ATC · checkout server re-validation rejects tampered totals.

---

## Why this makes the most money (no price changes)

- **Attach rate** — single batched "Add the Look" beats per-tile Quick Add (industry benchmark ~2–4× attach lift).
- **AOV** — bundle savings make the 3rd/4th item feel free; the saving chip is a loss-aversion trigger, not a discount.
- **Friction kill** — pre-filled sizes from `useSizeMemory` + inline pills cut the #1 cart-abandonment cause on apparel (size friction).
- **Swap-and-shop** — keeps undecided users *inside* the bundle instead of bouncing to PLP.
- **Free-shipping bar inside the module** — converts the bundle CTA into a shipping-unlock CTA at the magic moment.

---

## Out of scope (intentionally)

- Changing any product `price` / `sale_price`.
- New Stripe products or prices (bundle saving is a discount line, not a new SKU).
- Subscription / "save 5%" upsells.
- Personalized ML ranking (v2 — needs more order data first).

