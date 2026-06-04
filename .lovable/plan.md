# Rename Parker → Olliver Abbey

## Site audit
Already correct. `FounderLetter.tsx` displays **Olliver Abbey — Founder & Creative Director**. No other founder/owner copy on the site references Parker. No changes needed in `src/`.

## Email copy changes
Update every visible signature line from `— Parker & the Line of Judah team` (and `Walk in it. — Parker…`) to:

> **Olliver Abbey and the Line of Judah Team**

Files:
- `supabase/functions/send-order-confirmation/index.ts` (customer footer line 371)
- `supabase/functions/preview-order-emails/index.ts` (line 115)
- `supabase/functions/process-abandoned-carts/index.ts` (line 138)
- `supabase/functions/process-review-requests/index.ts` (line 88)
- `supabase/functions/process-worn-in-the-wild-invites/index.ts` (line 91)
- `supabase/functions/test-all-emails/index.ts` — change preview `customer_first_name: "Parker"` to `"Olliver"` (lines 259, 283, 309)

## Functional addresses — kept as-is
`parker@veepo.ca` remains as the **recipient inbox** for admin order notifications and QA previews (`send-order-confirmation` admin CC, `preview-order-emails`, `test-all-emails`, admin role migration). These are routing addresses, never visible in customer email bodies. If you'd rather forward those to a different inbox (e.g. olliver@lineofjudah.clothing), tell me the address and I'll swap it in the same pass.

## Verify
Redeploy the 6 functions, then trigger `preview-order-emails` so the customer + admin confirmations land in your inbox with the new signature.
