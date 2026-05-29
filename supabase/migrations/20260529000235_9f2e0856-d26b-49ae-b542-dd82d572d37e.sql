-- ============================================================
-- WORN IN THE WILD — Schema
-- ============================================================

-- 1) Invites table (one row per order)
CREATE TABLE public.worn_in_the_wild_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE,
  customer_email TEXT NOT NULL,
  upload_token_hash TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_worn_invites_order ON public.worn_in_the_wild_invites(order_id);
CREATE INDEX idx_worn_invites_email ON public.worn_in_the_wild_invites(customer_email);
CREATE INDEX idx_worn_invites_token_hash ON public.worn_in_the_wild_invites(upload_token_hash);

GRANT SELECT, INSERT, UPDATE ON public.worn_in_the_wild_invites TO authenticated;
GRANT ALL ON public.worn_in_the_wild_invites TO service_role;

ALTER TABLE public.worn_in_the_wild_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view invites"
  ON public.worn_in_the_wild_invites FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2) Submissions table
CREATE TABLE public.worn_in_the_wild_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  customer_email TEXT NOT NULL,
  customer_first_name TEXT,
  photo_path TEXT NOT NULL,
  caption TEXT,
  city TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'featured', 'rejected')),
  product_ids UUID[] NOT NULL DEFAULT '{}',
  reward_code_id UUID,
  consent_granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  featured_at TIMESTAMPTZ,
  rejection_reason TEXT,
  soft_deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_worn_subs_status ON public.worn_in_the_wild_submissions(status, submitted_at DESC);
CREATE INDEX idx_worn_subs_order ON public.worn_in_the_wild_submissions(order_id);
CREATE INDEX idx_worn_subs_products ON public.worn_in_the_wild_submissions USING GIN(product_ids);
CREATE INDEX idx_worn_subs_email ON public.worn_in_the_wild_submissions(customer_email);

GRANT SELECT ON public.worn_in_the_wild_submissions TO anon;
GRANT SELECT, INSERT, UPDATE ON public.worn_in_the_wild_submissions TO authenticated;
GRANT ALL ON public.worn_in_the_wild_submissions TO service_role;

ALTER TABLE public.worn_in_the_wild_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved/featured submissions"
  ON public.worn_in_the_wild_submissions FOR SELECT
  USING (
    status IN ('approved', 'featured')
    AND soft_deleted_at IS NULL
  );

CREATE POLICY "Admins can view all submissions"
  ON public.worn_in_the_wild_submissions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update submissions"
  ON public.worn_in_the_wild_submissions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete submissions"
  ON public.worn_in_the_wild_submissions FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Auto-update timestamp
CREATE TRIGGER update_worn_subs_updated_at
  BEFORE UPDATE ON public.worn_in_the_wild_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Privacy opt-out on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS worn_invites_opted_out BOOLEAN NOT NULL DEFAULT false;

-- 4) Storage bucket (private; service-role + admins write; public read of files only via signed URLs OR after publication via app)
INSERT INTO storage.buckets (id, name, public)
VALUES ('worn-in-the-wild', 'worn-in-the-wild', false)
ON CONFLICT (id) DO NOTHING;

-- Service role does everything (edge functions). Admins read everything.
CREATE POLICY "Admins can read worn photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'worn-in-the-wild' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete worn photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'worn-in-the-wild' AND public.has_role(auth.uid(), 'admin'::app_role));

-- 5) Enable cron + net extensions if not enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;