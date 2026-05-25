ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stripe_price_id text;
CREATE INDEX IF NOT EXISTS idx_products_stripe_price_id ON public.products(stripe_price_id);