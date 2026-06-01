CREATE TABLE public.marketing_suppressions (
  email TEXT PRIMARY KEY,
  reason TEXT NOT NULL CHECK (reason IN ('unsubscribe','bounce','complaint','manual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.marketing_suppressions TO authenticated;
GRANT ALL ON public.marketing_suppressions TO service_role;
ALTER TABLE public.marketing_suppressions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view suppressions" ON public.marketing_suppressions
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.marketing_email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID,
  email TEXT NOT NULL,
  email_number SMALLINT NOT NULL CHECK (email_number IN (1,2,3)),
  provider_message_id TEXT,
  status TEXT NOT NULL,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_marketing_email_log_cart ON public.marketing_email_log(cart_id);
CREATE INDEX idx_marketing_email_log_email ON public.marketing_email_log(email);
GRANT SELECT ON public.marketing_email_log TO authenticated;
GRANT ALL ON public.marketing_email_log TO service_role;
ALTER TABLE public.marketing_email_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view marketing email log" ON public.marketing_email_log
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));