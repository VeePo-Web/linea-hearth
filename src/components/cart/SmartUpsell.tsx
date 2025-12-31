import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Mock upsell products - in production would come from API/recommendation engine
const upsellProducts = [
  {
    id: 100,
    name: "Lintel Ring",
    price: 1950,
    priceFormatted: "€1,950",
    image: "/rings-collection.png",
    category: "Rings"
  },
  {
    id: 101,
    name: "Arc Earrings",
    price: 1450,
    priceFormatted: "€1,450",
    image: "/earrings-collection.png",
    category: "Earrings"
  },
  {
    id: 102,
    name: "Span Bracelet",
    price: 2200,
    priceFormatted: "€2,200",
    image: "/span-bracelet.png",
    category: "Bracelets"
  }
];

const SmartUpsell = () => {
  const { items, addItem, amountToFreeShipping, hasFreeShipping } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);

  // Get a product not already in cart
  const cartIds = items.map(item => item.id);
  const availableUpsells = upsellProducts.filter(p => !cartIds.includes(p.id));
  
  // Find a product that helps reach free shipping threshold
  let upsellProduct = availableUpsells.find(p => p.price >= amountToFreeShipping && p.price <= amountToFreeShipping + 500);
  
  // Fallback to first available product
  if (!upsellProduct && availableUpsells.length > 0) {
    upsellProduct = availableUpsells[0];
  }

  if (!upsellProduct) return null;

  const handleAddToCart = async () => {
    setIsAdding(true);
    setAddedId(upsellProduct!.id);
    
    // Small delay for animation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    addItem({
      id: upsellProduct!.id,
      name: upsellProduct!.name,
      price: upsellProduct!.price,
      priceFormatted: upsellProduct!.priceFormatted,
      image: upsellProduct!.image,
      category: upsellProduct!.category
    });
    
    setIsAdding(false);
  };

  const willUnlockFreeShipping = !hasFreeShipping && upsellProduct.price >= amountToFreeShipping;

  return (
    <div className="px-6 py-4 border-t border-border bg-muted/20">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
        Complete the Look
      </p>
      
      <div className="flex gap-3 items-center">
        {/* Product image */}
        <div className="w-16 h-16 bg-muted/30 overflow-hidden flex-shrink-0">
          <img
            src={upsellProduct.image}
            alt={upsellProduct.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Product details */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground truncate">{upsellProduct.name}</h4>
          <p className="text-sm text-muted-foreground">{upsellProduct.priceFormatted}</p>
          
          {willUnlockFreeShipping && (
            <p className="text-xs text-emerald-600 mt-0.5">
              + Unlocks free shipping!
            </p>
          )}
        </div>

        {/* Quick add button */}
        <Button
          size="sm"
          variant="outline"
          onClick={handleAddToCart}
          disabled={isAdding}
          className={cn(
            "rounded-none h-9 px-3 transition-all",
            addedId === upsellProduct.id && "bg-emerald-500 text-white border-emerald-500"
          )}
        >
          {isAdding ? (
            <span className="animate-pulse">Adding...</span>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SmartUpsell;
