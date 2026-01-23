import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, ShoppingBag, Check } from "lucide-react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { useSizeMemory } from "@/hooks/useSizeMemory";
import StaggerContainer from "@/components/motion/StaggerContainer";
import InlineSizePicker from "./InlineSizePicker";
import { DrawCheckIcon } from "@/components/ui/draw-check-icon";

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

// Default sizes for products (in real app, would come from product variants)
const DEFAULT_SIZES = ['S', 'M', 'L', 'XL'];

const ShopTheLook = ({ products, lookName }: ShopTheLookProps) => {
  const { toast } = useToast();
  const { addItem, items } = useCart();
  const { getRememberedSize, rememberSize } = useSizeMemory();
  const prefersReducedMotion = useReducedMotion();
  
  // Track which product has size selector expanded
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  // Track recently added products for success animation
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());
  // Track sizes selected for each product (for the session)
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

  // Check which products are already in cart
  const productsInCart = useMemo(() => 
    new Set(items.map(item => String(item.id))),
    [items]
  );

  const totalPrice = products.reduce((sum, product) => {
    return sum + (product.is_on_sale && product.sale_price ? product.sale_price : product.price);
  }, 0);

  const addedCount = products.filter(p => addedProducts.has(p.id) || productsInCart.has(p.id)).length;

  const addToCart = (product: LookProduct, size: string) => {
    const price = product.is_on_sale && product.sale_price ? product.sale_price : product.price;
    const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
    
    addItem({
      id: parseInt(product.id) || Math.random() * 10000,
      name: product.name,
      price: price,
      priceFormatted: `$${price}`,
      image: primaryImage?.image_url || '',
      category: product.position || 'Lookbook',
      size: size,
    });

    // Show success state
    setAddedProducts(prev => new Set(prev).add(product.id));
    setSelectedSizes(prev => ({ ...prev, [product.id]: size }));
    setExpandedProduct(null);

    // Remember size for this category
    if (product.position) {
      rememberSize(product.position, size);
    }

    toast({
      title: `Added in size ${size}`,
      description: product.name,
    });

    // Clear success state after animation
    setTimeout(() => {
      setAddedProducts(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 2000);
  };

  const handleQuickAdd = (product: LookProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If already in cart, don't do anything
    if (productsInCart.has(product.id)) return;
    
    // Check for remembered size
    const categoryKey = product.position || 'tops';
    const rememberedSize = getRememberedSize(categoryKey);
    
    if (rememberedSize) {
      // One-tap add with remembered size
      addToCart(product, rememberedSize);
    } else {
      // Expand to show size selector
      setExpandedProduct(expandedProduct === product.id ? null : product.id);
    }
  };

  const handleSizeSelect = (product: LookProduct, size: string) => {
    addToCart(product, size);
  };

  const handleAddAll = () => {
    let addedAny = false;
    
    products.forEach(product => {
      if (productsInCart.has(product.id)) return;
      
      const categoryKey = product.position || 'tops';
      const rememberedSize = getRememberedSize(categoryKey);
      const size = rememberedSize || 'M'; // Default to M if no preference
      
      addToCart(product, size);
      addedAny = true;
    });

    if (addedAny) {
      toast({
        title: "Complete look added",
        description: `"${lookName}" added to your bag`,
      });
    }
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
      {/* Section Label with Progress */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-light">
          Shop the Look
        </p>
        {addedCount > 0 && (
          <motion.p 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] uppercase tracking-wide text-amber-500 font-medium"
          >
            {addedCount} of {products.length} in bag
          </motion.p>
        )}
      </div>

      {/* Products Grid */}
      <StaggerContainer className="grid grid-cols-2 gap-3" staggerDelay={0.1} delayChildren={0}>
        {products.slice(0, 4).map((product) => {
          const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
          const positionLabel = getPositionLabel(product.position);
          const isInCart = productsInCart.has(product.id);
          const isJustAdded = addedProducts.has(product.id);
          const isExpanded = expandedProduct === product.id;
          const categoryKey = product.position || 'tops';
          const rememberedSize = getRememberedSize(categoryKey);

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

                  {/* Success Overlay */}
                  <AnimatePresence>
                    {isJustAdded && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-green-600/90 rounded-lg 
                                   flex flex-col items-center justify-center gap-2"
                      >
                        <DrawCheckIcon size="lg" color="white" animate delay={0.1} />
                        <span className="text-white text-xs font-medium">
                          Size {selectedSizes[product.id]}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* In Cart Badge */}
                  {isInCart && !isJustAdded && (
                    <div className="absolute top-2 right-2 bg-green-600 rounded-full p-1">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}

                  {/* Quick Add Button */}
                  {!isInCart && !isJustAdded && (
                    <motion.button
                      onClick={(e) => handleQuickAdd(product, e)}
                      className={`
                        absolute bottom-2 right-2 w-9 h-9 rounded-full 
                        flex items-center justify-center transition-colors
                        ${rememberedSize 
                          ? 'bg-amber-500 hover:bg-amber-400' 
                          : 'bg-white/95 hover:bg-white'
                        }
                      `}
                      whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                      aria-label={rememberedSize 
                        ? `Quick add ${product.name} in size ${rememberedSize}` 
                        : `Add ${product.name} - select size`
                      }
                      transition={springConfig}
                    >
                      <Plus className={`w-4 h-4 ${rememberedSize ? 'text-white' : 'text-stone-900'}`} />
                    </motion.button>
                  )}

                  {/* Inline Size Picker */}
                  <AnimatePresence>
                    {isExpanded && (
                      <InlineSizePicker
                        sizes={DEFAULT_SIZES}
                        rememberedSize={rememberedSize}
                        onSelect={(size) => handleSizeSelect(product, size)}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>

              {/* Product Info */}
              <div className="mt-2.5">
                <p className="text-xs text-white/90 font-light truncate">
                  {product.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-white/50 font-light">
                    {product.is_on_sale && product.sale_price ? (
                      <>
                        <span className="text-amber-500">${product.sale_price}</span>
                        <span className="line-through ml-1.5 text-white/30">${product.price}</span>
                      </>
                    ) : (
                      `$${product.price}`
                    )}
                  </p>
                  {/* Show remembered size hint */}
                  {rememberedSize && !isInCart && (
                    <span className="text-[9px] uppercase tracking-wide text-amber-500/70">
                      {rememberedSize}
                    </span>
                  )}
                </div>
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
          disabled={addedCount === products.length}
          className={`
            w-full font-light tracking-wide h-12 rounded-lg transition-colors
            ${addedCount === products.length 
              ? 'bg-green-600 hover:bg-green-600 text-white' 
              : 'bg-amber-600 hover:bg-amber-500 text-white'
            }
          `}
        >
          {addedCount === products.length ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Complete Look in Bag
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 mr-2" />
              Add Complete Look — ${totalPrice.toFixed(0)}
            </>
          )}
        </Button>
      </motion.div>

      {/* Size memory hint */}
      {products.some(p => getRememberedSize(p.position || 'tops')) && (
        <p className="text-[10px] text-center text-white/30 font-light">
          Tap + to instantly add in your size
        </p>
      )}
    </div>
  );
};

export default ShopTheLook;
