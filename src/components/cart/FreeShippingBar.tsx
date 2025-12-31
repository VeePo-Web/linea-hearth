import { Truck, Check, Sparkles } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const FreeShippingBar = () => {
  const { subtotal, freeShippingThreshold, amountToFreeShipping, hasFreeShipping } = useCart();
  const [showCelebration, setShowCelebration] = useState(false);
  const [prevHasFreeShipping, setPrevHasFreeShipping] = useState(hasFreeShipping);

  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  // Trigger celebration animation when threshold is reached
  useEffect(() => {
    if (hasFreeShipping && !prevHasFreeShipping) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 2000);
      return () => clearTimeout(timer);
    }
    setPrevHasFreeShipping(hasFreeShipping);
  }, [hasFreeShipping, prevHasFreeShipping]);

  return (
    <div className="px-6 py-4 border-b border-border bg-muted/30">
      {/* Progress bar container */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden mb-3">
        {/* Animated fill */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out",
            hasFreeShipping 
              ? "bg-gradient-to-r from-emerald-500 to-emerald-400" 
              : "bg-gradient-to-r from-amber-500 to-amber-400"
          )}
          style={{ width: `${progress}%` }}
        />
        
        {/* Shimmer effect on progress */}
        {!hasFreeShipping && progress > 0 && (
          <div 
            className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
            style={{ width: `${progress}%` }}
          />
        )}
      </div>

      {/* Text + icon */}
      <div className="flex items-center justify-center gap-2 text-sm">
        {hasFreeShipping ? (
          <>
            <div className={cn(
              "flex items-center gap-2",
              showCelebration && "animate-bounce"
            )}>
              {showCelebration && <Sparkles className="h-4 w-4 text-amber-500" />}
              <Check className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-emerald-600">Free shipping unlocked!</span>
              {showCelebration && <Sparkles className="h-4 w-4 text-amber-500" />}
            </div>
          </>
        ) : (
          <>
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              You're <span className="font-medium text-foreground">€{amountToFreeShipping.toFixed(0)}</span> away from FREE shipping
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default FreeShippingBar;
