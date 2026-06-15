
# Audit + Simplify Liability Acknowledgements

## Audit findings (3 gaps, 1 UX issue)

### Gap 1 — Race between `handle_new_user` trigger and client `.update()`
`useAuth.signUp` calls Supabase auth, then immediately does
`profiles.update({ terms_accepted_at, account_security_ack_at }).eq('id', userId)`.
The trigger `public.handle_new_user` is what actually creates the `profiles` row from
`raw_user_meta_data`. If the trigger hasn't fired yet when the client `UPDATE` runs,
the update silently matches 0 rows and the acknowledgement timestamps are lost from
`profiles` (they survive on `auth.users.raw_user_meta_data` only, which is harder to
audit).

**Fix:** update `handle_new_user` to read `terms_accepted_at` and
`account_security_ack_at` out of `NEW.raw_user_meta_data` and write them on INSERT.
Keep the client `.update()` as a belt-and-suspenders backup for the
unconfirmed-email-then-confirms case (still useful, no behavioural change).

### Gap 2 — Google OAuth signups bypass the boxes entirely
`GoogleAuthButton` triggers OAuth immediately. There is no gating, so a user can
create an account via Google without ever ticking the boxes — defeating the audit
trail.

**Fix:**
- In `CreateAccountForm` and `PostPurchaseSignup`, pass `disabled={!acksOk}` to
  `GoogleAuthButton`. Show a one-line hint above it ("Check the boxes below to
  continue with Google.") when disabled.
- When the user does proceed via Google after checking boxes, stash the two
  timestamps in `sessionStorage` under `loj:pending-acks` before
  `signInWithOAuth`, and on the next auth state change in `useAuth` (when
  `session?.user` first appears) drain that key and `UPSERT` the timestamps
  onto `profiles`. This keeps Google signups recorded.

### Gap 3 — `payment_ack_at` only written at session create, not on Stripe webhook
Order is created with `payment_ack_at` in `create-checkout-session`. The Stripe
webhook later updates the order on payment success. Confirm the webhook UPDATE
does not null/overwrite `payment_ack_at`. (Likely safe — webhook does targeted
field updates — but worth a one-line check; no code change unless we find it
clobbered.)

### UX issue — boxes show dense legal paragraphs inline
The user's directive: "make it insanely simple — nothing more than they just click
a box, and they can click read more to read more."

Current rows render the full legal sentence inline. New design (below) collapses
each row to a 1-line label + a small "Read more" link.

## UX simplification — final design

Each row becomes:

```
[ ] I agree to the account security terms.   Read more
[ ] I agree to the Terms & Privacy Policy.   Read more
```

```
[ ] I agree to the payment & liability terms. Read more
```

- **Checkbox + 1-line label** = the only thing the user must do.
- **"Read more"** is a small underlined chrome-hairline link to the right of the
  label. Clicking it expands the full legal paragraph inline (zero layout shift,
  animated height via Framer Motion, per project animation standards) and the
  link toggles to "Show less".
- Inside the expanded text, "Terms of Service" and "Privacy Policy" are still
  React Router `<Link>`s opening in a new tab.
- No modal/sheet — keeps it native, fast, and accessible on mobile.
- Sharp edges (`rounded-none`), Silver Chrome border, Forest Green check accent —
  consistent with project memory.

## Stress-test checklist (manual + automated)

I'll verify each scenario after the build:

1. **Email signup**: boxes unchecked → submit disabled. Check both → submit
   enabled → after success, `profiles.terms_accepted_at` and
   `account_security_ack_at` are non-null for the new user.
2. **Email signup with email-confirm flow**: same row gets stamped once the user
   confirms (trigger captures from `raw_user_meta_data`).
3. **Google signup, boxes unchecked**: Google button is disabled.
4. **Google signup, boxes checked**: OAuth completes → on auth state change,
   `profiles` row is upserted with both timestamps drained from `sessionStorage`.
5. **Ambassador application**: submit disabled until acks checked → on submit,
   `ambassador_applications.terms_accepted_at` + `account_security_ack_at`
   populated.
6. **Checkout payment ack**: "Pay with Stripe" disabled until checked → on
   click, `orders.payment_ack_at` populated.
7. **Post-purchase signup**: same gating as email signup.
8. **Read more toggle**: expands and collapses correctly; keyboard accessible
   (Enter / Space on the link).
9. **DB spot-checks via `supabase--read_query`** after a test submission of each
   flow to confirm the columns actually hold timestamps.

## Files to change

- `src/components/legal/LiabilityAcknowledgements.tsx` — collapse to 1-line label
  + "Read more" inline expand; introduce `shortLabel` and `fullLabel` per row.
- `src/components/auth/CreateAccountForm.tsx` — pass `disabled={!acksOk}` to
  `GoogleAuthButton`; add helper hint when disabled; stash pending acks in
  `sessionStorage` before any Google path.
- `src/components/checkout/PostPurchaseSignup.tsx` — same Google gating pattern.
- `src/hooks/useAuth.tsx` — on auth state change, if `sessionStorage` has
  `loj:pending-acks`, upsert onto `profiles` and clear the key. Keep existing
  post-`signUp` `.update()` as backup.
- `supabase/functions/.../` — no edge function changes needed (already records
  `payment_ack_at`).
- **Migration**: update `public.handle_new_user()` to read
  `terms_accepted_at` / `account_security_ack_at` out of
  `NEW.raw_user_meta_data` and INSERT them with the new profile.

## Out of scope

- No new tables, no new RLS, no new GRANTs (columns already added in prior
  migration, profiles RLS already correct).
- No rewriting of the actual legal copy at `/terms-of-service` and
  `/privacy-policy`.
- No admin UI to view acceptance timestamps (data is in DB; can be added later).
