## Real upload progress + locked submit button

Scope: `src/pages/WornInTheWildUpload.tsx` only. No backend changes.

### Current state

- Submit button already disables while `isSubmitting` (good).
- "Progress" today is a fake 3-step indicator (`prepare` → `upload` → `finalize`) that jumps 33% → 66% → 100% based on which `setState` fired last. The `upload` step shows 66% for the entire network transfer, regardless of how large the photo is or how slow the connection is. On a 10MB upload over 3G this looks frozen.
- `fetch` is used for the POST, which cannot report upload progress.

### What changes

**1. Swap `fetch` → `XMLHttpRequest` for the submit POST**
Only for `submit-worn-photo`. `XHR.upload.onprogress` is the only browser API that fires real byte-level upload progress. Wrap it in a small `uploadWithProgress(url, form, headers, onProgress)` helper that returns `Promise<{ status: number; body: any }>`. Keeps the call site clean.

**2. Extend submit state with a real percentage**
- Change `State` `submitting` variant to: `{ kind: "submitting"; step: SubmitStep; uploadPct: number; ... }`.
- `uploadPct` is 0 during `prepare`, the live XHR percentage during `upload`, and 100 during `finalize`.
- The existing overall `progressPct` computation (step-based) is replaced with a blended value:
  - `prepare` → 10%
  - `upload` → 10 + uploadPct × 0.8 (so 10 → 90% over the real upload)
  - `finalize` → 95%
  - `done` → 100%
- This means the bar actually moves in lockstep with bytes sent, not in three discrete jumps.

**3. Progress UI polish (still editorial / sharp-edged, #4CAF50)**
- Keep the existing block (border + bg-[#4CAF50]/5, sharp corners).
- Header line shows `Sending your photo` + `{progressPct}%` tabular-nums on the right (already there) — now driven by real %.
- Underneath the bar, when in `upload` step also show a small `{uploadedKB} / {totalKB} KB` line in 10px uppercase tracking. Hidden in `prepare` / `finalize` (those have no bytes context).
- Bar transition tightens from `0.4s` to `0.15s linear` so it tracks the XHR ticks smoothly instead of easing past them.
- Step list (`Preparing photo` / `Uploading` / `Finishing up`) stays — it gives semantic context the raw % doesn't convey.

**4. Submit button — explicit lock**
- Already disables on `isSubmitting`. Add: also disable while `isConverting` (HEIC), while `!file`, while `!consent`, and during the brief network roundtrip.
- Button label cycles with step:
  - `prepare` → `Preparing…`
  - `upload` → `Uploading {pct}%`
  - `finalize` → `Finishing up…`
  - default → `Submit`
- Add `aria-busy={isSubmitting}` and keep `aria-live="polite"` on the progress block so screen readers announce step changes (already there for the block).

**5. Prevent double-submit / change-during-upload**
- The "Change" overlay on the preview image (top-right) gets `disabled` and `pointer-events-none` while `isSubmitting` so users can't swap the file mid-upload.
- The hidden file input is left alone; nothing can reach it while the button is disabled.

**6. Safety net for XHR errors**
- `xhr.onerror` / `xhr.ontimeout` → reject with a synthetic `upload_failed` so the existing `friendlyError` switch handles it. Set a 60s timeout.
- On error: reset to `ready` state, surface friendly message, keep the file in state so the user can retry without re-picking.

### Out of scope

- No new `resizeAndStrip` work — it's already fast (canvas re-encode) and runs in `prepare`. We don't need progress for it.
- No backend / edge function changes. Server still receives the same multipart payload.
- No change to validation, HEIC conversion, or token validation flows.

### Files touched

- `src/pages/WornInTheWildUpload.tsx`
