
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS shipping_profile TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS shipping_profile_override TEXT;

ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_shipping_profile_check;
ALTER TABLE public.categories ADD CONSTRAINT categories_shipping_profile_check
  CHECK (shipping_profile IS NULL OR shipping_profile IN ('hat','tee','hoodie'));

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_shipping_profile_override_check;
ALTER TABLE public.products ADD CONSTRAINT products_shipping_profile_override_check
  CHECK (shipping_profile_override IS NULL OR shipping_profile_override IN ('hat','tee','hoodie'));

UPDATE public.categories SET shipping_profile = 'hat'    WHERE slug IN ('hats');
UPDATE public.categories SET shipping_profile = 'tee'    WHERE slug IN ('tees','tops','short-sleeve','long-sleeve');
UPDATE public.categories SET shipping_profile = 'hoodie' WHERE slug IN ('hoodies','pullover-hoodies','zip-up-hoodies','quarter-zips');
