# WORN IN THE WILD — Implementation Plan

Single high-leverage UGC engine: 5 days after delivery, customer gets one email asking for a photo wearing their piece. Submissions feed a moderated gallery and unlock a one-time 15% thank-you code.

I'm reusing existing infrastructure (Resend email system, `product_ugc` + `community_stories` tables, `discount_codes`, `product-images` storage pattern, `/ops-portal/` admin). No new email infra needed — the existing `send-order-confirmation` Resend wiring is the template.

---

## Phase 1 — Foundation (DB + Trigger + Email)

### 1.1 Database migration
New table `worn_in_the_wild_submissions` (purpose-built — `product_ugc` is too thin, lacks order linkage, reward tracking, EXIF/moderation metadata):

```
- id, order_id, customer_email, customer_first_name
- photo_path (private storage), caption (140 char), city
- status: pending | approved | featured | rejected
- product_ids[] (auto-tagged from order)
- reward_code_id (FK to discount_codes)
- invited_at, submitted_at, reviewed_at, reviewed_by
- consent_granted_at
```

New table `worn_in_the_wild_invites` (one row per order, tracks email send + funnel):
```
- order_id (unique), customer_email, upload_token (signed JWT hash)
- token_expires_at (30d), invited_at, opened_at, clicked_at, submitted_at
```

New storage bucket `worn-in-the-wild` (private, signed URLs until approval; service-role write).

RLS: service-role write everywhere; admin SELECT all; public SELECT on `worn_in_the_wild_submissions` only where `status IN ('approved','featured')`.

### 1.2 Cron + invite edge function
- `process-worn-in-the-wild-invites` — runs hourly via pg_cron
- Query: `orders WHERE delivered_at + interval '5 days' <= now() AND status='delivered' AND NOT EXISTS (invite row)`
- Fallback: if `delivered_at` is null but `shipped_at + 9 days` elapsed, use that
- Suppression: refunded orders, open disputes, customer opted out
- Generates signed JWT (HS256, 30d TTL, payload: `{order_id, email}`), stores hash
- Invokes existing Resend send pipeline with `worn-in-the-wild-invite` template

### 1.3 Email template
`worn-in-the-wild-invite` React Email component:
- Subject: "Show us how you wear it."
- Hero: largest order item image, color (not grayscale)
- Editorial headline: "Worn in the wild." + Forest Green hairline
- Ogilvy body copy (5 days, gym/church/street, "armor", "for the people it was made for")
- CTA button: "Send Your Photo" → `/worn-in-the-wild/upload?token=<jwt>`
- Trust micro-copy (consent, no third-party, revocable)
- Exodus 28:2 footer ("for glory and for beauty")
- NO mention of discount (surprise = the gift)

---

## Phase 2 — Upload Flow

### 2.1 Public upload page `/worn-in-the-wild/upload`
- Token validation via new edge function `validate-worn-token` (GET)
- States: valid+unused → upload UI | submitted → thank-you | expired → graceful fallback to `@lineofjudah` | invalid → 404
- 3-step UI:
  1. **Upload**: drag-drop (desktop) / `capture="environment"` button (mobile). Accept jpg/png/heic/webp, max 10MB. Client-side resize to 2400px wide + 85% JPEG compress before upload.
  2. **Caption** (optional, 140 char, "Where were you when you wore it?")
  3. **Consent + Submit** (pre-checked checkbox, Forest Green CTA)
- Forest Green progress bar, no spinner; 800ms tick on success
- Sharp edges, brand-locked, mobile-first

### 2.2 Submit edge function `submit-worn-photo`
- Zod validation, JWT verification, rate-limit (5/hr/email)
- Magic-byte file type check (not just extension)
- Strip EXIF metadata (privacy — no GPS leak) via `exifr` or `sharp`
- Upload to `worn-in-the-wild/{order_id}/{uuid}.jpg`
- Insert `worn_in_the_wild_submissions` row with status=pending, auto-tag products from order
- Generate one-time discount code: `WORN-<6-char>`, 15% off, 60d expiry, single-use, bound to email (insert into `discount_codes` + link via reward_code_id)
- Return reward code to client for immediate reveal

### 2.3 Reward reveal screen
- Editorial "Thank you." headline
- Reveal code card with copy button (Silver Chrome hairline)
- "Use it now →" link to `/shop?promo=<code>` (auto-applies)
- Trigger `worn-in-the-wild-thank-you` email with code for safekeeping

---

## Phase 3 — Gallery + Admin

### 3.1 Public gallery `/worn-in-the-wild`
- Editorial hero "WORN IN THE WILD" + Exodus 28:2 sub-line
- Masonry: featured = 2-col span, standard = 1-col, mobile = single full-bleed column
- Tile: photo + first name + city + product name (linked to PDP)
- Lightbox on tap → "Shop this look" → linked products
- Grayscale above md: per brand standard
- Lazy load (intersection observer), 20-tile pagination
- Added to footer "Community" + About dropdown nav

### 3.2 PDP integration
- Add "Recently worn" 3-up strip on PDPs (filters `worn_in_the_wild_submissions` where product_ids contains current product, status approved/featured, limit 3)
- Hidden if <3 approved submissions exist for that product

### 3.3 Admin queue `/ops-portal/worn-in-the-wild`
- Table sorted by status=pending DESC, submitted_at DESC
- Row click → modal with full photo + order link + caption
- Actions: Approve / Approve + Feature / Reject (soft-delete, 30d TTL) / Tag products
- Bulk approve
- Filters: status, date range, tagged product
- Analytics card: total subs, approval %, gallery→PDP CTR, attributed revenue
- Never notify customer of rejection (silent)

### 3.4 Privacy opt-out
- Add toggle to `/account` (or `/account/privacy` if exists): "Don't ask me for photos" → adds email to suppression check

---

## Out of Scope (v1)
Video submissions, IG hashtag auto-import, multi-photo per submission, public submission counters, leaderboards, auto-DM, customer-facing rejection emails.

---

## Open Questions
1. **Reward %**: Confirmed 15% off (60d expiry, single-use)? Or different value?
2. **Email send time**: Send at 10am Toronto local always, or customer's order-time timezone?
3. **Gallery default sort**: Featured first → newest, or pure chronological?
4. **PDP "Recently worn" strip**: Show on every PDP that has ≥3 submissions, or admin-toggleable per product?

I'll proceed with 15% / 10am Toronto / featured-first / show automatically when ≥3 unless you say otherwise.

---

## Technical Notes
- Reuses existing Resend pipeline (no Lovable Email setup needed — `send-order-confirmation` is the pattern)
- Reuses `discount_codes` infra for reward generation
- Reuses `product-images` storage bucket pattern for `worn-in-the-wild` bucket
- All edge functions: zod, CORS, JWT verify, rate limit
- All new tables: explicit GRANTs + RLS + service-role for cron/edge writes
- Cron via existing pg_cron + pg_net pattern (already enabled)
- Brand-locked throughout: Forest Green #4CAF50, Silver Chrome, sharp edges, editorialEase, CAD, Summer 2026, Ogilvy voice

Approve to ship Phase 1 first, then 2, then 3 in sequence.
