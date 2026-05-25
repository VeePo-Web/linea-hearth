import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns the newest active product's primary image for a given category slug.
 * Falls back to provided fallback image when DB is empty.
 */
export function useCategoryHeroImage(slug: string, fallback: string): string {
  const { data } = useQuery({
    queryKey: ["category-hero-image", slug],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data: products } = await supabase
        .from("products")
        .select("id, created_at, categories:category_id(slug), product_images(image_url, is_primary, display_order)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(20);

      const prod = products?.find((p: any) => p.categories?.slug === slug);
      const primary =
        prod?.product_images?.find((i: any) => i.is_primary) ||
        prod?.product_images?.[0];
      return primary?.image_url ?? null;
    },
  });

  return data ?? fallback;
}

/**
 * Returns multiple newest active product images for a given category slug.
 * Used for grid/wall layouts that need variety.
 */
export function useCategoryImages(slug: string, count: number, fallbacks: string[]): string[] {
  const { data } = useQuery({
    queryKey: ["category-images", slug, count],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data: products } = await supabase
        .from("products")
        .select("id, created_at, categories:category_id(slug), product_images(image_url, is_primary, display_order)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(40);

      const matching = (products ?? []).filter((p: any) => p.categories?.slug === slug);
      const urls: string[] = [];
      for (const p of matching) {
        const sorted = [...(p.product_images ?? [])].sort((a: any, b: any) => {
          if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
          return (a.display_order ?? 0) - (b.display_order ?? 0);
        });
        for (const img of sorted) {
          if (urls.length >= count) break;
          urls.push(img.image_url);
        }
        if (urls.length >= count) break;
      }
      return urls;
    },
  });

  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(data?.[i] ?? fallbacks[i % fallbacks.length]);
  }
  return result;
}
