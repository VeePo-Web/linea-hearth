
CREATE TABLE public.upsell_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid,
  anchor_product_id uuid,
  look_id uuid,
  event_type text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal_cents integer NOT NULL DEFAULT 0,
  discount_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.upsell_events TO anon;
GRANT INSERT ON public.upsell_events TO authenticated;
GRANT ALL ON public.upsell_events TO service_role;

ALTER TABLE public.upsell_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log upsell events"
  ON public.upsell_events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read upsell events"
  ON public.upsell_events
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_upsell_events_anchor_created
  ON public.upsell_events (anchor_product_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_upsell_events_look_type
  ON public.upsell_events (look_id, event_type);

CREATE INDEX IF NOT EXISTS idx_bundle_discounts_source_active
  ON public.bundle_discounts (source_type, source_id, is_active);
