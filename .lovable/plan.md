# Order Email & Tapstitch Notification Audit

Domain `lineofjudah.clothing` is now verified in Resend, so the 403s should stop. Three real code gaps remain so you reliably get the order email at both **1.lineofjudah.1@gmail.com** and **parker@veepo.ca** every time, with a paste-ready Tapstitch block.

## Changes

### 1. `supabase/functions/send-order-confirmation/index.ts`
- Make the admin/Tapstitch send **independent** of the customer send. Today, if the customer email fails (bad address, Resend hiccup), the function returns 500 before the admin block runs — so you never hear about the order. New flow: run customer send and admin send in parallel, each in its own try/catch, return 200 if **either** succeeded, include both message IDs (or errors) in the response and console.
- Add a **plain-text Tapstitch paste block** to the admin email inside a `<pre>` so you can one-shot copy it into Tapstitch:
  ```
  Order #ABCD1234 — 2026-06-11
  Ship to:
    Jane Doe
    123 King St W, Apt 5
    Toronto, ON  M5H 1A1
    CA
  Phone: +1 416-555-0123
  Email: jane@example.com
  Items:
    1x  LION TEE — Black / L           SKU: LOJ-LT-BLK-L
    2x  JUDAH HOODIE — Forest / M      SKU: LOJ-JH-FRG-M
  Shipping: Standard — $15.00 CAD
  Total:    $124.00 CAD
  Stripe PI: pi_xxx
  ```
- Accept an optional `notifyAdminOnly: true` flag in the request body so the manual "Resend to ops" button can skip re-emailing the customer.
- Log every attempt to console with order ID + recipient + Resend message ID, so the Edge Function logs are easy to grep.

### 2. `src/pages/admin/AdminOrderDetail.tsx`
- Add a small **"Re-send ops notification"** button in the right-column Status card. Invokes `send-order-confirmation` with `{ orderId, notifyAdminOnly: true }`. Shows toast on success/failure. Useful if a Tapstitch entry was lost or the original email got buried.

### 3. Sanity verification (after deploy, no code)
- Re-run the most recent paid order through the manual resend button.
- Confirm both inboxes receive the email and the Tapstitch block pastes cleanly.
- Spot-check `Edge Function logs → send-order-confirmation` to see both "Customer email sent" and "Admin notification sent" lines.

## Out of scope
- No schema changes.
- No changes to `stripe-webhook` (its trigger path is already correct and idempotent via `confirmation_email_sent_at`).
- No switch away from Resend or sender domain change — staying on `orders@lineofjudah.clothing` now that it's verified.
- No changes to refund/dispute/failure alerts — those already send to both inboxes via `send-admin-alert`.
