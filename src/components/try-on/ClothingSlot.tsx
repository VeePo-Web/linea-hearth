import { useTryOnState, EquippedItem } from '@/hooks/useTryOnState';
import { cn } from '@/lib/utils';
import { Plus, X, ChevronRight } from 'lucide-react';

interface ClothingSlotProps {
  slot: 'head' | 'top' | 'outerwear' | 'bottom' | 'footwear';
  label: string;
  icon: React.ReactNode;
  onOpenDrawer: () => void;
}

export const ClothingSlot = ({ slot, label, icon, onOpenDrawer }: ClothingSlotProps) => {
  const { equippedItems, unequipItem, activeSlot, setActiveSlot } = useTryOnState();
  const equippedItem = equippedItems[slot];
  const isActive = activeSlot === slot;

  const handleClick = () => {
    setActiveSlot(slot);
    onOpenDrawer();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    unequipItem(slot);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative flex items-center gap-3 p-3 border cursor-pointer transition-all duration-200",
        isActive
          ? "border-foreground bg-muted"
          : "border-border hover:border-foreground hover:bg-muted/50",
        equippedItem && "bg-muted/30"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 w-10 h-10 flex items-center justify-center border",
        equippedItem ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"
      )}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">
          {label}
        </div>
        {equippedItem ? (
          <div className="flex items-center justify-between">
            <div className="truncate text-sm font-light">{equippedItem.name}</div>
            <div className="text-sm font-medium ml-2">${equippedItem.price.toLocaleString()}</div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground font-light flex items-center">
            <Plus className="w-3 h-3 mr-1" />
            Add item
          </div>
        )}
      </div>

      {/* Remove button or chevron */}
      {equippedItem ? (
        <button
          onClick={handleRemove}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Remove item"
        >
          <X className="w-4 h-4" />
        </button>
      ) : (
        <ChevronRight className="flex-shrink-0 w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      )}
    </div>
  );
};
