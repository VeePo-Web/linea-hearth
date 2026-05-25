# Flat 5% GST at checkout

Replace Stripe's automatic tax engine with a fixed 5% GST line item so every order gets a simple, predictable Canadian GST charge.

## Why not `automatic_tax`?

The checkout currently uses `automatic_tax: { enabled: true }`, which delegates rate calculation to Stripe Tax (and requires the user's Stripe account to be registered for tax in each jurisdiction). The user wants a flat 5% — simpler, no registration logic, no per-province PST/HST math.

## Step 1 — Create a reusable Stripe Tax Rate

In `supabase/functions/create-checkout-session/index.ts`, add a small helper `getOrCreateGstTaxRate(stripe)` that:
- Calls `stripe.taxRates.list({ active: true, limit: 100 })` and returns the first rate whose `metadata.kind === "linea_gst_5"`.
- If none exists, creates one with:
  - `display_name: "GST"`
  - `description: "Canadian GST"`
  - `jurisdiction: "CA"`
  - `country: "CA"`
  - `percentage: 5`
  - `inclusive: false`
  - `metadata: { kind: "linea_gst_5" }`
- Caches the rate id in a module-level variable so subsequent invocations skip the list call.

## Step 2 — Apply to line items + shipping

- Remove `automatic_tax: { enabled: true }` from `stripe.checkout.sessions.create(...)`.
- Add `tax_rates: [gstTaxRateId]` to each entry returned by the `body.items.map(...)` builder.
- Add `tax_rates: [gstTaxRateId]` inside the existing `shipping_rate_data` so shipping is also taxed at 5% (matches Canadian GST treatment of shipping).
- Keep `tax_behavior: "exclusive"` on shipping; remove `tax_code` from product_data (no longer needed without automatic_tax).

## Step 3 — Persist GST on the order

The webhook already pulls `total_details.amount_tax` from the completed session into `orders.tax_cents`, so no webhook changes are needed — the 5% will land there automatically.

## Out of scope

- Province-specific HST (Ontario 13%, NS/NB/NL/PEI 15%) — flat 5% applies everywhere per request.
- Tax-exempt customers, B2B exemption flows.
- Stripe Tax registration / `managed_payments`.

Confirm to run.