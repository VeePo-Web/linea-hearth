import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductStyle {
  id: string;
  product_id: string;
  name: string;
  label: string | null;
  icon_url: string | null;
  price_delta: number;
  position: number;
}

/**
 * Loads admin-managed garment styles for a product
 * (Hoodie / T-Shirt / Crewneck / Long Sleeve, etc.) from `product_styles`.
 *
 * Mirrors the contract of `useProductColors` — same shape, same UX surface.
 */
export function useProductStyles(productId: string | null | undefined) {
  const [styles, setStyles] = useState<ProductStyle[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!productId) {
      setStyles([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('product_styles')
      .select('id, product_id, name, label, icon_url, price_delta, position')
      .eq('product_id', productId)
      .order('position', { ascending: true });
    setLoading(false);
    if (!error && data) {
      // numeric comes back as string from PostgREST — coerce
      const normalized = data.map((s) => ({
        ...s,
        price_delta: Number(s.price_delta) || 0,
      })) as ProductStyle[];
      setStyles(normalized);
    }
  }, [productId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { styles, setStyles, loading, refetch };
}
