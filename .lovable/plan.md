# Launch Readiness Audit

Overall: **Not ready.** Three hard blockers prevent a real purchase or proper indexing, plus four security findings expose customer PII. Payments infra, cron jobs, legal pages, and SEO basics are in place.

---

## P0 — Blockers (must fix before launch)

### 1. No purchasable inventory
- `products`: 16 active, but `product_variants` rows = 0, total stock = 0.
- Every PDP add-to-cart will fail or be hidden. Zero orders exist in `orders`.
- **Fix:** seed variants (size/color/SKU + stock) for all 16 active products via the ops portal, OR temporarily set non-launched SKUs to `draft`.

### 2. Sitemap + canonical points to a domain that isn't live
- `public/sitemap.xml` and `public/robots.txt` reference `https://lineofjudah.clothing/...`.
- Project has no custom domain attached (published URL is `lineofjudah-clothing.lovable.app`). Google will index broken URLs.
- **Fix:** either attach the custom domain in Project → Settings → Domains, or rewrite sitemap/robots/canonical tags to the lovable.app URL until DNS is live.

### 3. Customer email/PII publicly readable
Scanner flagged two tables exposing emails to any unauthenticated visitor:
- `community_stories` — public SELECT exposes `customer_email`.
- `worn_in_the_wild_submissions` — public SELECT exposes `customer_email` + `customer_first_name`.
- **Fix:** drop `customer_email` from the public SELECT policy (split into admin-only columns via view, or restrict policy to non-PII columns).

---

## P1 — High priority (fix before announcing)

### 4. `user_behavior_signals` effectively public
- Policy `(user_id = auth.uid()) OR (session_id IS NOT NULL)` — second clause is always true (column is NOT NULL). Entire browsing-signal table is world-readable.
- **Fix:** tighten policy so anonymous users only read rows matching their current session_id and authenticated users only read their own.

### 5. `saved_outfits` share-link enumeration
- Policy allows reading any row where `share_id IS NOT NULL`. Anyone can dump every shared outfit.
- **Fix:** require the share_id to be supplied as a filter, or fetch via a `SECURITY DEFINER` RPC that takes the token as a parameter.

### 6. Leaked-password protection disabled
- Enable HIBP check via auth settings (`password_hibp_enabled: true`). One toggle.

### 7. Empty social proof
- `reviews` approved = 0, `community_stories` approved = unknown but likely 0.
- Review-request email loop will start filling this after launch, but launch day will show empty review widgets. Either hide review sections when count = 0 or seed initial approved reviews.

---

## P2 — Polish

- **Extensions in `public` schema** (linter warn) — move `pg_cron`/`pg_net` to `extensions` schema or accept as known.
- **`SECURITY DEFINER` view** (linter error) — review the flagged view; switch to `SECURITY INVOKER` unless intentionally definer.
- **Permissive RLS `WITH CHECK (true)` policies** (×5) — audit each (newsletter, ambassador apps, abandoned cart insert, community story insert, upsell events). Most are intentional public-insert paths; document in security memory.
- **Public storage bucket lists files** — `product-images` bucket allows directory listing. Add a tighter storage.objects SELECT policy or accept.
- **Public-execute `SECURITY DEFINER` functions** (×3 anon, ×3 auth) — verify each is meant to be callable (e.g. `has_role` should stay; review the others).

---

## Verified OK

- Stripe go-live: all 5 readiness steps completed. Client auto-selects `live` from `pk_live_` token.
- pg_cron jobs active: abandoned-cart (15m), review-request (6h), worn-invites (hourly).
- RLS enabled on all 31 public tables; admin-only paths use `has_role(...)`.
- Auth: email/password + Google configured; owner admin role protected by trigger.
- Legal pages present: Privacy, Terms, Returns, Shipping, Accessibility, FAQ, Contact.
- Marketing suppression + unsubscribe (HMAC token + List-Unsubscribe headers) wired.
- Stripe webhook converts abandoned carts on payment, halting email sequences.
- Index meta: title + description set; robots.txt allows major crawlers.

---

## Recommended fix order

```text
Day 0 (blockers)
  1. Seed product variants & stock  (ops portal)
  2. Fix sitemap/robots host OR attach custom domain
  3. Migration: drop customer_email from public policies on
     community_stories + worn_in_the_wild_submissions

Day 0 (security)
  4. Migration: tighten user_behavior_signals SELECT policy
  5. Migration: tighten saved_outfits share_id access (RPC)
  6. Enable leaked-password protection

Day 1 (polish)
  7. Seed 6–12 approved reviews OR hide empty review sections
  8. Resolve linter warnings or document in security memory
```

When you're ready, say "go" and I'll start with the security migrations (P0 #3 + P1 #4–6) since they don't need product/content decisions.
