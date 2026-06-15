
# Purge remaining USD references → CAD

## Audit result

Stripe checkout, shipping rates, and dispute handling are already on `cad`. Only four stragglers remain:

1. **`src/pages/TermsOfService.tsx:84`** — copy reads "All prices are in USD unless…". Change to "All prices are in Canadian Dollars (CAD) unless otherwise stated." Also scan the rest of the page for any other USD mention while there.

2. **`supabase/functions/send-order-confirmation/index.ts:181`** — symbol map has `usd: "$"` with no `cad` entry. Order rows store currency as `cad`, so the symbol falls back to the bare ISO code. Add `cad: "$"` and keep `usd: "US$"` (so a stray legacy USD order still renders correctly, but never reads "$" ambiguously). Also default the currency-symbol helper to `$` (CAD) instead of `usd`.

3. **`supabase/functions/preview-order-emails/index.ts:20`** and **`supabase/functions/test-all-emails/index.ts:23`** — same symbol-map fix: add `cad: "$"`, switch `usd` to `"US$"`, and default any unknown code to `$`.

4. **Re-grep guard** — after edits, re-run `grep -rni "\\busd\\b\\|'usd'\\|\"usd\"" src supabase` to confirm zero remaining USD literals outside the new "US$" disambiguation label.

## Out of scope

- No price values change. The numeric amounts in the DB and Stripe are already CAD; this is purely the labels/copy and the symbol map.
- No new migration. `orders.currency` and `stripe_disputes.currency` are already `cad`.
- No edge-function redeploys needed beyond the three email-related functions (will deploy those).
