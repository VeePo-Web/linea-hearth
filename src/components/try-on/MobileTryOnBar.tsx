import { useState } from 'react';
import { useTryOnState } from '@/hooks/useTryOnState';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ShoppingBag, ChevronUp, Crown, Shirt, Footprints } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Custom pants icon
const PantsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16v4l-3 14h-4l-1-10-1 10H7L4 8V4z" />
  </svg>
);

const slots = [
  { id: 'head' as const, icon: <Crown className="w-5 h-5" /> },
  { id: 'top' as const, icon: <Shirt className="w-5 h-5" /> },
  { id: 'outerwear' as const, icon: <Shirt className="w-5 h-5" /> },
  { id: 'bottom' as const, icon: <PantsIcon /> },
  { id: 'footwear' as const, icon: <Footprints className="w-5 h-5" /> },
];

interface MobileTryOnBarProps {
  onOpenSlot: (slot: string) => void;
}

export const MobileTryOnBar = ({ onOpenSlot }: MobileTryOnBarProps) => {
  const { equippedItems, getTotalPrice, getEquippedCount, clearAllItems } = useTryOnState();
  const { addItem, openCart } = useCart();
  const [showSummary, setShowSummary] = useState(false);

  const totalPrice = Number(getTotalPrice());
  const itemCount = getEquippedCount();

  const handleAddAllToCart = () => {
    Object.entries(equippedItems).forEach(([slot, item]) => {
      if (item) {
        addItem({
          id: item.productId.charCodeAt(0) + Date.now() + Math.random(),
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

    toast.success(`${itemCount} items added to bag!`);
    openCart();
    setShowSummary(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      {/* Slot Quick Access */}
      <div className="flex items-center justify-around py-2 px-4 border-b border-border">
        {slots.map(({ id, icon }) => {
          const isEquipped = !!equippedItems[id];
          return (
            <button
              key={id}
              onClick={() => onOpenSlot(id)}
              className={cn(
                "w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all",
                isEquipped
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground"
              )}
            >
              {icon}
            </button>
          );
        })}
      </div>

      {/* Summary Bar */}
      <div className="flex items-center justify-between p-4">
        <Sheet open={showSummary} onOpenChange={setShowSummary}>
          <SheetTrigger asChild>
            <button className="flex items-center gap-2 text-sm">
              <ShoppingBag className="w-4 h-4" />
              <span>{itemCount} items</span>
              <ChevronUp className={cn("w-4 h-4 transition-transform", showSummary && "rotate-180")} />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[60vh]">
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-light">Your Outfit</h3>
                <button 
                  onClick={() => {
                    clearAllItems();
                    setShowSummary(false);
                  }}
                  className="text-xs text-muted-foreground"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                {Object.entries(equippedItems).map(([slot, item]) => {
                  if (!item) return null;
                  return (
                    <div key={slot} className="flex items-center gap-3 p-3 bg-muted rounded">
                      {item.imageUrl && (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-12 h-12 object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-light">{item.name}</div>
                        <div className="text-xs text-muted-foreground">Size {item.size}</div>
                      </div>
                      <div className="text-sm font-medium">€{item.price.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-4">
          <span className="text-lg font-medium">€{totalPrice.toLocaleString()}</span>
          <Button 
            onClick={handleAddAllToCart}
            disabled={itemCount === 0}
            size="sm"
            className="gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Add All
          </Button>
        </div>
      </div>
    </div>
  );
};
