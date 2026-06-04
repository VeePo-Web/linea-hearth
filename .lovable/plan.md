## Add client-side validation + HEIC conversion to Worn-in-the-Wild upload

Scope: `src/pages/WornInTheWildUpload.tsx` only. No backend, schema, or storage changes. Server-side validation in `submit-worn-photo` stays as the source of truth — this is defense in depth and a better UX (catch problems before the user waits for the upload).

### What changes

**1. Centralized validation constants**
At the top of the file, define:
- `ALLOWED_MIME = ["image/jpeg","image/png","image/webp"]`
- `ALLOWED_EXT = ["jpg","jpeg","png","webp"]`
- `HEIC_MIME = ["image/heic","image/heif"]`, `HEIC_EXT = ["heic","heif"]`
- `MAX_BYTES = 10 * 1024 * 1024` (already exists)
- `MIN_BYTES = 5 * 1024` (rejects 0-byte / obviously broken picks)

**2. New `validateFile(f)` helper**
Returns `{ ok: true } | { ok: false, code: "unsupported_type" | "file_too_large" | "file_too_small" | "empty_file" }`. Checks, in order:
- `f.size === 0` → `empty_file`
- `f.size > MAX_BYTES` → `file_too_large`
- `f.size < MIN_BYTES` → `file_too_small`
- MIME OR extension must match an allowed image type (HEIC handled separately, not rejected here)
- Anything else → `unsupported_type`

**3. HEIC conversion via `heic2any` (dynamic import)**
- Add dependency: `heic2any` (~50KB, browser-only, no peer deps).
- New `convertHeicToJpeg(file)`: `await import("heic2any")`, convert to JPEG at quality 0.9, wrap the resulting `Blob` back into a `File` named `<basename>.jpg` with `type: "image/jpeg"`. Dynamic import keeps the bundle lean — only loaded when an iPhone user picks HEIC.
- Wrapped in try/catch → surfaces `heic_conversion_failed` friendly error.

**4. New `onPickFile` flow** (replaces current one)
```text
setError(null)
if (!f) return
if (isHeic(f)):
    setState busy "Converting iPhone photo…"  // brief inline status
    f = await convertHeicToJpeg(f)            // may throw → friendly error
end
res = validateFile(f)
if (!res.ok): setError(friendlyError(res.code)); return
setFile(f); setPreview(URL.createObjectURL(f))
```
- Revoke any previous `preview` URL before assigning a new one (small leak fix while we're here).
- Add a lightweight `isConverting` boolean so the upload tile shows "Converting iPhone photo…" with a spinner instead of looking frozen during the (1–3s) HEIC decode.

**5. Friendly error copy additions**
Add to the `friendlyError` switch:
- `file_too_small` → "That photo looks corrupted or empty. Try another."
- `empty_file` → same as above
- `heic_conversion_failed` → "We couldn't convert that iPhone HEIC photo. In iOS Settings → Camera → Formats, switch to 'Most Compatible', then retake — or pick a JPG/PNG."
- Keep existing `heic_unsupported` entry but it becomes unreachable (conversion now handles HEIC) — leave it in as a safety net.

**6. `onSubmit` defense-in-depth**
Re-run `validateFile(file)` at the top of `onSubmit` before `resizeAndStrip`. If the file was somehow mutated or stale, fail fast with the same friendly error instead of letting the server reject it after the upload.

### Out of scope

- No change to `<input accept>` — keeps HEIC selectable on iOS so we can convert it.
- No change to `resizeAndStrip` — it already re-encodes to JPEG and strips EXIF, which now happens after HEIC conversion.
- No server changes — `submit-worn-photo` remains the authoritative MIME/magic-byte gate.

### Files touched

- `src/pages/WornInTheWildUpload.tsx`
- `package.json` (adds `heic2any`)
