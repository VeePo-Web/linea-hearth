import { User, Package, CreditCard, BarChart3 } from "lucide-react";

const dataTypes = [
  { icon: User, label: "Contact Info", description: "Name, email, phone" },
  { icon: Package, label: "Order History", description: "Purchases, preferences" },
  { icon: CreditCard, label: "Payment Data", description: "Securely processed" },
  { icon: BarChart3, label: "Usage Analytics", description: "Site interactions" }
];

const DataSummaryCard = () => {
  return (
    <div className="mb-12 p-6 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
      <h3 className="text-xs font-medium tracking-widest text-muted-foreground mb-6">
        WHAT WE COLLECT
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {dataTypes.map((type) => {
          const Icon = type.icon;
          return (
            <div key={type.label} className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-stone-200 dark:bg-stone-800 mb-2">
                <Icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-foreground">{type.label}</p>
              <p className="text-xs text-muted-foreground">{type.description}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-700 text-center">
        <p className="text-sm font-medium text-foreground">
          We never sell your data. Ever.
        </p>
      </div>
    </div>
  );
};

export default DataSummaryCard;
