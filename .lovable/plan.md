## Goal

Rewrite all transactional email copy to feel distinctly **Line of Judah** — Christian streetwear with conviction — and drop the "armor / battle / front line" metaphor entirely. Add the lion favicon as a consistent visual anchor across every email, and tighten the layout/UX so every template feels like the same brand family.

## New voice (replaces armor talk)

- **Anchor**: Lion of Judah (Revelation 5:5), worn faith, set-apart living.
- **Tone**: confident, warm, Ogilvy-direct — "wear what you believe", "faith you can feel", "every thread, a testimony", "called, chosen, clothed".
- **No metaphors of war.** No "armor," "battle," "front line," "into battle."
- **Christian without being preachy** — scripture used sparingly as a footer line, not as a sermon.
- **Signature**: "Walk in it. — Parker & the Line of Judah team"

Suggested replacements (used consistently across all emails):
- "YOUR ARMOR IS ON THE WAY" → **"YOUR ORDER IS ON ITS WAY"** (subhead: "Worn faith, on the way to you.")
- "WHAT YOU'RE WEARING INTO BATTLE" → **"WHAT YOU'LL BE WEARING"**
- "ETA TO THE FRONT LINE" → **"ESTIMATED ARRIVAL"**
- "Your armor is waiting" (abandoned cart) → **"You left something behind"** / preview: "Faith looks good on you."
- "How did your armor serve you?" (review) → **"How does it wear?"**
- "This isn't just clothing. It's armor." → **"More than clothing. A statement of faith."**
- Worn-in-the-wild invite armor line → "We're building an archive of how this collection is worn in real life — by the people it was made for."

## Lion favicon in every email

- Use `https://lineofjudah.clothing/favicon-180.png` (already public) as the header lock-up icon in every template, paired with the "LINE OF JUDAH" wordmark, 22×22 with 10px right padding, sitting on a thin chrome hairline divider underneath. Currently only the customer order confirmation has it — abandoned cart, review request, worn-in-the-wild invite, and admin notification will all get the same header.

## UX / format polish (applied to every email)

- Single 600px content card on `#FAFAF9` page background, `#FFFFFF` card, sharp corners (no border-radius — matches brand `rounded-none` rule).
- Consistent vertical rhythm: 48px top / 32px gap to H1 / 40px body block / 32–40px section gaps.
- Header lockup: lion favicon + LINE OF JUDAH wordmark + chrome hairline (60px, opacity 0.6).
- H1: 28px / 700 / -0.5px tracking, uppercase.
- Body copy: 16px / 1.6 line-height, `#1C1917` and `#44403C`.
- Primary CTA: solid `#1C1917` button, white text, 14px / 600 / 0.5px tracking, sharp corners, 16×32 padding.
- Closing scripture line in muted italic (`#78716C`), e.g. *"The Lion of the tribe of Judah has triumphed." — Revelation 5:5* — used once per email, in the quote slot.
- Footer: dark `#1C1917`, lion mark + wordmark, "Walk in it. — Parker & the Line of Judah team", contact link, social row, copyright, Privacy/Terms.
- Preheader text rewritten to match new voice.

## Files to update

All under `supabase/functions/`:

1. `send-order-confirmation/index.ts` — rewrite `buildOrderConfirmationHtml` (customer) and `buildAdminNotificationHtml` (internal). Customer email gets the full polish; admin keeps utilitarian layout but gains the lion favicon header and tone-corrected subject ("New order #X — …" stays, since it's operational).
2. `preview-order-emails/index.ts` — keep in sync with the two builders above (or simply re-render from the updated `send-order-confirmation` builders by importing them, but to avoid a refactor we'll just mirror the copy changes).
3. `process-abandoned-carts/index.ts` — rewrite the cart-recovery template + subject lines. Three nudge stages keep, but copy goes Christian-grounded ("You left something behind" / "Still thinking it over?" / "Last call on your selection").
4. `process-review-requests/index.ts` — new subject "How does it wear?" + matching body.
5. `process-worn-in-the-wild-invites/index.ts` — drop armor line, swap in "worn in real life by the people it was made for" framing.
6. `test-all-emails/index.ts` — update the three preview HTMLs (order confirm, abandoned cart, review request) to match the new copy and header lock-up so the preview tool stays accurate.

## Verification

- Deploy all six functions.
- Trigger `preview-order-emails` once to re-send both confirmation emails to parker@veepo.ca with the new copy.
- Trigger `test-all-emails` to send the abandoned-cart, review-request, and worn-invite previews to parker@veepo.ca.
- Confirm successful Resend IDs returned for each send.

## Memory update

The current Core memory rule says: *"Use 'armor/durable', NEVER 'comfort/soft'."* This explicit user request reverses the "armor" half of that rule for **email copy** (and arguably brand-wide, but we'll scope it narrowly). I'll update `mem://index.md` Core to: *"Use 'durable', NEVER 'comfort/soft' or 'armor/battle' (Christian streetwear voice — faith-forward, not war-metaphor)."*

No other site copy is touched — the user said "on all emails", so I'll leave About / Homepage / PLP armor-language alone unless they ask.
