## Goal

1. Remove every visible phone number from the site.
2. Make every user-facing email link point to `1.lineofjudah.1@gmail.com` (the Line of Judah Gmail).

## Phone numbers to remove

All instances of `+1 (212) 555-0123` and their `tel:` links:

- `src/pages/Contact.tsx` — remove the phone entry from contact methods (lines 36-44) and the "Talk to a human" sidebar phone entry (line 372). Keep the email/contact form.
- `src/pages/PrivacyPolicy.tsx:148` — delete the "Phone:" line.
- `src/pages/Accessibility.tsx:311` — remove the phone entry from the contact list.
- `src/components/service/ServiceSidebar.tsx:80-95` — remove the phone call button, keep the email button.

## Emails to redirect

Replace every user-facing email address and `mailto:` link with `1.lineofjudah.1@gmail.com`. Display text is also updated so customers see the gmail.

Files touched:
- `src/config/brand.ts` (support / legal / press)
- `src/pages/Contact.tsx` (header card + all department cards: orders, returns, fit, accessibility, press + FAQ answer)
- `src/pages/PrivacyPolicy.tsx`, `src/pages/TermsOfService.tsx`, `src/pages/ReturnsExchanges.tsx`, `src/pages/ShippingInfo.tsx`, `src/pages/FAQ.tsx`, `src/pages/Accessibility.tsx`, `src/pages/about/SizeGuide.tsx`
- `src/components/footer/Footer.tsx`
- `src/components/legal/LegalSidebar.tsx`, `src/components/legal/LegalPageLayout.tsx`
- `src/components/service/ServiceSidebar.tsx`
- `src/components/header/MobileMenu.tsx`
- `src/components/faq/AskUsModal.tsx`
- `src/components/shipping/ShippingFAQ.tsx`
- `src/components/product/ShippingReturnsAccordion.tsx`

Input field placeholders like `your@email.com` are left alone (they are visual hints, not links).

## Not changed (and why)

Transactional email **sender addresses** in edge functions (`from: "Line of Judah <noreply@lineofjudah.com>"`, `orders@lineofjudah.com`, `unsubscribe@lineofjudah.com`, the `List-Unsubscribe` mailto) stay as-is. Gmail addresses cannot be used as a `from:` sender through Resend — the domain `lineofjudah.com` is what's verified for sending. Changing those would break order confirmations, abandoned-cart emails, and review requests.

If you also want **outgoing emails** to come from the Gmail address, that's a separate change that requires switching the email provider/setup, and I'll flag it after this is done.