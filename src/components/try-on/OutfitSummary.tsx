import { useTryOnState } from '@/hooks/useTryOnState';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const OutfitSummary = () => {
  const { equippedItems, getTotalPrice, getEquippedCount, clearAllItems } = useTryOnState();
  const { addItem, openCart } = useCart();
  
  const totalPrice = Number(getTotalPrice());
  const itemCount = getEquippedCount();
  const items = Object.entries(equippedItems).filter(([_, item]) => item !== null);

  const handleAddAllToCart = () => {
    items.forEach(([slot, item]) => {
      if (item) {
        addItem({
          id: item.productId.charCodeAt(0) + Date.now(),
          name: item.name,
          price: Number(item.price),
          priceFormatted: `€${Number(item.price).toLocaleString()}`,
          image: item.imageUrl || '/placeholder.svg',
          category: slot,
          size: item.size,
          color: item.color,
        });
      }
    });

    toast.success(
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        <span>{itemCount} items added to bag!</span>
      </div>
    );
    
    openCart();
  };

  if (itemCount === 0) {
    return (
      <div className="p-4 border border-dashed border-border text-center">
        <div className="text-muted-foreground text-sm font-light">
          Select items to build your outfit
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          Your Outfit ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </div>
        <button 
          onClick={clearAllItems}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Items List */}
      <div className="divide-y divide-border">
        {items.map(([slot, item]) => (
          <div key={slot} className="p-3 flex items-center gap-3">
            {item?.imageUrl && (
              <div className="w-12 h-12 bg-muted overflow-hidden flex-shrink-0">
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-light truncate">{item?.name}</div>
              <div className="text-xs text-muted-foreground">
                Size {item?.size}
              </div>
            </div>
            <div className="text-sm font-medium">
              €{item?.price.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Total + CTA */}
      <div className="p-4 bg-muted/30">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-light">Total</span>
          <span className="text-lg font-medium">€{totalPrice.toLocaleString()}</span>
        </div>
        
        <Button
          onClick={handleAddAllToCart}
          className="w-full gap-2"
          size="lg"
        >
          <ShoppingBag className="w-4 h-4" />
          Add All to Bag
        </Button>
      </div>
    </div>
  );
};
