-- product_colors: first-class color per product
CREATE TABLE public.product_colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL,
  hex text NOT NULL DEFAULT '#1a1a1a',
  swatch_image_url text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX product_colors_product_name_uniq
  ON public.product_colors(product_id, lower(name));
CREATE INDEX product_colors_product_id_idx ON public.product_colors(product_id);

GRANT SELECT ON public.product_colors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_colors TO authenticated;
GRANT ALL ON public.product_colors TO service_role;

ALTER TABLE public.product_colors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Colors viewable with their products"
  ON public.product_colors FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = product_colors.product_id
      AND (products.status = 'active'::product_status OR has_role(auth.uid(), 'admin'::app_role))
  ));

CREATE POLICY "Admins can insert colors"
  ON public.product_colors FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update colors"
  ON public.product_colors FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete colors"
  ON public.product_colors FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_product_colors_updated_at
  BEFORE UPDATE ON public.product_colors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- product_color_images: per-color gallery
CREATE TABLE public.product_color_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  color_id uuid NOT NULL REFERENCES public.product_colors(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_color_images_color_id_idx ON public.product_color_images(color_id);

GRANT SELECT ON public.product_color_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_color_images TO authenticated;
GRANT ALL ON public.product_color_images TO service_role;

ALTER TABLE public.product_color_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Color images viewable with their color"
  ON public.product_color_images FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.product_colors pc
    JOIN public.products p ON p.id = pc.product_id
    WHERE pc.id = product_color_images.color_id
      AND (p.status = 'active'::product_status OR has_role(auth.uid(), 'admin'::app_role))
  ));

CREATE POLICY "Admins can insert color images"
  ON public.product_color_images FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update color images"
  ON public.product_color_images FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete color images"
  ON public.product_color_images FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Link variants to colors (nullable, keeps legacy text in sync)
ALTER TABLE public.product_variants
  ADD COLUMN color_id uuid REFERENCES public.product_colors(id) ON DELETE SET NULL;
CREATE INDEX product_variants_color_id_idx ON public.product_variants(color_id);
