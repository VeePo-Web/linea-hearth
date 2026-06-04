**Audit finding**

The checkout failure is a Stripe session creation error, not a missing key problem. The edge function passes an existing Stripe customer plus `automatic_tax: { enabled: true }` and `shipping_address_collection`, but it does not include `customer_update: { shipping: "auto" }`. Stripe rejects that exact combination with:

```text
Automatic tax calculation uses fields saved on the Customer. To collect a shipping address with automatic_tax enabled, set customer_update[shipping] to 'auto'
```

That is why the frontend only shows the generic “Edge Function returned a non-2xx status code” and never reaches embedded Stripe checkout.

**Plan**

1. **Fix the Stripe session parameters**
   - In `supabase/functions/create-checkout-session/index.ts`, add `customer_update: { shipping: "auto", address: "auto" }` when a Stripe customer is attached.
   - Keep Embedded Checkout, `ui_mode: "embedded_page"`, CAD pricing, and automatic tax intact.

2. **Enforce regular shipping everywhere**
   - In the edge function, force checkout shipping to standard only, even if an old client/cart sends `express` or `overnight`.
   - Return only one Stripe shipping option: Standard / Free shipping when eligible.
   - This completes the earlier UI-only change at the backend level too.

3. **Improve checkout error visibility**
   - Return Stripe’s real error message from the edge function when session creation fails.
   - Keep the frontend toast/error path unchanged, but make it receive a clearer backend message instead of the generic non-2xx wording where possible.

4. **Prevent orphaned failed draft orders**
   - If the draft order is created but Stripe session creation fails, mark that order as failed/cancelled instead of leaving it as `pending` with no checkout session.

5. **Stress test after deploying the function**
   - Deploy `create-checkout-session`.
   - Call the deployed edge function directly with a real active hat product payload.
   - Confirm it returns `success: true`, a `clientSecret`, and a Stripe session id.
   - Verify the latest order row has a non-empty `stripe_checkout_session_id`.
   - Check recent edge logs for no new `create-checkout-session error` entries.

6. **Report final result**
   - Tell you whether checkout reaches Stripe successfully and whether any remaining failure is frontend-only, backend-only, or Stripe/account configuration.