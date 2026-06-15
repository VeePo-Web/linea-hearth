
# Tri-audit: CAD currency, no-prepaid policy, and liability checkboxes

## Audit results

### 1. CAD currency — CLEAN
- Zero `usd`/`USD` literals anywhere in `src/`, `supabase/`, `public/`, `index.html`.
- Zero stray `€` or `£` symbols in UI.
- Stripe checkout, shipping rates, and dispute handler all use `cad`.
- Email symbol maps render `cad → $`, `usd → US$` (disambiguated).
- Terms of Service copy says "Canadian Dollars (CAD)".

**No changes needed.**

### 2. No prepaid — MOSTLY CLEAN, 3 leftovers to fix
The word "prepaid" is gone, but three sibling promises still pledge free returns — same over-promise risk, different phrasing:

- **`src/components/header/StatusBar.tsx:17`** — top status bar advertises "Free returns within 30 days" sitewide.
- **`src/components/product/ShippingReturnsAccordion.tsx:56`** — PDP accordion says "Free returns on US orders".
- **`src/pages/Contact.tsx:120`** — FAQ answer says "Free return shipping on US orders."

**Fix:** rewrite each to match the new policy (customer covers return shipping; full refund on inspection).
- StatusBar pill → "30-day returns" (drops the "free" claim, keeps the window).
- ShippingReturnsAccordion → "30-day returns — shipping covered by customer".
- Contact FAQ → "30-day satisfaction guarantee on unworn items with original tags attached. Return shipping is the customer's responsibility; we refund the product cost in full once your return arrives and passes inspection. Custom pieces and items marked Final Sale are non-returnable. Exchanges processed within 3-5 business days of receiving your return."

### 3. Liability acknowledgement checkboxes — FULLY WIRED
Verified all four surfaces gate submit + persist timestamps:

| Surface | Component | Gate | DB write |
|---|---|---|---|
| Email signup | `CreateAccountForm` | `!acksOk` disables submit + Google btn | `signUp()` → user_metadata + `profiles` upsert |
| Google OAuth | `CreateAccountForm` → `GoogleAuthButton` | `disabled={!acksOk}` | `sessionStorage` stash → `drainPendingAcks` upsert on auth change |
| Ambassador | `AmbassadorForm` | `disabled={!isSubmitting || !acksOk}` | INSERT into `ambassador_applications` with both timestamps |
| Post-purchase | `PostPurchaseSignup` | `!isPasswordValid \|\| !acksOk` | `signUp()` path same as above |
| Checkout payment | `Checkout` | `!paymentAcksOk` disables Pay btn | `paymentAckAt` → `create-checkout-session` edge fn → `orders.payment_ack_at` |

DB columns confirmed on `profiles`, `ambassador_applications`, `orders`. Trigger `handle_new_user` reads `terms_accepted_at` / `account_security_ack_at` from `raw_user_meta_data` on signup. OAuth bridge via `sessionStorage` key `loj:pending-acks` confirmed.

**No changes needed.**

## Out of scope
- No DB migrations, no edge function redeploys.
- No layout changes (the StatusBar/accordion items just get new text).
- Returns page itself already updated previously — no new edits there.
