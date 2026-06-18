# Returns Policy Rewrite — Tapstitch Structure, Halved Timeframes

## Source
Pulled from Tapstitch's official "Returns & Refund Policy" (help-center, updated May 27, 2026). Their structure and language will be adapted; every time window cut roughly in half.

## Timeframe mapping (Tapstitch → Line of Judah)

| Tapstitch | Ours |
|---|---|
| 180 days to request return/refund after delivery | **90 days** |
| 7 days to submit misprint/damage/defect/lost claims | **3 days** |
| 7 business days to review/process requests | **3 business days** |
| Lost-package claim within 7 days of est. delivery | **3 days** |

Order-cancellation window ("In Review" status only) and "customer pays return shipping / no FTC" rules are kept as-is — they already match our no-prepaid policy.

## Sections to include (mirrors Tapstitch)

1. **Contact Us** — direct to our existing support email; include order #, photos/video, brief description.
2. **Return & Refund Request Timeframe** — 90 days after delivery; misprint/damaged/defective/lost claims ideally within 3 days of delivery.
3. **Return Process** — approval required before shipping back; unauthorized returns refused; reviewed within 3 business days.
4. **Conditions for Returned Items** — unused / unworn / unwashed / original condition. Rejected if worn, stained, misuse-damaged, altered. Customer pays return shipping; no Freight-To-Collect.
5. **Refunds** — original payment method, original currency (CAD).
6. **Non-Returnable Items** — hygiene items (underwear, socks, swimsuits, masks), samples, deliberately damaged, items past the 90-day window, custom/customer-spec'd pieces deemed unwanted later, orders delayed by incorrect customer-provided info.
7. **Order Cancellation** — only while order is in "In Review" status (pre-production); contact support ASAP.
8. **Lost Packages** — submit claim within 3 days of estimated delivery date.

## Files to change

- **`src/pages/ReturnsExchanges.tsx`** — replace the page body sections (hero pills, step flow, FAQ-style cards, ActionCTA copy) with the 8 sections above. Keep existing layout primitives (`ServicePageLayout`, `ServiceSection`, `InfoCard`, `StepFlow`, `ActionCTA`) and brand voice (David Ogilvy + spiritual warfare; no "comfort/soft" language). Currency stays CAD. No prepaid label anywhere.
- **`src/pages/FAQ.tsx`** — sync the `ret-1`, `ret-2`, `ret-3` answers so the FAQ matches: 90-day window, 3-day defect-claim window, customer-paid return shipping, 3 business-day review.
- **`src/components/product/ShippingReturnsAccordion.tsx`** — update the one-liner from "30-day returns — return shipping covered by customer" to "**90-day returns** — return shipping covered by customer".
- **`src/components/header/StatusBar.tsx`** — change "30-day returns" pill to "**90-day returns**".

## Out of scope

- No DB migrations, no edge function changes, no email template edits (transactional emails don't quote a window).
- No layout/visual restructure of the Returns page — copy swap inside existing components only.
- No changes to liability-acknowledgement flow or CAD currency wiring.
