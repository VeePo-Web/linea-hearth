import { Truck, Zap, Rocket, Globe } from "lucide-react";

const shippingOptions = [
  {
    icon: Truck,
    name: "Standard",
    timeframe: "5-7 business days",
    cost: "Free over $75",
    details: "USPS Priority Mail",
    highlight: true
  },
  {
    icon: Zap,
    name: "Express",
    timeframe: "2-3 business days",
    cost: "$12.99",
    details: "FedEx 2-Day"
  },
  {
    icon: Rocket,
    name: "Overnight",
    timeframe: "1 business day",
    cost: "$24.99",
    details: "FedEx Overnight"
  },
  {
    icon: Globe,
    name: "International",
    timeframe: "7-14 business days",
    cost: "Calculated at checkout",
    details: "DHL / UPS"
  }
];

const ShippingOptionsGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {shippingOptions.map((option) => {
        const Icon = option.icon;
        return (
          <div 
            key={option.name}
            className={`p-6 border ${
              option.highlight 
                ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/10" 
                : "border-border bg-stone-50 dark:bg-stone-900"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 ${
                option.highlight 
                  ? "bg-amber-100 dark:bg-amber-900/30" 
                  : "bg-stone-200 dark:bg-stone-800"
              }`}>
                <Icon className={`w-5 h-5 ${
                  option.highlight 
                    ? "text-amber-600 dark:text-amber-500" 
                    : "text-muted-foreground"
                }`} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-foreground">{option.name}</h4>
                  {option.highlight && (
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-500">
                      MOST POPULAR
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{option.timeframe}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{option.cost}</span>
                  <span className="text-xs text-muted-foreground">{option.details}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ShippingOptionsGrid;
