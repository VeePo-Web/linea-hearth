import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

interface WearWithSectionProps {
  currentProductId?: string;
  categoryId?: string | null;
}

const WearWithSection = ({ currentProductId, categoryId }: WearWithSectionProps) => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["wear-with", currentProductId, categoryId],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          id,
          name,
          slug,
          price,
          sale_price,
          is_on_sale,
          product_images(image_url, is_primary)
        `)
        .eq("status", "active")
        .limit(6);

      // Exclude current product
      if (currentProductId) {
        query = query.neq("id", currentProductId);
      }

      // Get products from same or complementary category
      // For now, just get any other active products
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const displayProducts = products.slice(0, 4);

  if (isLoading) {
    return (
      <section className="w-full py-12 lg:py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="h-4 bg-muted rounded w-40 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (displayProducts.length === 0) return null;

  return (
    <section className="w-full py-12 lg:py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xs font-light text-muted-foreground uppercase tracking-[0.2em] mb-8">
          Complete The Look
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {displayProducts.map((product) => {
            const primaryImage = product.product_images?.find((img: any) => img.is_primary);
            const imageUrl = primaryImage?.image_url || product.product_images?.[0]?.image_url;

            return (
              <Link
                key={product.id}
                to={`/product/${product.slug}`}
                className="group"
              >
                <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-3">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <span className="text-4xl opacity-20">✝</span>
                    </div>
                  )}

                  {/* Quick Add Button */}
                  <button
                    className="absolute bottom-3 left-3 right-3 h-9 bg-background/90 backdrop-blur-sm text-foreground text-xs font-light flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-background"
                    onClick={(e) => {
                      e.preventDefault();
                      // Quick add logic would go here
                    }}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Quick Add
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-light text-foreground group-hover:text-muted-foreground transition-colors line-clamp-1">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2">
                    {product.is_on_sale && product.sale_price ? (
                      <>
                        <span className="text-sm font-light text-foreground">
                          ${product.sale_price.toFixed(2)}
                        </span>
                        <span className="text-xs font-light text-muted-foreground line-through">
                          ${product.price.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-light text-muted-foreground">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WearWithSection;
