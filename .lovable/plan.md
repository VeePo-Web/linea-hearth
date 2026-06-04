## Goal
Temporarily remove Express and Overnight shipping options from checkout, leaving only Standard.

## Changes

**`src/pages/Checkout.tsx`** (UI only)
- Remove the Express and Overnight `RadioGroup` items (lines ~852-874).
- Keep Standard as the sole, pre-selected option.
- Initial state already defaults to `"standard"` so no logic changes needed.

That's it — the backend (`create-checkout-session`) still understands `"standard"` and will charge the standard rate (or free if threshold met). Express/overnight code paths stay intact server-side for easy re-enable later.

## Out of scope
- No changes to `create-checkout-session` edge function, `useStripeCheckout`, or shipping rate constants.
- No copy changes elsewhere (FAQ, ShippingInfo, etc.) since they describe shipping in general, not the checkout selector.