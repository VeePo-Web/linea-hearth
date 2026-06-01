## Launch Readiness Plan — Line of Judah

Based on the prior audit, the security migration is done. Three categories remain before public launch. Each is broken into a concrete, approve-then-implement workstream.

---

### Workstream 1 — Purchasable Inventory (P0 BLOCKER)

**Problem:** 16 active products, 0 `product_variants` rows, 0 stock. Every add-to-cart fails. No revenue possible.

**Plan:**
1. Pull current 16 products + their intended size/color matrix from the ops portal product list.
2. Seed `product_variants` per product:
   - Apparel (tees/hoodies/crewnecks): sizes XS, S, M, L, XL, XXL × each color
   - Hats: One Size (or S/M, L/XL if structured)
   - Bottoms: 28–38 waist
3. Default stock: 25 units per variant (adjustable).
4. SKU format: `LOJ-{productSlug}-{color}-{size}` uppercased.
5. `price_adjustment` = 0 unless XXL upcharge ($5) is required.
6. Backfill via one idempotent migration (INSERT … ON CONFLICT DO NOTHING on a `(product_id, size, color)` unique index — add the index if missing).

**Decision needed from you:**
- Which size matrix per category? (default above OK?)
- Initial stock level per variant? (default 25 OK?)
- XXL upcharge yes/no?

---

### Workstream 2 — Domain & SEO Truth (P0 BLOCKER)

**Problem:** `public/sitemap.xml`, `public/robots.txt`, and JSON-LD reference `https://lineofjudah.clothing/...` but no custom domain is attached. Google will index 404s.

**Two paths — pick one:**

**Path A — Attach the real domain (recommended):**
1. You attach `lineofjudah.clothing` in Project Settings → Domains.
2. I verify SSL is live.
3. Re-run sitemap generator (no code change needed if BASE_URL already matches).
4. Trigger SEO rescan.

**Path B — Launch on the lovable.app subdomain:**
1. Rewrite `BASE_URL` in `scripts/generate-sitemap.ts` to `https://lineofjudah-clothing.lovable.app`.
2. Update `public/robots.txt` `Sitemap:` directive.
3. Update canonical/og:url in `index.html` and any hardcoded `lineofjudah.clothing` references in JSON-LD / share metadata.
4. Regenerate sitemap, re-run SEO scan.

---

### Workstream 3 — Social Proof & Launch Polish (P1)

**Problem:** Review widgets render empty. No trust signals on PDPs.

**Plan:**
1. **Reviews seed:** Insert 8–12 approved reviews across the top 6 products (4–5 star mix, real-sounding names + Canadian cities, mission-aligned copy in your Ogilvy + Spiritual Warfare voice). No fake claims — generic fit/quality/shipping praise only.
2. **Empty-state fallback:** In review components, when `count === 0`, hide the "0 reviews" badge instead of showing it.
3. **Community stories:** Same treatment — seed 2–3 approved stories OR hide section when empty.

**Decision needed from you:**
- OK to seed reviews, or do you want to wait for real customer reviews post-launch and just hide empty states? (I recommend hide empty states — seeding fake reviews is a legal/ethical risk under FTC + Canadian Competition Bureau rules.)

---

### Workstream 4 — Linter Cleanup (P2, do before announcing)

From the prior audit's linter pass:
1. Drop or recreate `SECURITY DEFINER` views without that property (linter flags them).
2. Replace `WITH CHECK (true)` on 5 INSERT policies where a tighter scope exists (e.g. `community_stories` — restrict by `customer_email IS NOT NULL`; `upsell_events` — restrict by `session_id IS NOT NULL`).
3. Restrict EXECUTE on public-facing `SECURITY DEFINER` functions to `authenticated` only where the RPC is auth-only (e.g. `has_role`).
4. Storage: turn off directory listing on `product-images` bucket OR confirm public listing is intentional.

---

### Workstream 5 — Pre-Launch Smoke Test (final gate)

After 1–4 ship, run a live end-to-end:
1. Browse → PDP → add variant → cart → checkout (Stripe live) with a real $1 test product.
2. Verify order email, admin notification, abandoned-cart suppression, and (after fulfillment) the 9-day review email cron.
3. Verify unsubscribe link works.
4. Verify `robots.txt` + `sitemap.xml` resolve on the production domain.
5. Lighthouse pass: target 90+ on Performance, 100 on SEO.

---

### Order of operations

```
Day 0  →  W1 (variants/stock)  +  W2 (domain) in parallel
Day 0  →  W3 (empty-state hide) — 10 min change
Day 1  →  W4 (linter cleanup)
Day 1  →  W5 (smoke test)  →  LAUNCH
```

### Three decisions I need before I can start

1. **Variants:** default size matrix + 25 stock per variant — OK?
2. **Domain:** Path A (attach `lineofjudah.clothing`) or Path B (launch on lovable.app subdomain)?
3. **Reviews:** seed fake-but-generic reviews, or hide empty states only? (Strong recommendation: hide.)

Reply with your answers and I'll move to build mode and execute in the order above.