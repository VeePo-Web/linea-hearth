## Finish "Worn in the Wild" wiring + deploy

Wrap up the remaining integration so the feature is live end-to-end.

### 1. Routes (src/App.tsx)
Register three routes inside the existing `<Routes>` block:
- `/worn-in-the-wild` → `WornInTheWildGallery` (public)
- `/worn-in-the-wild/upload` → `WornInTheWildUpload` (public, token-gated)
- `/ops-portal/worn-in-the-wild` → `AdminWornInTheWild` (wrapped in `ProtectedRoute` like other admin routes)

Add lazy imports alongside other page imports.

### 2. Admin nav (src/components/admin/AdminLayout.tsx)
Add a `{ href: '/ops-portal/worn-in-the-wild', label: 'Worn', icon: Camera }` entry to `navItems` (import `Camera` from lucide-react). Sits between Lookbook and Discounts.

### 3. Footer link (src/components/footer/Footer.tsx)
Add a single "Worn in the Wild" link under the existing community/about column so customers can discover the public gallery.

### 4. PDP "Recently worn" strip (optional, lightweight)
In `ProductDetail.tsx`, add a small section that queries `worn_in_the_wild_submissions` where `product_ids @> [productId]` AND `status in ('approved','featured')`, limit 3. Hide entirely if `< 3` results. Tap → opens `/worn-in-the-wild` filtered to that product (anchor). Defer if you'd rather keep this PR tight.

### 5. Deploy edge functions
Deploy all 5 in one batch:
- `process-worn-in-the-wild-invites`
- `validate-worn-token`
- `submit-worn-photo`
- `worn-photo-signed-urls`
- `review-worn-submission`

### 6. Verify cron job
Confirm the hourly `process-worn-in-the-wild-invites-hourly` cron created in the earlier migration is registered (query `cron.job`). If missing, re-schedule.

### 7. Smoke test
- Curl `validate-worn-token` with a bad token → expect 401.
- Curl `process-worn-in-the-wild-invites` manually → expect `{ ok: true, candidates: N, sent: 0|N }`.
- Visit `/worn-in-the-wild` → empty-state renders.
- Visit `/ops-portal/worn-in-the-wild` as admin → loads, filter tabs work.

### Open question
Want me to include the PDP "Recently worn" strip (step 4) now, or ship without it and add later once real submissions exist?

### Out of scope
Email send-time tuning, telemetry dashboard, soft-delete cron, privacy policy copy — already noted as Phase 3.
