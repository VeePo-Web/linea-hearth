import { CheckCircle } from "lucide-react";

const DeliveryConfidenceBadge = () => {
  return (
    <div className="mb-12 p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
      <div className="flex items-center gap-3">
        <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
        <div>
          <p className="text-lg font-medium text-emerald-900 dark:text-emerald-100">
            98% ON-TIME DELIVERY
          </p>
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            Based on 10,000+ orders shipped this year
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryConfidenceBadge;
