import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [isVisible, setIsVisible] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

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
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Placeholder products for when no data
  const placeholderProducts: Product[] = [
    { id: '1', name: 'Lion of Judah Tee', slug: 'lion-of-judah-tee', price: 45, category_name: 'T-Shirts', is_on_sale: false, sale_price: null },
    { id: '2', name: 'Faith Over Fear Hoodie', slug: 'faith-over-fear-hoodie', price: 85, category_name: 'Hoodies', is_on_sale: true, sale_price: 65 },
    { id: '3', name: 'Blessed Cap', slug: 'blessed-cap', price: 35, category_name: 'Accessories', is_on_sale: false, sale_price: null },
    { id: '4', name: 'Kingdom Crewneck', slug: 'kingdom-crewneck', price: 70, category_name: 'Sweatshirts', is_on_sale: false, sale_price: null },
  ];

  const displayProducts = products.length > 0 ? products : placeholderProducts;

  return (
    <section 
      ref={sectionRef}
      className="w-full py-16 md:py-24 px-6 bg-background"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div 
          className={`flex justify-between items-end mb-10 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div>
            <p className="text-amber-600 text-xs tracking-[0.2em] uppercase mb-2">
              Shop the Movement
            </p>
            <h2 className="text-foreground text-3xl md:text-4xl font-light">
              Bestsellers
            </h2>
          </div>
          <Link 
            to="/category/shop"
            className="text-foreground text-sm font-light flex items-center gap-2 hover:text-amber-600 transition-colors group"
          >
            Shop All
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {displayProducts.slice(0, 4).map((product, index) => (
            <Link
              key={product.id}
              to={`/product/${product.slug}`}
              className={`group block transition-all duration-700 ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Product Image */}
              <div className="aspect-[3/4] bg-stone-100 mb-4 overflow-hidden relative">
                {product.primary_image ? (
                  <img 
                    src={product.primary_image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-stone-200 to-stone-300">
                    <span className="text-stone-400 text-xs uppercase tracking-wider">
                      {product.category_name}
                    </span>
                  </div>
                )}

                {/* Sale Badge */}
                {product.is_on_sale && (
                  <div className="absolute top-3 left-3 bg-amber-500 text-black text-[10px] font-medium tracking-wider uppercase px-2 py-1">
                    Sale
                  </div>
                )}

                {/* Quick Add - Shows on hover */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-center py-3 text-xs tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Quick Add
                </div>
              </div>

              {/* Product Info */}
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                  {product.category_name}
                </p>
                <h3 className="text-foreground text-sm font-light mb-1 group-hover:text-amber-600 transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  {product.is_on_sale && product.sale_price ? (
                    <>
                      <span className="text-foreground text-sm font-light">
                        ${product.sale_price}
                      </span>
                      <span className="text-muted-foreground text-sm font-light line-through">
                        ${product.price}
                      </span>
                    </>
                  ) : (
                    <span className="text-foreground text-sm font-light">
                      ${product.price}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
