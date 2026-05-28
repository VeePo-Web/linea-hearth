CREATE TABLE public.stripe_webhook_events (
  event_id text PRIMARY KEY,
  type text NOT NULL,
  environment text NOT NULL,
  payload jsonb,
  processed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.stripe_webhook_events TO service_role;

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view webhook events"
  ON public.stripe_webhook_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_stripe_webhook_events_type ON public.stripe_webhook_events(type, processed_at DESC);


CREATE TABLE public.stripe_disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_dispute_id text NOT NULL UNIQUE,
  stripe_charge_id text NOT NULL,
  stripe_payment_intent_id text,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'cad',
  reason text,
  status text NOT NULL,
  evidence_due_by timestamptz,
  environment text NOT NULL,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.stripe_disputes TO service_role;

ALTER TABLE public.stripe_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view disputes"
  ON public.stripe_disputes FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_stripe_disputes_order ON public.stripe_disputes(order_id);
CREATE INDEX idx_stripe_disputes_status ON public.stripe_disputes(status);

CREATE TRIGGER update_stripe_disputes_updated_at
  BEFORE UPDATE ON public.stripe_disputes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();