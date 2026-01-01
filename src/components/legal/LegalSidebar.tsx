import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  HelpCircle, 
  Truck, 
  RotateCcw, 
  FileText, 
  Shield, 
  Accessibility 
} from "lucide-react";

const legalPages = [
  { name: "FAQ", path: "/faq", icon: HelpCircle },
  { name: "Shipping", path: "/shipping", icon: Truck },
  { name: "Returns & Exchanges", path: "/returns", icon: RotateCcw },
  { name: "Terms of Service", path: "/terms-of-service", icon: FileText },
  { name: "Privacy Policy", path: "/privacy-policy", icon: Shield },
  { name: "Accessibility", path: "/accessibility", icon: Accessibility },
];

const LegalSidebar = () => {
  const location = useLocation();

  return (
    <nav className="sticky top-24">
      <h3 className="text-xs font-medium tracking-widest text-muted-foreground mb-6">
        HELP & LEGAL
      </h3>
      <ul className="space-y-1">
        {legalPages.map((page) => {
          const isActive = location.pathname === page.path;
          const Icon = page.icon;
          
          return (
            <li key={page.path}>
              <Link
                to={page.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-light transition-colors rounded-none border-l-2",
                  isActive 
                    ? "border-amber-500 bg-amber-500/5 text-foreground" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-stone-300"
                )}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                {page.name}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Contact Card */}
      <div className="mt-12 p-6 bg-stone-100 dark:bg-stone-900">
        <h4 className="text-sm font-medium mb-2">Need Help?</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Our team is here for you.
        </p>
        <a 
          href="mailto:hello@lineofjudah.com"
          className="text-sm text-amber-600 hover:text-amber-700 transition-colors"
        >
          hello@lineofjudah.com
        </a>
      </div>
    </nav>
  );
};

export default LegalSidebar;
