import { useEffect } from "react";
import { Truck, Clock, Globe, Shield, Package, Zap, Rocket, MapPin, AlertTriangle } from "lucide-react";
import ServicePageLayout from "@/components/service/ServicePageLayout";
import ServiceSection from "@/components/service/ServiceSection";
import StepFlow from "@/components/service/StepFlow";
import InfoCard from "@/components/service/InfoCard";
import ActionCTA from "@/components/service/ActionCTA";
import ShippingCalculator from "@/components/shipping/ShippingCalculator";
import ShippingFAQ from "@/components/shipping/ShippingFAQ";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";

const heroValueProps = [
  { icon: Truck, text: "Free Over $75" },
  { icon: Clock, text: "Same-Day Processing" },
  { icon: Package, text: "Full Tracking" },
  { icon: Globe, text: "50+ Countries" },
];

const orderJourneySteps = [
  {
    number: "01",
    icon: CheckCircle,
    title: "ORDER CONFIRMED",
    description: "Your gear is locked in. We start packing immediately."
  },
  {
    number: "02",
    icon: Package,
    title: "PROCESSING",
    description: "Same-day handling for orders before 2 PM EST."
  },
  {
    number: "03",
    icon: Truck,
    title: "IN TRANSIT",
    description: "Full tracking active. You know where it is at all times."
  },
  {
    number: "04",
    icon: MapPin,
    title: "DELIVERED",
    description: "Armor arrives. Mission ready."
  }
];

const shippingOptions = [
  {
    icon: Truck,
    title: "GROUND OPS",
    description: "5-7 business days via USPS Priority Mail. The reliable standard.",
    variant: "default" as const,
    badge: "FREE OVER $75"
  },
  {
    icon: Zap,
    title: "RAPID DEPLOY",
    description: "2-3 business days via FedEx 2-Day. When you need it fast.",
    variant: "default" as const,
    badge: "$12.99"
  },
  {
    icon: Rocket,
    title: "PRIORITY EXTRACTION",
    description: "Next business day via FedEx Overnight. Mission-critical speed.",
    variant: "accent" as const,
    badge: "$24.99"
  },
  {
    icon: Globe,
    title: "GLOBAL REACH",
    description: "7-14 business days via DHL/UPS. We ship to 50+ countries.",
    variant: "default" as const,
    badge: "CALCULATED"
  }
];

const internationalRegions = [
  {
    icon: MapPin,
    title: "NORTH AMERICA",
    description: "Canada & Mexico: 5-10 business days with full tracking."
  },
  {
    icon: MapPin,
    title: "EUROPE & UK",
    description: "7-14 business days. DHL Express available for faster delivery."
  },
  {
    icon: MapPin,
    title: "ASIA-PACIFIC",
    description: "Australia, Japan, Korea, Singapore: 10-18 business days."
  },
  {
    icon: MapPin,
    title: "WORLDWIDE",
    description: "Rest of world: 14-21 business days. Contact us for specific regions."
  }
];

const ShippingInfo = () => {
  useEffect(() => {
    document.title = "Shipping & Delivery - Line of Judah";
  }, []);

  const handleTrackOrder = (orderNumber: string) => {
    if (orderNumber.trim()) {
      toast.info(`Tracking lookup for ${orderNumber} - This feature will be connected to your order system.`);
    }
  };

  return (
    <ServicePageLayout
      title="YOUR ARMOR ARRIVES. ON TIME. EVERY TIME."
      subtitle="We move like the mission depends on it. Free deployment over $75. Full tracking on every package. Global reach to 50+ countries."
      eyebrow="DEPLOYMENT LOGISTICS"
      heroAlignment="center"
      heroValueProps={heroValueProps}
    >
      {/* Delivery Confidence Strip */}
      <div className="mb-12 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-center">
        <div className="flex items-center justify-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 tracking-wide">
            98% ON-TIME DELIVERY RATE — 10,000+ PACKAGES DEPLOYED THIS YEAR
          </p>
        </div>
      </div>

      {/* Order Journey StepFlow */}
      <ServiceSection id="journey" title="YOUR ORDER'S JOURNEY" size="compact">
        <StepFlow steps={orderJourneySteps} variant="default" />
      </ServiceSection>

      {/* Shipping Calculator */}
      <ServiceSection id="calculator" title="CALCULATE YOUR ETA">
        <p className="text-muted-foreground font-light mb-6">
          Enter your ZIP code to see estimated delivery times for your location.
        </p>
        <ShippingCalculator />
      </ServiceSection>

      {/* Shipping Options Grid */}
      <ServiceSection id="options" title="DEPLOYMENT SPEED">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shippingOptions.map((option) => (
            <div key={option.title} className="relative">
              <InfoCard
                icon={option.icon}
                title={option.title}
                description={option.description}
                variant={option.variant}
              />
              <span className={`absolute top-4 right-4 text-xs font-medium tracking-wide ${
                option.variant === 'accent' 
                  ? 'text-amber-600 dark:text-amber-500' 
                  : 'text-muted-foreground'
              }`}>
                {option.badge}
              </span>
            </div>
          ))}
        </div>
      </ServiceSection>

      {/* International Shipping */}
      <ServiceSection id="international" title="GLOBAL OPERATIONS">
        <p className="text-muted-foreground font-light mb-6">
          We deploy to over 50 countries worldwide. All international shipments include full tracking and delivery confirmation.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {internationalRegions.map((region) => (
            <InfoCard
              key={region.title}
              icon={region.icon}
              title={region.title}
              description={region.description}
              variant="default"
              size="sm"
            />
          ))}
        </div>

        {/* Duties & Taxes Note */}
        <InfoCard
          icon={AlertTriangle}
          title="DUTIES & CUSTOMS"
          description="International orders may be subject to import duties, taxes, and customs fees imposed by the destination country. These charges are the responsibility of the recipient and are not included in the shipping cost. We recommend checking your country's import regulations before ordering."
          variant="muted"
        />
      </ServiceSection>

      {/* Shipping FAQ */}
      <ServiceSection id="faq" title="LOGISTICS INTEL">
        <ShippingFAQ />
      </ServiceSection>

      {/* Tracking CTA */}
      <ActionCTA
        title="NEED TRACKING SUPPORT?"
        subtitle="Enter your order number to check real-time status, or contact our logistics team directly."
        alignment="center"
        showInput
        inputPlaceholder="Order number (e.g., #LOJ-12345)"
        buttonText="CHECK STATUS"
        onSubmit={handleTrackOrder}
        footerText="Or contact"
        footerLinks={[
          { text: "logistics@lineofjudah.com", href: "mailto:shipping@lineofjudah.com", isExternal: true }
        ]}
      />
    </ServicePageLayout>
  );
};

export default ShippingInfo;
