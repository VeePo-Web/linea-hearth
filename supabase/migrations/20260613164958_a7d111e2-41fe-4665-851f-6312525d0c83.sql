CREATE TABLE public.product_styles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL,
  label text,
  icon_url text,
  price_delta numeric NOT NULL DEFAULT 0,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, name)
);

GRANT SELECT ON public.product_styles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_styles TO authenticated;
GRANT ALL ON public.product_styles TO service_role;

ALTER TABLE public.product_styles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view product styles"
  ON public.product_styles FOR SELECT
  USING (true);

CREATE POLICY "Admins manage product styles"
  ON public.product_styles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_product_styles_updated_at
  BEFORE UPDATE ON public.product_styles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_product_styles_product ON public.product_styles(product_id, position);