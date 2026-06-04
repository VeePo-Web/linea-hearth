# Fix: Stripe `return_url` rejected — checkout still broken

## What I found

Previous `customer_update` fix worked — Stripe no longer rejects on `automatic_tax`. But the latest log shows a **new** Stripe error blocking every checkout:

```
StripeInvalidRequestError: Invalid URL: An explicit scheme (such as https) must be provided.
param: "return_url"
```

The client builds `returnUrl` as:
```ts
`${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
```

In the Lovable preview iframe (and some sandboxed iframes), `window.location.origin` returns the string `"null"`, so the value sent to Stripe becomes `null/checkout/success?...` — no scheme, hence the rejection. Webhooks are fine; the session never gets created, so there is nothing for webhooks to receive.

## Fix

### 1. Harden `returnUrl` on the client (`src/hooks/useStripeCheckout.ts`)
- Detect when `window.location.origin` is falsy or equals `"null"`.
- Fall back to `window.location.href` parsed origin, then to the published domain `https://lineofjudah.clothing`.
- Guarantee the final string starts with `https://`.

### 2. Validate + normalize on the server (`supabase/functions/create-checkout-session/index.ts`)
- Before calling Stripe, run `new URL(body.returnUrl)`; if it throws or scheme is not `http(s)`, rebuild it using:
  1. `req.headers.get("origin")` if absolute, else
  2. hard fallback `https://lineofjudah.clothing/checkout/success?session_id={CHECKOUT_SESSION_ID}`.
- Preserve the `{CHECKOUT_SESSION_ID}` placeholder.
- This is defense-in-depth so stale clients or odd iframes can never break checkout again.

### 3. Surface Stripe's real error
Already returning `error: stripeErr.message` from the catch — verify it's reaching the client so future failures show "Invalid URL…" instead of generic "non-2xx".

### 4. Verify
- Deploy `create-checkout-session`.
- Call it via `curl_edge_functions` with a deliberately bad `returnUrl: "/foo"` → expect `success: true` (normalized) and a `clientSecret`.
- Call it once with a real cart from the preview, confirm `clientSecret` returned and embedded Stripe iframe mounts.
- Check `create-checkout-session` logs for zero new errors.
- Confirm `payments-webhook` is registered and receives events on test card completion (logs currently empty because no session has ever succeeded).

## Files touched
- `src/hooks/useStripeCheckout.ts`
- `supabase/functions/create-checkout-session/index.ts`

No DB migrations, no UI changes, no business-logic changes.