
## Goal
Two things, done across all 6 customer emails:
1. Add the Line of Judah favicon (lion mark) inline beside the "LINE OF JUDAH" wordmark in every email header.
2. Audit the templates and make recipients feel genuinely welcomed — warmer, more human, more on-brand.

## Where the changes happen
All HTML lives inline in these edge functions:
- `supabase/functions/send-order-confirmation/index.ts`
- `supabase/functions/process-worn-in-the-wild-invites/index.ts`
- `supabase/functions/process-abandoned-carts/index.ts` (3 stages: 1h / 24h / 72h)
- `supabase/functions/process-review-requests/index.ts`
- `supabase/functions/test-all-emails/index.ts` (mirror the production renderers)

## Step 1 — Favicon beside the wordmark

Email clients block local files, so the mark needs a public URL. Use the already-deployed favicon on the live site:

```
https://lineofjudah.clothing/favicon-180.png
```

Replace the current header in every template:

```html
<!-- before -->
<p style="...">LINE OF JUDAH</p>
<div style="width:60px;height:2px;background:#F59E0B;..."></div>

<!-- after -->
<table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>
  <td style="vertical-align:middle;padding-right:10px;">
    <img src="https://lineofjudah.clothing/favicon-180.png"
         width="22" height="22" alt=""
         style="display:block;border:0;border-radius:4px;" />
  </td>
  <td style="vertical-align:middle;">
    <p style="margin:0;font-size:14px;font-weight:700;letter-spacing:3px;color:#1C1917;text-transform:uppercase;">LINE OF JUDAH</p>
  </td>
</tr></table>
<div style="width:60px;height:1px;background:#C5C7CA;margin:14px auto 0;opacity:0.7;"></div>
```

Notes:
- 22×22 px keeps it optical-aligned with the wordmark cap height.
- Inline `<table>` is the only reliable way to put image + text on one row in Outlook.
- Empty `alt=""` so screen readers don't double-announce the brand.
- Hairline divider switches from amber `#F59E0B` to silver chrome `#C5C7CA` — matches the brand memory ("Silver Chrome & Forest Green, strictly NO yellow/gold").

## Step 2 — Audit findings + fixes

Reviewing what currently goes out, the biggest gaps:

| Issue | Where | Fix |
|---|---|---|
| Amber/gold accents conflict with brand palette | All 6 templates (dividers, CTA buttons) | Switch dividers to silver `#C5C7CA`; CTAs to Forest Green `#4CAF50` |
| Rounded `border-radius:8px` cards conflict with sharp-edge system | Order confirmation, review request | Drop to `border-radius:0` to match the editorial aesthetic |
| Tone is mostly transactional, not warm | All except order confirmation | Add one human "we see you" line per email (see copy table below) |
| No personal greeting in 3 of 6 emails | Abandoned carts #2 & #3, review request | Prepend `Hey ${firstName || 'friend'},` |
| Order confirmation thanks customer once; doesn't celebrate them | Order confirmation | Add a "What this means" mini-section: "Your purchase keeps independent craft alive. Thank you." |
| Worn-in-the-Wild invite reads like a survey ask | invite email | Reframe as an invitation to an archive: "We're building a record of how this armor lives in the real world. We'd love yours in it." |
| Review request offers nothing back | review email | Add: "Reviews from real customers shape what we make next. Thank you for shaping ours." |
| No footer signature | All | Add one-line signoff: `— Parker & the Line of Judah team` |
| Footer missing physical address (CAN-SPAM/CASL) | All | Add small grey line with business address + unsubscribe link (already in abandoned-cart, extend to all) |
| Preheader text generic or missing | Worn-in-the-Wild, review, abandoned #2/#3 | Add purposeful preheader (the grey text inboxes preview) |
| Plain-text fallback missing | All | Add a `text` body alongside `html` in the Resend payload for deliverability + accessibility |

## Step 3 — Copy refinements (per email)

- **Order confirmation** — keep "Your armor is on the way" hero. Soften "Welcome to the tribe" → "Welcome in. You're one of us now." Add closing thank-you block.
- **Worn in the Wild invite** — new hero: "We'd love to see it on you." Subline: "An archive, not a campaign." Reward framed as a thank-you, not a bribe.
- **Abandoned cart #1 (1h)** — "Did the page time out?" Helpful, not nagging. No discount yet.
- **Abandoned cart #2 (24h)** — Social proof: "67 others picked up theirs this week." Still no discount.
- **Abandoned cart #3 (72h)** — The 15% offer. Frame as: "On us, this once." Soft, not desperate.
- **Review request** — "Nine days in. How's it wearing?" Make it about their experience, not our metrics.

## Step 4 — QA

1. Deploy the 5 edge functions.
2. Trigger `test-all-emails` to `parker@veepo.ca`.
3. Verify in inbox: favicon renders next to wordmark in Gmail web, Gmail iOS, Apple Mail, Outlook web.

## Out of scope

- No switch to React Email / Lovable Emails infrastructure (the user explicitly said not to touch payment/Resend setup).
- No domain re-verification (current sender uses verified domain or `onboarding@resend.dev` fallback — unchanged).
- No new images uploaded; reusing the public favicon already on the live site.

Approve and I'll implement all 6 templates in one pass and re-run the test send.
