
# Liability Acknowledgement Checkboxes — Signup, Ambassador, Checkout

## Goal
Before any user can create an account, submit an ambassador application, or complete a payment, they must tick legally-worded acknowledgement boxes. They don't need to open or read the linked policies — just check the box. Submission is blocked until required boxes are ticked.

## Where boxes appear

1. **User signup** — `src/components/auth/CreateAccountForm.tsx` and `src/components/checkout/PostPurchaseSignup.tsx` (the 1-click post-purchase account create).
2. **Ambassador application** — `src/components/ambassador/AmbassadorForm.tsx`.
3. **Checkout / payment** — `src/pages/Checkout.tsx`, placed directly above the "Place Order / Continue to Payment" CTA (before the Stripe embedded checkout mounts).

## Checkbox copy

Editorial, plain-English, links open Terms / Privacy in a new tab. Two boxes for account flows, one for checkout.

### Account creation (User signup + Post-Purchase Signup)
- [ ] **Account Security Acknowledgement** — I understand I am solely responsible for keeping my login credentials secure. **Line of Judah is not liable for any loss, damage, or unauthorized activity resulting from my account being accessed, compromised, or hacked.** ([Terms](/terms-of-service))
- [ ] **Terms & Privacy** — I agree to the [Terms of Service](/terms-of-service) and [Privacy Policy](/privacy-policy).

### Ambassador application
- [ ] **Account Security Acknowledgement** (same as above)
- [ ] **Ambassador Terms** — I agree to the [Terms of Service](/terms-of-service), [Privacy Policy](/privacy-policy), and understand my application is subject to review and approval.

### Checkout (above payment CTA)
- [ ] **Payment & Liability Acknowledgement** — I understand all payment and card information is processed and stored by **Stripe, Inc.** under its own terms. **Line of Judah does not collect, store, or have access to my card data and is not liable for issues arising from payment processing, fraud, or unauthorized card use.** I agree to the [Terms of Service](/terms-of-service) and [Privacy Policy](/privacy-policy).

## UX rules
- Boxes are required; submit button stays disabled until all are checked (visual + `disabled` attr).
- Use existing shadcn `Checkbox` + `Label` components. Sharp edges (rounded-none per project core rules).
- Forest green check accent, silver chrome hairline border — matches editorial system. No yellow.
- Inline validation: if a user clicks the disabled button area, show a short helper line ("Please confirm the acknowledgements above to continue.") in muted destructive color.
- Mobile-friendly tap target (min 24px box, 44px row).
- Links use `target="_blank" rel="noopener noreferrer"`; `e.stopPropagation()` so clicking the link doesn't toggle the box.

## Implementation (technical)

### New shared component
`src/components/legal/LiabilityAcknowledgements.tsx`
- Props: `variant: "account" | "ambassador" | "checkout"`, `values: Record<string, boolean>`, `onChange(key, checked)`, optional `className`.
- Renders the appropriate set of rows from a single config map (single source of truth for legal copy).
- Exposes `getRequiredKeys(variant)` and `areAllAccepted(variant, values)` helpers for parent forms.

### Form integrations
For each form:
- Add local state `const [acks, setAcks] = useState({ ... })`.
- Render `<LiabilityAcknowledgements variant=... values={acks} onChange={...} />` above the submit button.
- Gate submit: `disabled = submitting || !areAllAccepted(variant, acks)`.
- On submit, double-check server-side gate is unnecessary (these are UI acknowledgements), BUT persist the acceptance for audit (see below).

### Audit trail (lightweight, no new tables)
Stamp acceptance into existing records so we have proof if disputed:
- **User signup** (`signUp` call in `useAuth`): pass `data: { terms_accepted_at: ISO, account_security_ack_at: ISO }` into Supabase auth `options.data` → lands in `auth.users.raw_user_meta_data`. Mirror into `profiles` via the existing upsert (add columns `terms_accepted_at timestamptz`, `account_security_ack_at timestamptz`) in a migration.
- **Ambassador**: add columns `terms_accepted_at`, `account_security_ack_at` to `ambassador_applications`; populate on insert.
- **Checkout**: stamp `payment_ack_at timestamptz` onto `orders` row (created in `create-checkout-session` edge function). Pass the timestamp in the request body; the function writes it during order insert. No Stripe-side change.

### Migration (single file, all three tables)
```
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS account_security_ack_at timestamptz;

ALTER TABLE public.ambassador_applications
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS account_security_ack_at timestamptz;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_ack_at timestamptz;
```
No new tables → no new GRANT/RLS needed.

### Files to edit
- new `src/components/legal/LiabilityAcknowledgements.tsx`
- `src/components/auth/CreateAccountForm.tsx` — wire boxes + gate submit + pass metadata
- `src/components/checkout/PostPurchaseSignup.tsx` — same
- `src/components/ambassador/AmbassadorForm.tsx` — wire boxes + gate submit + insert columns
- `src/pages/Checkout.tsx` — wire single checkout box, gate "Continue to Payment" CTA, pass `payment_ack_at` to `create-checkout-session`
- `src/hooks/useAuth.tsx` — extend `signUp` signature to forward acknowledgement timestamps into `options.data`
- `supabase/functions/create-checkout-session/index.ts` — accept `paymentAckAt` and persist on the order row
- one new migration as above

## Out of scope
- Rewriting the actual Terms of Service / Privacy Policy text (already exists at `/terms-of-service` and `/privacy-policy`).
- Server-side enforcement beyond storing timestamps (these are user-side acknowledgements, not access controls).
- Admin UI to view acceptance timestamps (data is in DB if ever needed).
