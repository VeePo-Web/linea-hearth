import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Package, Clock, AlertCircle } from "lucide-react";
import { addDays, format } from "date-fns";

interface ShippingEstimate {
  method: string;
  minDays: number;
  maxDays: number;
  price: string;
  carrier: string;
}

const ShippingCalculator = () => {
  const [zipCode, setZipCode] = useState("");
  const [estimates, setEstimates] = useState<ShippingEstimate[] | null>(null);
  const [error, setError] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateDelivery = (zip: string): ShippingEstimate[] => {
    // Client-side calculation based on ZIP code region
    const firstDigit = zip[0];
    const isWestCoast = ["9", "8"].includes(firstDigit);
    const isMidwest = ["5", "6", "7"].includes(firstDigit);
    
    let standardDays = { min: 3, max: 5 };
    let expressDays = { min: 2, max: 3 };
    
    if (isWestCoast) {
      standardDays = { min: 5, max: 7 };
      expressDays = { min: 3, max: 4 };
    } else if (isMidwest) {
      standardDays = { min: 4, max: 6 };
      expressDays = { min: 2, max: 3 };
    }

    return [
      {
        method: "Standard Shipping",
        minDays: standardDays.min,
        maxDays: standardDays.max,
        price: "Free over $75",
        carrier: "USPS Priority Mail"
      },
      {
        method: "Express Shipping",
        minDays: expressDays.min,
        maxDays: expressDays.max,
        price: "$12.99",
        carrier: "FedEx 2-Day"
      },
      {
        method: "Overnight",
        minDays: 1,
        maxDays: 1,
        price: "$24.99",
        carrier: "FedEx Overnight"
      }
    ];
  };

  const handleCalculate = () => {
    setError("");
    
    // Validate ZIP code
    if (!/^\d{5}$/.test(zipCode)) {
      setError("Please enter a valid 5-digit ZIP code");
      return;
    }

    setIsCalculating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const result = calculateDelivery(zipCode);
      setEstimates(result);
      setIsCalculating(false);
    }, 500);
  };

  const getDeliveryDate = (days: number) => {
    const deliveryDate = addDays(new Date(), days);
    return format(deliveryDate, "EEE, MMM d");
  };

  const getOrderByMessage = () => {
    const now = new Date();
    const cutoffHour = 14; // 2 PM EST cutoff
    
    if (now.getHours() < cutoffHour) {
      return "Order by 2:00 PM EST for same-day processing";
    }
    return "Orders placed today will ship tomorrow";
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter ZIP code"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
            className="pl-10 h-12 font-light"
            maxLength={5}
          />
        </div>
        <Button 
          onClick={handleCalculate}
          disabled={isCalculating}
          className="h-12 px-8"
        >
          {isCalculating ? "CALCULATING..." : "CALCULATE ETA"}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Results */}
      {estimates && (
        <div className="space-y-4 pt-4 border-t border-border">
          {/* Order By Message */}
          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500">
            <Clock className="w-4 h-4" />
            {getOrderByMessage()}
          </div>

          {/* Delivery Options */}
          <div className="space-y-3">
            {estimates.map((estimate) => (
              <div 
                key={estimate.method}
                className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-900"
              >
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{estimate.method}</p>
                    <p className="text-sm text-muted-foreground">{estimate.carrier}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{estimate.price}</p>
                  <p className="text-sm text-muted-foreground">
                    {estimate.minDays === estimate.maxDays 
                      ? getDeliveryDate(estimate.minDays)
                      : `${getDeliveryDate(estimate.minDays)} - ${getDeliveryDate(estimate.maxDays)}`
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery to ZIP */}
          <p className="text-xs text-muted-foreground text-center">
            Estimated delivery to {zipCode}. Actual delivery times may vary.
          </p>
        </div>
      )}
    </div>
  );
};

export default ShippingCalculator;
