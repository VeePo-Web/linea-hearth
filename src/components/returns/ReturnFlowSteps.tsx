import { Mail, Package, Truck, CreditCard } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Mail,
    title: "START",
    subtitle: "Start Your Return Online",
    description: "Enter your order number and select items to return",
  },
  {
    number: "02",
    icon: Package,
    title: "PACK",
    subtitle: "Pack It Up",
    description: "Place items in original packaging or a secure box",
  },
  {
    number: "03",
    icon: Truck,
    title: "SHIP",
    subtitle: "Drop It Off",
    description: "Use our prepaid label at any USPS or FedEx location",
  },
  {
    number: "04",
    icon: CreditCard,
    title: "REFUND",
    subtitle: "Get Your Refund",
    description: "Refund processed in 5-7 days after we receive it",
  },
];

const ReturnFlowSteps = () => {
  return (
    <div className="relative">
      {/* Desktop: Horizontal */}
      <div className="hidden md:flex items-start justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.number} className="flex-1 relative">
              <div className="flex flex-col items-center text-center">
                {/* Number and Icon */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 border-2 border-stone-900 dark:border-stone-100 flex items-center justify-center">
                    <Icon className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  <span className="absolute -top-3 -left-3 text-xs font-medium bg-amber-500 text-white px-2 py-0.5">
                    {step.number}
                  </span>
                </div>

                {/* Text */}
                <h3 className="text-sm font-medium tracking-widest mb-2">
                  {step.title}
                </h3>
                <p className="text-sm font-light text-muted-foreground max-w-[140px]">
                  {step.description}
                </p>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="absolute top-10 left-[60%] w-[80%] border-t border-dashed border-stone-300 dark:border-stone-700" />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: Vertical */}
      <div className="md:hidden space-y-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.number} className="relative flex gap-6">
              {/* Icon */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 border-2 border-stone-900 dark:border-stone-100 flex items-center justify-center">
                  <Icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <span className="absolute -top-2 -left-2 text-xs font-medium bg-amber-500 text-white px-2 py-0.5">
                  {step.number}
                </span>
                
                {/* Vertical connector */}
                {!isLast && (
                  <div className="absolute top-full left-1/2 w-px h-8 border-l border-dashed border-stone-300 dark:border-stone-700" />
                )}
              </div>

              {/* Text */}
              <div className="pt-2">
                <h3 className="text-sm font-medium tracking-widest mb-1">
                  {step.title}
                </h3>
                <p className="text-sm font-light text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReturnFlowSteps;
