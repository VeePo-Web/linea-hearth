import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Check } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useSizeMemory } from "@/hooks/useSizeMemory";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useToast } from "@/hooks/use-toast";
import { easing } from "@/lib/animations";

interface ProductImage {
  image_url: string;
  is_primary: boolean;
}

interface ProductVariant {
  size: string | null;
  stock_quantity: number;
}

interface LookbookProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  is_on_sale: boolean;
  categories?: { slug: string } | null;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
}

interface LookbookProductCardProps {
  product: LookbookProduct;
  position: string | null;
}

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL'];

const LookbookProductCard = ({ product, position }: LookbookProductCardProps) => {
  const [showSizes, setShowSizes] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const { addItem } = useCart();
  const { getRememberedSize, rememberSize } = useSizeMemory();
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion();

  const primaryImage = product.product_images?.find(img => img.is_primary);
  const imageUrl = primaryImage?.image_url || product.product_images?.[0]?.image_url;
  
  const displayPrice = product.is_on_sale && product.sale_price 
    ? product.sale_price 
    : product.price;

  // Get available sizes from variants
  const availableSizes = product.product_variants
    ?.filter(v => v.size && v.stock_quantity > 0)
    .map(v => v.size!) || [];
  
  const sizes = availableSizes.length > 0 ? availableSizes : DEFAULT_SIZES;

  // Get remembered size based on position (TOP → tops, BOTTOM → bottoms, etc.)
  const getPositionSlug = (pos: string | null): string => {
    if (!pos) return 'tops';
    const normalized = pos.toLowerCase();
    if (['top', 'tops', 'shirt', 'hoodie', 'tee'].includes(normalized)) return 'tops';
    if (['bottom', 'bottoms', 'pants', 'shorts'].includes(normalized)) return 'bottoms';
    if (['hat', 'hats', 'cap', 'beanie'].includes(normalized)) return 'hats';
    return 'tops';
  };

  const categorySlug = product.categories?.slug || getPositionSlug(position);
  const rememberedSize = getRememberedSize(categorySlug);

  const sizeInStock = (size: string): boolean => {
    if (availableSizes.length === 0) return true; // Assume in stock if no variant data
    return availableSizes.includes(size);
  };

  const addToCart = (size: string) => {
    setIsAdding(true);
    
    addItem({
      id: parseInt(product.id.replace(/\D/g, '')) || Math.random() * 10000,
      name: product.name,
      price: displayPrice,
      priceFormatted: `$${displayPrice.toFixed(2)}`,
      image: imageUrl || '',
      category: categorySlug,
      size: size,
      quantity: 1
    });

    // Success animation
    setTimeout(() => {
      setIsAdding(false);
      setIsAdded(true);
      setShowSizes(false);
      
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    }, 300);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAdded || isAdding) return;

    if (rememberedSize && sizeInStock(rememberedSize)) {
      // One-tap instant add
      addToCart(rememberedSize);
      toast({
        title: `Added in size ${rememberedSize}`,
        description: product.name,
      });
    } else {
      // Show size picker
      setShowSizes(true);
    }
  };

  const handleSizeSelect = (size: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    rememberSize(categorySlug, size);
    addToCart(size);
    
    toast({
      title: `Added in size ${size}`,
      description: product.name,
    });
  };

  const handleCloseSizes = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSizes(false);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: easing.editorial }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      className="group relative flex-shrink-0 w-[180px] md:w-auto"
    >
      <Link to={`/product/${product.slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[3/4] bg-muted overflow-hidden mb-3">
          {imageUrl ? (
            <motion.img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
              transition={{ duration: 0.5, ease: easing.editorial }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <span className="text-4xl opacity-20">✝</span>
            </div>
          )}

          {/* Position Badge */}
          {position && (
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[9px] uppercase tracking-wider font-light">
              {position}
            </span>
          )}

          {/* Success Overlay */}
          <AnimatePresence>
            {isAdded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-amber-600/90 flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Add Button */}
          <AnimatePresence>
            {!showSizes && !isAdded && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={handleQuickAdd}
                disabled={isAdding}
                className="absolute bottom-2 left-2 right-2 h-9 bg-background/95 backdrop-blur-sm 
                         text-foreground text-xs font-light flex items-center justify-center gap-1.5
                         opacity-0 group-hover:opacity-100 transition-opacity duration-300
                         hover:bg-foreground hover:text-background disabled:opacity-50"
              >
                {isAdding ? (
                  <span className="animate-pulse">Adding...</span>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    {rememberedSize && sizeInStock(rememberedSize) 
                      ? `Add in ${rememberedSize}` 
                      : 'Add'}
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Inline Size Picker */}
          <AnimatePresence>
            {showSizes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-0 left-0 right-0 bg-stone-900/95 backdrop-blur-sm p-3"
                onClick={handleCloseSizes}
              >
                <p className="text-[10px] text-white/60 uppercase tracking-wider mb-2 text-center">
                  Select Size
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center" onClick={e => e.stopPropagation()}>
                  {sizes.map(size => {
                    const inStock = sizeInStock(size);
                    const isRemembered = size === rememberedSize;
                    
                    return (
                      <motion.button
                        key={size}
                        onClick={(e) => inStock && handleSizeSelect(size, e)}
                        disabled={!inStock}
                        className={`
                          relative min-w-[36px] h-9 px-2 text-xs rounded
                          transition-colors
                          ${inStock 
                            ? isRemembered
                              ? 'bg-amber-500 text-white'
                              : 'bg-white/10 text-white hover:bg-white/20'
                            : 'bg-white/5 text-white/30 cursor-not-allowed line-through'
                          }
                        `}
                        whileTap={inStock && !prefersReducedMotion ? { scale: 0.95 } : {}}
                      >
                        {size}
                        {isRemembered && inStock && (
                          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-300 rounded-full" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product Info */}
        <div className="space-y-1">
          <p className="text-sm font-light text-foreground line-clamp-1 group-hover:text-muted-foreground transition-colors">
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
    </motion.div>
  );
};

export default LookbookProductCard;
