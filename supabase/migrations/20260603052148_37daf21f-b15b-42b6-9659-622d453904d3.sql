
-- 1. Re-revoke sensitive columns (idempotent)
REVOKE SELECT (customer_email) ON public.community_stories FROM anon, authenticated;
REVOKE SELECT (customer_email, customer_first_name) ON public.worn_in_the_wild_submissions FROM anon, authenticated;

-- 2. Abandoned carts: revoke read access on recovery_token and email so anon INSERT cannot read them back
REVOKE SELECT (recovery_token, email) ON public.abandoned_carts FROM anon, authenticated;

-- 3. Tighten user_behavior_signals UPDATE: remove anonymous session-only path (route through edge fn instead)
DROP POLICY IF EXISTS "Users can update their own behavior signals" ON public.user_behavior_signals;
CREATE POLICY "Users can update their own behavior signals"
ON public.user_behavior_signals
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. Lock down SECURITY DEFINER functions: revoke EXECUTE from public/anon/authenticated where not needed
-- Trigger-only functions (never called directly via API)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_owner_admin() FROM PUBLIC, anon, authenticated;

-- has_role is used internally by RLS policies (runs as definer regardless); revoke from anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;

-- admin_list_worn_submissions: only authenticated admins (function self-checks role)
REVOKE EXECUTE ON FUNCTION public.admin_list_worn_submissions() FROM PUBLIC, anon;

-- get_shared_outfit: intentionally callable by anon for public share links; leave EXECUTE to anon, authenticated
-- (no change)
