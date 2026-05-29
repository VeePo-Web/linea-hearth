CREATE TABLE public.post_purchase_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_email text NOT NULL,
  stripe_customer_id text,
  parent_payment_intent_id text,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  unit_amount_cents integer NOT NULL,
  original_unit_amount_cents integer NOT NULL,
  discount_pct integer NOT NULL DEFAULT 15,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  child_order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  child_payment_intent_id text,
  failure_reason text,
  granted_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uniq_post_purchase_offers_parent ON public.post_purchase_offers(parent_order_id);
CREATE INDEX idx_post_purchase_offers_status ON public.post_purchase_offers(status);

GRANT SELECT ON public.post_purchase_offers TO authenticated;
GRANT ALL ON public.post_purchase_offers TO service_role;

ALTER TABLE public.post_purchase_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read offers"
  ON public.post_purchase_offers
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_post_purchase_offers_updated_at
  BEFORE UPDATE ON public.post_purchase_offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();