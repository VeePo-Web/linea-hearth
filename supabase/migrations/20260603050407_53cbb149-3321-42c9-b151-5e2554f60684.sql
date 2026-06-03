
-- 1. community_stories: hide customer_email from anon + authenticated
REVOKE SELECT (customer_email) ON public.community_stories FROM anon, authenticated;

-- 2. worn_in_the_wild_submissions: hide customer_email from public roles, expose via admin RPC
REVOKE SELECT (customer_email) ON public.worn_in_the_wild_submissions FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_worn_submissions()
RETURNS SETOF public.worn_in_the_wild_submissions
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.* FROM public.worn_in_the_wild_submissions s
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
  ORDER BY s.submitted_at DESC;
$$;

REVOKE ALL ON FUNCTION public.admin_list_worn_submissions() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_worn_submissions() TO authenticated;

-- 3. discount_codes: restrict SELECT to admins only (edge functions use service_role)
DROP POLICY IF EXISTS "Anyone can read active codes for validation" ON public.discount_codes;
CREATE POLICY "Admins can read codes"
ON public.discount_codes
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. saved_outfits: prevent INSERT from spoofing another user's user_id
DROP POLICY IF EXISTS "Anyone can save outfits" ON public.saved_outfits;
CREATE POLICY "Users can save outfits for themselves"
ON public.saved_outfits
FOR INSERT
TO anon, authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());
