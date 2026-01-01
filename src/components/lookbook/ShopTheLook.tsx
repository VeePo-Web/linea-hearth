import { Link } from "react-router-dom";
import { Plus, ShoppingBag } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import StaggerContainer from "@/components/motion/StaggerContainer";

interface LookProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  is_on_sale: boolean;
  position: string | null;
  product_images: Array<{
    image_url: string;
    is_primary: boolean;
  }>;
}

interface ShopTheLookProps {
  products: LookProduct[];
  lookName: string;
}

const ShopTheLook = ({ products, lookName }: ShopTheLookProps) => {
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion();

  const totalPrice = products.reduce((sum, product) => {
    return sum + (product.is_on_sale && product.sale_price ? product.sale_price : product.price);
  }, 0);

  const handleAddAll = () => {
    toast({
      title: "Look Added",
      description: `"${lookName}" complete fit added to your bag.`,
    });
  };

  const handleQuickAdd = (productName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast({
      title: "Added to Bag",
      description: `${productName} added to your bag.`,
    });
  };

  const getPositionLabel = (position: string | null) => {
    if (!position) return null;
    const labels: Record<string, string> = {
      hat: "HAT",
      top: "TOP",
      bottom: "BOTTOM",
      shoes: "SHOES",
      accessories: "ACC",
    };
    return labels[position.toLowerCase()] || position.toUpperCase();
  };

  if (products.length === 0) {
    return null;
  }

  const springConfig = { type: "spring" as const, stiffness: 400, damping: 25 };

  return (
    <div className="space-y-6">
      {/* Section Label */}
      <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-light">
        Shop the Look
      </p>

      {/* Products Grid */}
      <StaggerContainer className="grid grid-cols-2 gap-3" staggerDelay={0.1} delayChildren={0}>
        {products.slice(0, 4).map((product) => {
          const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
          const positionLabel = getPositionLabel(product.position);

          return (
            <motion.div 
              key={product.id} 
              className="group relative"
              whileHover={prefersReducedMotion ? {} : { y: -4 }}
              transition={springConfig}
            >
              <Link to={`/product/${product.slug}`}>
                <motion.div 
                  className="aspect-[3/4] bg-stone-800 rounded-lg overflow-hidden relative"
                  whileHover={prefersReducedMotion ? {} : { 
                    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)" 
                  }}
                  transition={springConfig}
                >
                  {primaryImage && (
                    <motion.img
                      src={primaryImage.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    />
                  )}
                  
                  {/* Position Tag */}
                  {positionLabel && (
                    <span className="absolute top-2 left-2 text-[9px] uppercase tracking-wider bg-black/70 text-white/90 px-2 py-1 rounded font-light">
                      {positionLabel}
                    </span>
                  )}

                  {/* Quick Add Button */}
                  <motion.button
                    onClick={(e) => handleQuickAdd(product.name, e)}
                    className="absolute bottom-2 right-2 w-8 h-8 bg-white/95 hover:bg-white rounded-full flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    aria-label={`Quick add ${product.name}`}
                    transition={springConfig}
                  >
                    <Plus className="w-4 h-4 text-stone-900" />
                  </motion.button>
                </motion.div>
              </Link>

              {/* Product Info */}
              <div className="mt-2.5">
                <p className="text-xs text-white/90 font-light truncate">
                  {product.name}
                </p>
                <p className="text-xs text-white/50 font-light mt-0.5">
                  {product.is_on_sale && product.sale_price ? (
                    <>
                      <span className="text-amber-500">${product.sale_price}</span>
                      <span className="line-through ml-1.5 text-white/30">${product.price}</span>
                    </>
                  ) : (
                    `$${product.price}`
                  )}
                </p>
              </div>
            </motion.div>
          );
        })}
      </StaggerContainer>

      {/* Add Complete Look CTA */}
      <motion.div
        whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
        transition={springConfig}
      >
        <Button
          onClick={handleAddAll}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-light tracking-wide h-12 rounded-lg"
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Add Complete Look — ${totalPrice.toFixed(0)}
        </Button>
      </motion.div>
    </div>
  );
};

export default ShopTheLook;
