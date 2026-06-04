## Worn-in-the-Wild upload — audit

Flow traced end-to-end:
`process-worn-in-the-wild-invites` (signs JWT with `SUPABASE_SERVICE_ROLE_KEY`, HS256) → email link → `/worn-in-the-wild/upload?token=…` → `validate-worn-token` (verifies with same key) → client `resizeAndStrip` (canvas re-encode → JPEG, strips EXIF) → `submit-worn-photo` (size + MIME + magic-byte check → upload to private `worn-in-the-wild` bucket → insert submission + create one-time 15% `WORN-XXXXXX` discount → mark invite submitted) → admin moderates in `/ops-portal/worn-in-the-wild` → `review-worn-submission` copies file to public `product-images` bucket under `worn-in-the-wild/…`.

**Working correctly:**
- JWT sign/verify use the same secret + algorithm ✓
- Server enforces 10MB cap, MIME allow-list, magic-byte sniff, 5/hr rate limit, single-submission per invite ✓
- EXIF stripped via canvas re-encode (server comment acknowledges this) ✓
- `submit-worn-photo` registered in `supabase/config.toml` with `verify_jwt = false` ✓
- Storage uses service-role; bucket stays private until approval ✓
- Reward code uniqueness checked, 60-day expiry ✓

**Issues found:**

1. **HEIC photos silently fail.** Input accepts `image/heic,image/heif` and `capture="environment"` (iPhone default = HEIC), but `resizeAndStrip` decodes with `new Image()`, which Safari/Chrome can't decode for HEIC. The throw is caught and surfaced as a generic "Upload failed. Please check your connection…" — misleading on a working connection.
   - **Fix:** detect HEIC before resize (`file.type` includes `heic`/`heif` or extension match). Show a friendly inline message: "iPhone HEIC photos aren't supported yet — in Camera settings switch Formats to 'Most Compatible', or pick a JPG." Don't even attempt the canvas path.

2. **Wasted/confusing `supabase.functions.invoke` call.** The `useEffect` in `WornInTheWildUpload.tsx` (lines 107–113) invokes `validate-worn-token` with empty body, then immediately does a direct `fetch` for the real call. The first invoke fires a no-token POST that the function logs as invalid. Pure dead code.
   - **Fix:** remove the `supabase.functions.invoke` block; keep only the direct `fetch` GET.

**Not changing (intentional or out of scope):**
- Keeping HEIC in the `<input accept>` so iOS users can still pick the file and see the friendly error rather than have it greyed out — open to flipping if you'd rather hide it entirely.
- `validate-worn-token` GET via direct fetch (rather than `invoke`) — `invoke` doesn't cleanly support GET + query string, so this stays.
- Server's symmetric reuse of `SUPABASE_SERVICE_ROLE_KEY` as JWT HMAC secret — works, but if you want a dedicated `WORN_INVITE_JWT_SECRET` later that's a separate hardening pass.

## Files touched

- `src/pages/WornInTheWildUpload.tsx` — drop dead `invoke`, add HEIC pre-check + friendly copy in `friendlyError` / `onPickFile`.

No backend, schema, or storage changes.
