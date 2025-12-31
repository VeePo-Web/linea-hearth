import { Shield, Lock, CreditCard, Truck } from "lucide-react";

const GuaranteeBadge = () => {
  const trustSignals = [
    { icon: Lock, label: "Secure Checkout" },
    { icon: CreditCard, label: "Encrypted Payment" },
    { icon: Truck, label: "Fast Shipping" },
  ];

  return (
    <section className="w-full py-12 lg:py-16 px-6 bg-muted/30">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Guarantee */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-foreground" strokeWidth={1.5} />
          <h2 className="text-xl lg:text-2xl font-light text-foreground">
            30-Day Risk-Free Ministry Test
          </h2>
        </div>

        <p className="text-sm font-light text-muted-foreground max-w-xl mx-auto mb-8">
          Not feeling called? No problem. Return any unworn item within 30 days for a full refund, no questions asked. 
          Your faith journey is personal—we're here to support it.
        </p>

        {/* Trust Signals */}
        <div className="flex items-center justify-center gap-8 lg:gap-12 flex-wrap">
          {trustSignals.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-muted-foreground">
              <Icon className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-xs font-light">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GuaranteeBadge;
