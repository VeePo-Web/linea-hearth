# Public Ops-Portal Access Plan

## Goal
Anyone with the link `lineofjudah.clothing/ops-portal/login` can reach the admin login, but only after passing a shared gate password (`JESUS`). Then they sign in with the provisioned admin account.

## 1. Gate Screen (frontend only)
Create `src/components/admin/OpsPortalGate.tsx`:
- Full-screen minimal screen matching `AdminLogin` aesthetic (Shield icon, tracking-wider uppercase).
- Single password input + "Enter" button.
- On submit: if value === `"JESUS"` (case-insensitive trim), set `sessionStorage.setItem('ops_gate_passed', '1')` and render children.
- Shake/error state on wrong password.
- Note: This is a soft gate (client-side obfuscation), not real security. Real security = Supabase auth + admin role check, which already exists. The gate just hides the existence of the portal from casual visitors.

Wrap all `/ops-portal/*` routes in `App.tsx` with `<OpsPortalGate>`. Mount it ABOVE `ProtectedRoute` so it gates `/ops-portal/login` too.

## 2. Provision Admin Account
Via edge function (one-shot) OR direct SQL migration using Supabase admin API. Cleanest path:

Create edge function `supabase/functions/provision-admin/index.ts` (one-time use, manually invoked):
- Uses `SUPABASE_SERVICE_ROLE_KEY`.
- Calls `supabase.auth.admin.createUser({ email: '1.lineofjudah.1@gmail.com', password: 'jesusislord#1', email_confirm: true })`.
- Inserts row into `user_roles` with `role='admin'`.
- Idempotent: if user exists, just upsert the admin role.
- I will `curl` it once after deploy, then it can stay (protected by service role).

## 3. Files
**Create**
- `src/components/admin/OpsPortalGate.tsx`
- `supabase/functions/provision-admin/index.ts`

**Modify**
- `src/App.tsx` — wrap ops-portal routes with `<OpsPortalGate>`
- `supabase/config.toml` — add `[functions.provision-admin] verify_jwt = false`

## Technical Notes
- Gate persists per browser session (sessionStorage) so they don't re-enter on every nav.
- The login page itself remains unchanged — sign-in still requires the real admin credentials + admin role check.
- Custom domain `lineofjudah.clothing` already routes to the published app, so once you publish, the link `https://lineofjudah.clothing/ops-portal/login` works immediately.

Approve and I'll implement + run the provision function.