import { Sparkles } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface SavingsSummaryProps {
  discountAmount?: number;
}

const SavingsSummary = ({ discountAmount = 0 }: SavingsSummaryProps) => {
  const { hasFreeShipping, freeShippingThreshold } = useCart();
  
  // Calculate total savings (discount + free shipping value if applicable)
  const shippingValue = hasFreeShipping ? 15 : 0; // Standard shipping value
  const totalSavings = discountAmount + shippingValue;

  if (totalSavings <= 0) return null;

  return (
    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="p-1 bg-emerald-500 rounded-full">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
          You're saving ${totalSavings.toLocaleString()} on this order!
        </span>
      </div>
      
      {/* Breakdown */}
      <div className="mt-2 space-y-1 text-xs text-emerald-600 dark:text-emerald-500">
        {discountAmount > 0 && (
          <div className="flex justify-between">
            <span>Discount applied</span>
            <span>-${discountAmount.toLocaleString()}</span>
          </div>
        )}
        {hasFreeShipping && (
          <div className="flex justify-between">
            <span>Free shipping (orders over ${freeShippingThreshold})</span>
            <span>-${shippingValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavingsSummary;
