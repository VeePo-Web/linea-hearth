## Goal

Replace the single flat $15 CA / $40 intl shipping with a **per-product-type** model that mirrors the Printful tables you sent. Every product gets bucketed into one of three profiles, and the cart fee is the sum of `first_item + additional_item × (qty−1)` for each bucket. New products inherit a profile automatically from their category, so the system scales without manual work. Free shipping over $250 CAD stays.

## Rates (CAD)

Pulled from the middle of your screenshots so they cover typical Printful SKUs without over-charging.

| Profile | Canada 1st | Canada +add'l | Intl 1st | Intl +add'l |
|---|---|---|---|---|
| `hat`    | $6.50  | $2.00 | $12.00 | $3.00 |
| `tee`    | $7.00  | $3.00 | $13.00 | $3.50 |
| `hoodie` | $12.00 | $3.00 | $22.00 | $5.00 |

Free shipping still kicks in at subtotal ≥ $250 CAD (unchanged).

Example: 1 hoodie + 2 tees to Canada = $12 + ($7 + $3) = $22 CAD.

## Category → profile mapping (automatic)

| Category slug | Profile |
|---|---|
| `hats` | hat |
| `tees`, `tops`, `short-sleeve`, `long-sleeve` | tee |
| `hoodies`, `pullover-hoodies`, `zip-up-hoodies`, `quarter-zips` | hoodie |

Anything new defaults to `tee` (safe middle bucket) and can be changed in Admin.

## Technical plan

### 1. Database (single migration)
- Add `shipping_profile TEXT` to `public.categories` (nullable, default `null`).
- Add `shipping_profile_override TEXT` to `public.products` (nullable). Per-product override wins over its category.
- Backfill `categories.shipping_profile` using the mapping above.
- No new table needed — rate matrix lives in a shared TS module so client + edge function read the same source of truth.

### 2. Shared shipping module
- New file `src/lib/shipping.ts` (and mirrored copy in `supabase/functions/_shared/shipping.ts` — Deno can't import `src/`).
  - `SHIPPING_RATES` matrix (above).
  - `computeShipping({ items, country, subtotalCents })` → cents. Items carry `{ profile, quantity }`.
  - Free-ship threshold + intl detection live here.

### 3. Checkout edge function (`create-checkout-session`)
- Fetch each line's product → join `category.shipping_profile` + `products.shipping_profile_override`.
- Call shared `computeShipping`; replace `SHIPPING_RATE_CA_CENTS` / `SHIPPING_RATE_INTL_CENTS` block.
- Single Stripe `shipping_options` entry continues — name becomes `"Standard shipping"` or `"Free shipping"`.

### 4. Client checkout + cart UI
- `getShippingCost` in `src/lib/currency.ts` delegates to `computeShipping` (needs cart items now, not just subtotal). Update call sites:
  - `src/pages/Checkout.tsx` — pass cart items.
  - `BundleProgress` / free-shipping bar — still drives off subtotal threshold (unchanged copy: "Free shipping on $250+").
- `useCart` already has variant/product IDs; expose each line's `shipping_profile` via the product query and attach to cart items.

### 5. Admin
- `AdminCategories` (or category form): add **Shipping profile** dropdown (Hat / Tee / Hoodie).
- `AdminProductForm`: add optional **Shipping profile override** dropdown (Inherit from category / Hat / Tee / Hoodie).
- Read-only **Shipping Rates** card on `AdminDashboard` showing the matrix so ops can sanity-check.

### 6. Copy updates
- Footer / `ShippingInfo` / `Checkout` helper line → `"Calculated by item · Free over $250 CAD"` instead of the old "$15 flat" line.

## Out of scope
- No multi-carrier, no real-time Printful API quoting, no zone-based intl breakdown (single intl tier only).
- No changes to tax, currency, discount, or Stripe checkout flow beyond the shipping number.

## Verification
- Unit-style check via console: 1 hat → $6.50 CA, 2 hats → $8.50, 1 hoodie + 1 tee → $15, intl 1 tee → $13, $260 cart → FREE.
- Playwright: load `/checkout` with seeded cart, confirm displayed shipping matches matrix for CA + US.
- Edge function returns matching `shipping_cents` in `orders` row after test checkout.
