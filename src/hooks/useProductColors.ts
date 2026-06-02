import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductColor {
  id: string;
  product_id: string;
  name: string;
  hex: string;
  swatch_image_url: string | null;
  position: number;
}

/**
 * Loads and manages the persistent color list for a product
 * from the `product_colors` table.
 */
export function useProductColors(productId: string | null | undefined) {
  const [colors, setColors] = useState<ProductColor[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!productId) {
      setColors([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('product_colors' as never)
      .select('id, product_id, name, hex, swatch_image_url, position')
      .eq('product_id', productId)
      .order('position', { ascending: true });
    setLoading(false);
    if (!error && data) setColors(data as unknown as ProductColor[]);
  }, [productId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { colors, setColors, loading, refetch };
}
