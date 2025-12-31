import { Lock, Shield } from "lucide-react";

const CheckoutTrustBadges = () => {
  return (
    <div className="flex items-center gap-4 text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <Lock className="h-4 w-4" />
        <span className="text-xs hidden sm:inline">Secure</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Shield className="h-4 w-4" />
        <span className="text-xs hidden sm:inline">Protected</span>
      </div>
    </div>
  );
};

export default CheckoutTrustBadges;
