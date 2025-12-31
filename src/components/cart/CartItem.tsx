import { Minus, Plus, X } from "lucide-react";
import { useCart, CartItem as CartItemType } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CartItemProps {
  item: CartItemType;
}

const LOW_STOCK_THRESHOLD = 5;

const CartItem = ({ item }: CartItemProps) => {
  const { updateQuantity, removeItem, lastAddedItem } = useCart();
  const [isRemoving, setIsRemoving] = useState(false);
  
  const isJustAdded = lastAddedItem?.id === item.id;
  const isLowStock = item.stock !== undefined && item.stock <= LOW_STOCK_THRESHOLD && item.stock > 0;

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => removeItem(item.id), 200);
  };

  const handleDecrease = () => {
    if (item.quantity === 1) {
      handleRemove();
    } else {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  return (
    <div 
      className={cn(
        "flex gap-4 py-4 transition-all duration-200",
        isRemoving && "opacity-0 -translate-x-4",
        isJustAdded && "animate-pulse bg-emerald-50/50 -mx-2 px-2 rounded"
      )}
    >
      {/* Thumbnail */}
      <div className="relative w-20 h-24 bg-muted/20 overflow-hidden flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Color swatch overlay if color exists */}
        {item.color && (
          <div 
            className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-white shadow-sm"
            style={{ backgroundColor: item.color }}
          />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.category}</p>
            <h3 className="text-sm font-medium text-foreground truncate">{item.name}</h3>
            
            {/* Variant info */}
            {(item.size || item.color) && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.size && <span>Size: {item.size}</span>}
                {item.size && item.color && <span> / </span>}
                {item.color && <span>Color: {item.color}</span>}
              </p>
            )}
            
            {/* Low stock badge */}
            {isLowStock && (
              <p className="text-xs text-amber-600 font-medium mt-1">
                Only {item.stock} left
              </p>
            )}
          </div>

          {/* Remove button */}
          <button
            onClick={handleRemove}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Remove item"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quantity + Price row */}
        <div className="flex items-center justify-between mt-3">
          {/* Quantity controls */}
          <div className="flex items-center border border-border">
            <button
              onClick={handleDecrease}
              className="p-2 hover:bg-muted/50 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="px-3 py-1.5 text-sm font-medium min-w-[32px] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="p-2 hover:bg-muted/50 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Price */}
          <span className="text-sm font-medium text-foreground">
            {item.priceFormatted}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
