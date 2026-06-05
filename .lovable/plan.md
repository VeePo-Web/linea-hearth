Findings so far:
- Live payments are enabled and the go-live readiness check is complete.
- The latest order for `parker@veepo.ca` is still `pending / unpaid`, with no payment intent saved.
- The app has no recorded Stripe webhook events in `stripe_webhook_events`, so the backend is not receiving or processing the payment confirmation.
- That means this is probably not just the card. If your bank/Stripe shows an actual successful charge, the app is failing to confirm it. If there is no settled charge and only a pending authorization, then the payment likely did not complete.

Plan:
1. Tighten the success-page diagnosis
   - Update the checkout success page so it distinguishes:
     - card/payment not completed,
     - payment completed but backend confirmation delayed,
     - backend reconciliation failed.
   - Stop showing vague “check your email” copy when the database is still unpaid and no confirmation exists.

2. Make reconciliation observable and reliable
   - Add structured logging to `reconcile-session` for session id, environment, Stripe session status, payment status, and order update result.
   - Make the success page surface the reconcile result instead of silently falling back to “Order processing”.
   - Confirm `reconcile-session` is deployed and callable from the live checkout return page.

3. Audit webhook delivery path
   - Verify the deployed webhook function name and URL match the Stripe/Lovable payments webhook configuration.
   - Confirm live webhooks include the environment query and events needed for physical product checkout.
   - Keep the function tolerant enough to record and process valid events, while still rejecting invalid signatures.

4. Add an admin-safe recovery path
   - For paid Stripe sessions stuck as unpaid, allow a safe one-time reconciliation to update the order to `processing / paid`.
   - Preserve idempotency so duplicate webhook/reconcile calls cannot double-confirm or double-send fulfillment emails.

5. Validate with a live/test checkout trace
   - Create a small test checkout flow, complete payment, then verify:
     - order flips to `paid`,
     - payment intent is saved,
     - order items remain attached,
     - confirmation email fires,
     - success page shows the receipt instead of “Order processing”.

Important note:
- Before retrying with another real card, check Stripe dashboard or your bank activity. If there is no successful charge, it may be a card/authentication issue. If there is a successful charge, this is definitely a confirmation bug in the app/backend flow.