import { useState } from "react";
import { Gift, ChevronDown, ChevronUp, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { BundleMatch } from "@/hooks/useBundleDiscounts";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface BundleProgressProps {
  bundle: BundleMatch;
  variant?: "drawer" | "checkout";
}

const BundleProgress = ({ bundle, variant = "drawer" }: BundleProgressProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  
  const progress = (bundle.itemsInCart.length / bundle.totalItemsInLook) * 100;
  const hasDiscount = bundle.savingsAmount > 0;
  const canUpgrade = bundle.nextTierDiscountPercent && bundle.nextTierItemsNeeded > 0;
  
  // Calculate potential additional savings if they complete the bundle
  const currentItemsTotal = bundle.itemsInCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const avgItemPrice = currentItemsTotal / bundle.itemsInCart.length || 50;
  const potentialTotal = currentItemsTotal + (bundle.missingProductIds.length * avgItemPrice);
  const potentialSavings = potentialTotal * (bundle.discountPercent / 100);

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "border rounded-lg overflow-hidden",
        hasDiscount 
          ? "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20" 
          : "border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20"
      )}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-black/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={hasDiscount ? { 
              scale: [1, 1.1, 1],
              rotate: [0, -5, 5, 0]
            } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Gift className={cn(
              "w-4 h-4",
              hasDiscount ? "text-emerald-600" : "text-amber-600"
            )} />
          </motion.div>
          
          <div className="text-left">
            <p className={cn(
              "text-xs font-medium",
              hasDiscount ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
            )}>
              {hasDiscount ? (
                <>Bundle Discount Applied — Save €{bundle.savingsAmount.toFixed(2)}</>
              ) : (
                <>Complete Look & Save {bundle.discountPercent}%</>
              )}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              "{bundle.lookName}" — {bundle.itemsInCart.length} of {bundle.totalItemsInLook} items
            </p>
          </div>
        </div>
        
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      
      {/* Progress Bar */}
      <div className="px-4 pb-3">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "h-full rounded-full",
              hasDiscount 
                ? "bg-gradient-to-r from-emerald-500 to-emerald-400" 
                : "bg-gradient-to-r from-amber-500 to-amber-400"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        
        {/* Next tier hint */}
        {canUpgrade && !bundle.isComplete && (
          <p className="text-[10px] text-muted-foreground mt-2">
            Add {bundle.nextTierItemsNeeded} more to unlock {bundle.nextTierDiscountPercent}% off
          </p>
        )}
      </div>
      
      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
              {/* Items in cart */}
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                  In Your Bag
                </p>
                {bundle.itemsInCart.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-xs">
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-foreground/80 truncate flex-1">{item.name}</span>
                    <span className="text-muted-foreground">Size {item.size}</span>
                  </div>
                ))}
              </div>
              
              {/* Missing items */}
              {bundle.missingProductIds.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                    Missing ({bundle.missingProductIds.length})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Add {bundle.missingProductIds.length} more item{bundle.missingProductIds.length > 1 ? 's' : ''} to 
                    {!hasDiscount ? ' unlock' : ' maximize'} your bundle discount
                  </p>
                  <Link
                    to="/lookbook"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline mt-1"
                  >
                    <Plus className="w-3 h-3" />
                    Browse Lookbook
                  </Link>
                </div>
              )}
              
              {/* Savings breakdown */}
              {hasDiscount && (
                <div className="pt-2 border-t border-border/50">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Bundle items subtotal</span>
                    <span className="text-foreground">€{currentItemsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-emerald-600 font-medium">{bundle.discountPercent}% bundle discount</span>
                    <span className="text-emerald-600 font-medium">-€{bundle.savingsAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BundleProgress;
