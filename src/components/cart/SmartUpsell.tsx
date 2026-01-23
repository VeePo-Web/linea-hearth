import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useQuickAdd, ProductForQuickAdd } from "@/hooks/useQuickAdd";
import { AnimatePresence, motion } from "framer-motion";
import InlineQuickSizePicker from "@/components/ui/InlineQuickSizePicker";

// Mock upsell products - in production would come from API/recommendation engine
const upsellProducts: ProductForQuickAdd[] = [
  {
    id: "upsell-100",
    name: "Heavenly Crewneck",
    slug: "heavenly-crewneck",
    price: 65,
    sale_price: null,
    is_on_sale: false,
    category_slug: "tops",
    product_images: [{ image_url: "/products/heavenly-crewneck/flat-lay.png", is_primary: true }],
    product_variants: [
      { size: "S", color: null, stock_quantity: 10 },
      { size: "M", color: null, stock_quantity: 8 },
      { size: "L", color: null, stock_quantity: 5 },
      { size: "XL", color: null, stock_quantity: 3 },
    ],
  },
  {
    id: "upsell-101",
    name: "Stay Holy Hoodie",
    slug: "stay-holy-hoodie",
    price: 85,
    sale_price: null,
    is_on_sale: false,
    category_slug: "hoodies",
    product_images: [{ image_url: "/products/stay-holy-hoodie/flat-front.png", is_primary: true }],
    product_variants: [
      { size: "S", color: null, stock_quantity: 7 },
      { size: "M", color: null, stock_quantity: 12 },
      { size: "L", color: null, stock_quantity: 6 },
      { size: "XL", color: null, stock_quantity: 2 },
    ],
  },
  {
    id: "upsell-102",
    name: "Stay Holy Hoodie",
    slug: "stay-holy-hoodie-alt",
    price: 85,
    sale_price: null,
    is_on_sale: false,
    category_slug: "hoodies",
    product_images: [{ image_url: "/products/stay-holy-hoodie/flat-full.png", is_primary: true }],
    product_variants: [
      { size: "S", color: null, stock_quantity: 5 },
      { size: "M", color: null, stock_quantity: 9 },
      { size: "L", color: null, stock_quantity: 4 },
      { size: "XL", color: null, stock_quantity: 1 },
    ],
  }
];

function UpsellProductCard({ 
  product, 
  willUnlockFreeShipping 
}: { 
  product: ProductForQuickAdd;
  willUnlockFreeShipping: boolean;
}) {
  const quickAdd = useQuickAdd(product, { showToast: true });
  const primaryImage = product.product_images?.[0];

  return (
    <div className="flex gap-3 items-center">
      {/* Product image */}
      <div className="w-16 h-16 bg-muted/30 overflow-hidden flex-shrink-0 relative">
        <img
          src={primaryImage?.image_url || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Success overlay */}
        <AnimatePresence>
          {quickAdd.isAdded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-emerald-500/90 flex items-center justify-center"
            >
              <Check className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product details */}
      <div className="flex-1 min-w-0 relative">
        <h4 className="text-sm font-medium text-foreground truncate">{product.name}</h4>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">${product.price}</p>
          {/* Size memory indicator */}
          {quickAdd.rememberedSize && quickAdd.stockForRemembered > 0 && (
            <span className="text-[10px] uppercase tracking-wide text-amber-600 font-medium">
              {quickAdd.rememberedSize}
            </span>
          )}
        </div>
        
        {willUnlockFreeShipping && (
          <p className="text-xs text-emerald-600 mt-0.5">
            + Unlocks free shipping!
          </p>
        )}

        {/* Inline size picker */}
        <AnimatePresence>
          {quickAdd.isPickerOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 overflow-hidden"
            >
              <div className="bg-muted/50 p-2 rounded">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">
                  Select Size
                </p>
                <div className="flex flex-wrap gap-1">
                  {quickAdd.availableSizes.map(size => {
                    const stock = quickAdd.getStockForVariant(size);
                    const isOOS = stock === 0;
                    const isRemembered = size === quickAdd.rememberedSize;
                    
                    return (
                      <button
                        key={size}
                        onClick={(e) => !isOOS && quickAdd.handleSizeSelect(size, e)}
                        disabled={isOOS}
                        className={cn(
                          "min-w-[28px] h-7 px-1.5 text-xs rounded transition-colors",
                          isOOS 
                            ? "bg-muted/30 text-muted-foreground/30 cursor-not-allowed line-through"
                            : isRemembered
                              ? "bg-amber-500 text-white font-medium"
                              : "bg-background hover:bg-muted text-foreground border border-border"
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={quickAdd.hideSizePicker}
                  className="mt-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick add button */}
      {!quickAdd.isPickerOpen && (
        <Button
          size="sm"
          variant="outline"
          onClick={quickAdd.handleQuickAdd}
          disabled={quickAdd.isAdding || quickAdd.isAdded}
          className={cn(
            "rounded-none h-9 px-3 transition-all",
            quickAdd.isAdded && "bg-emerald-500 text-white border-emerald-500",
            quickAdd.canOneTap && !quickAdd.isAdded && "bg-amber-500 text-white border-amber-500 hover:bg-amber-400"
          )}
        >
          {quickAdd.isAdding ? (
            <span className="animate-pulse">...</span>
          ) : quickAdd.isAdded ? (
            <Check className="h-4 w-4" />
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              {quickAdd.canOneTap ? quickAdd.rememberedSize : 'Add'}
            </>
          )}
        </Button>
      )}
    </div>
  );
}

const SmartUpsell = () => {
  const { items, amountToFreeShipping, hasFreeShipping } = useCart();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get products not already in cart
  const cartNames = items.map(item => item.name.toLowerCase());
  const availableUpsells = upsellProducts.filter(
    p => !cartNames.includes(p.name.toLowerCase())
  );
  
  // Rotate upsell every 30 seconds if drawer stays open
  useEffect(() => {
    if (availableUpsells.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % availableUpsells.length);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [availableUpsells.length]);

  // Find a product that helps reach free shipping threshold
  let upsellProduct = availableUpsells.find(
    p => p.price >= amountToFreeShipping && p.price <= amountToFreeShipping + 50
  );
  
  // Fallback to rotating product
  if (!upsellProduct && availableUpsells.length > 0) {
    upsellProduct = availableUpsells[currentIndex % availableUpsells.length];
  }

  if (!upsellProduct) return null;

  const willUnlockFreeShipping = !hasFreeShipping && upsellProduct.price >= amountToFreeShipping;

  return (
    <div className="px-6 py-4 border-t border-border bg-muted/20">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
        Complete the Look
      </p>
      
      <UpsellProductCard 
        product={upsellProduct} 
        willUnlockFreeShipping={willUnlockFreeShipping}
      />
    </div>
  );
};

export default SmartUpsell;
