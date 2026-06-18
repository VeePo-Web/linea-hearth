# Change 90 days → 14 days (returns window only)

Straight find-and-replace across the 5 files that mention 90 days. No other copy, structure, or behavior changes.

## Replacements

- **`src/components/header/StatusBar.tsx:17`** — `"90-day returns"` → `"14-day returns"`
- **`src/components/product/ShippingReturnsAccordion.tsx:56`** — `90-day returns` → `14-day returns`
- **`src/pages/FAQ.tsx:54`** — `within 90 days of delivery` → `within 14 days of delivery`
- **`src/pages/FAQ.tsx:56`** — keyword `"90 days"` → `"14 days"`
- **`src/pages/FAQ.tsx:82`** — `within the 90-day window` → `within the 14-day window`
- **`src/pages/ReturnsExchanges.tsx:45`** — `90 days from delivery` → `14 days from delivery`
- **`src/pages/ReturnsExchanges.tsx:81`** — meta desc `within 90 days` → `within 14 days`
- **`src/pages/ReturnsExchanges.tsx:86`** — hero subtitle `90 days from delivery` → `14 days from delivery`
- **`src/pages/ReturnsExchanges.tsx:108`** — `within 90 days after the order has been delivered` → `within 14 days after the order has been delivered`
- **`src/pages/ReturnsExchanges.tsx:190`** — `beyond the 90-day return window` → `beyond the 14-day return window`

## Audit
After edits, re-run `grep -rn "90-day\|90 day\|90 days"` across `src/`, `supabase/`, `public/`, `index.html` and confirm zero matches.
