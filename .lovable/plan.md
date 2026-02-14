

# Fix: Discount Codes -- EUR to CAD and 2024 to 2026

## Problem Summary

Three locations still reference euros or the wrong year:

### 1. Database Records (discount_codes table)

| Code | Current Name | Fix |
|------|-------------|-----|
| FLAT20 | "€20 Off Orders Over €100" | "$20 Off Orders Over $100" |
| SUMMER2024 | "Summer Sale 25%" | Rename code to `SUMMER2026`, update name to "Summer 2026 Sale 25%" |

These are **data fixes** -- SQL UPDATE statements against the `discount_codes` table.

### 2. Edge Function: `validate-discount-code/index.ts`

Three issues in this file:

- **Line 44**: Error message says `"This code requires a minimum order of €{amount}."` -- change `€` to `$`
- **Line 49**: Function named `formatCentsToEuros` -- rename to `formatCentsToDollars`
- **Line 50**: The function body is fine (just math), but the name is misleading

### Implementation Steps

**Step 1 -- Database migration (SQL)**
```sql
UPDATE discount_codes SET name = '$20 Off Orders Over $100' WHERE code = 'FLAT20';
UPDATE discount_codes SET code = 'SUMMER2026', name = 'Summer 2026 Sale 25%' WHERE code = 'SUMMER2024';
```

**Step 2 -- Update `supabase/functions/validate-discount-code/index.ts`**
- Line 44: Replace `€` with `$` in the MINIMUM_NOT_MET message
- Line 49: Rename `formatCentsToEuros` to `formatCentsToDollars`
- Update the one call site for this function (used in the minimum order error message formatting)

**Step 3 -- Redeploy edge function**
Deploy `validate-discount-code` after code changes.

### Risk Level
- Database: **Low** -- simple name/code updates, no schema changes
- Edge function: **Low** -- string replacements only, no logic changes

### Verification
- Visit `/ops-portal/discounts` and confirm FLAT20 shows "$20 Off Orders Over $100"
- Confirm SUMMER2024 is now SUMMER2026 in the table
- Test a discount code validation to ensure the edge function still works

