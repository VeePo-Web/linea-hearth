import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ScrollReveal from "@/components/motion/ScrollReveal";
import StaggerContainer from "@/components/motion/StaggerContainer";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { formatPrice } from "@/lib/currency";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  category_name?: string;
  primary_image?: string;
  is_on_sale: boolean;
  sale_price: number | null;
}

const FeaturedCollection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            slug,
            price,
            is_on_sale,
            sale_price,
            is_featured,
            categories!products_category_id_fkey(name),
            product_images(image_url, is_primary)
          `)
          .eq('status', 'active')
          .eq('is_featured', true)
          .limit(8);

        if (error) throw error;

        const formattedProducts = (data || []).map((product: any) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          is_on_sale: product.is_on_sale,
          sale_price: product.sale_price,
          category_name: product.categories?.name || 'Apparel',
          primary_image: product.product_images?.find((img: any) => img.is_primary)?.image_url || 
                        product.product_images?.[0]?.image_url
        }));

        setProducts(formattedProducts);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Placeholder products
  const placeholderProducts: Product[] = [
    { id: '1', name: 'Stay Holy Hoodie', slug: 'stay-holy-hoodie', price: 79, category_name: 'Hoodies', is_on_sale: false, sale_price: null },
    { id: '2', name: 'Heavenly Crewneck', slug: 'heavenly-crewneck', price: 65, category_name: 'Tops', is_on_sale: false, sale_price: null },
    { id: '3', name: 'Faith Over Fear Tee', slug: 'faith-over-fear-tee', price: 45, category_name: 'T-Shirts', is_on_sale: true, sale_price: 35 },
    { id: '4', name: 'Kingdom Joggers', slug: 'kingdom-joggers', price: 75, category_name: 'Bottoms', is_on_sale: false, sale_price: null },
  ];

  const displayProducts = products.length > 0 ? products : placeholderProducts;

  return (
    <section className="w-full py-12 md:py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 xs:px-6">
        {/* Section Header - Editorial minimal */}
        <ScrollReveal variant="fadeUp">
          <div className="flex justify-between items-end mb-6 md:mb-8">
            <div>
              <p className="text-eyebrow text-muted-foreground mb-2">Community picks</p>
              <h2 className="text-section text-foreground">Tribe Approved</h2>
            </div>
            <motion.div
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Link 
                to="/category/shop"
                className="text-foreground text-sm font-light flex items-center gap-2 hover:text-accent transition-colors group touch-target py-2"
              >
                Shop All
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </ScrollReveal>

        {/* Product Grid - Responsive columns */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-2 xs:gap-3 md:gap-4" staggerDelay={0.1}>
          {displayProducts.slice(0, 4).map((product, index) => (
            <motion.div
              key={product.id}
              whileHover={prefersReducedMotion ? {} : { y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link
                to={`/product/${product.slug}`}
                className="group block tap-feedback active:scale-[0.98] transition-transform duration-150"
              >
                {/* Product Image */}
                <div className="aspect-[3/4] bg-muted mb-3 md:mb-4 overflow-hidden relative">
                  {product.primary_image ? (
                    <motion.img 
                      src={product.primary_image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                      transition={{ duration: 0.5 }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-secondary">
                      <span className="text-muted-foreground text-caption uppercase">
                        {product.category_name}
                      </span>
                    </div>
                  )}

                  {/* Sale Badge */}
                  {product.is_on_sale && (
                    <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-destructive text-destructive-foreground text-[10px] font-bold tracking-wider uppercase px-2 py-1">
                      Sale
                    </div>
                  )}
                </div>

                {/* Product Info - Minimal */}
                <div>
                  <p className="text-caption text-muted-foreground uppercase mb-1">
                    {product.category_name}
                  </p>
                  <h3 className="text-xs xs:text-sm font-light text-foreground mb-1 group-hover:text-accent transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {product.is_on_sale && product.sale_price ? (
                      <>
                        <span className="text-xs xs:text-sm font-light text-foreground">
                          {formatPrice(product.sale_price)}
                        </span>
                        <span className="text-xs xs:text-sm font-light text-muted-foreground line-through">
                          {formatPrice(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs xs:text-sm font-light text-foreground">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default FeaturedCollection;