import { Shield, ExternalLink } from "lucide-react";

const ComplianceStatus = () => {
  return (
    <div className="mb-12 p-6 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-stone-200 dark:bg-stone-800">
          <Shield className="w-6 h-6 text-foreground" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-lg font-medium text-foreground">
                WCAG 2.1 AA CONFORMANCE
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Last accessibility audit: January 2025
              </p>
            </div>
            <a 
              href="#" 
              className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 transition-colors"
            >
              View Conformance Report
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceStatus;
