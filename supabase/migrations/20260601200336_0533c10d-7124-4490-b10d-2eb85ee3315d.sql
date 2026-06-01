-- Hide customer_email from public/auth roles on PII tables (keep service_role + admin via app)
REVOKE SELECT (customer_email) ON public.community_stories FROM anon, authenticated;
REVOKE SELECT (customer_email) ON public.worn_in_the_wild_submissions FROM anon, authenticated;
-- Also revoke is_contactable channel for stories (admin-only)
-- (kept readable for now; first names + insta are user-provided handles, not PII per app design)

-- Tighten user_behavior_signals: drop overly-permissive SELECT, restrict to owner only.
DROP POLICY IF EXISTS "Users can view their own behavior signals" ON public.user_behavior_signals;
CREATE POLICY "Users can view their own behavior signals"
ON public.user_behavior_signals
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Tighten saved_outfits: remove enumeration via share_id; add SECURITY DEFINER RPC for share lookup.
DROP POLICY IF EXISTS "Users can view own or shared outfits" ON public.saved_outfits;
CREATE POLICY "Users can view own outfits"
ON public.saved_outfits
FOR SELECT
TO authenticated, anon
USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.get_shared_outfit(p_share_id text)
RETURNS public.saved_outfits
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.saved_outfits
  WHERE share_id = p_share_id
  LIMIT 1
$$;

REVOKE EXECUTE ON FUNCTION public.get_shared_outfit(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_outfit(text) TO anon, authenticated;