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
import PageSEO from "@/components/seo/PageSEO";

const heroValueProps = [
  { icon: Truck, text: "Free Over $250" },
  { icon: Clock, text: "2-5 Days Production" },
  { icon: Package, text: "Full Tracking" },
  { icon: Globe, text: "Canada & Worldwide" },
];

const orderJourneySteps = [
  {
    number: "01",
    icon: CheckCircle,
    title: "ORDER CONFIRMED",
    description: "Order confirmed. Production begins within 24 hours."
  },
  {
    number: "02",
    icon: Package,
    title: "PRODUCTION",
    description: "Your items are carefully made. This takes 2-5 business days."
  },
  {
    number: "03",
    icon: Truck,
    title: "IN TRANSIT",
    description: "Full tracking active. You'll know exactly where your order is."
  },
  {
    number: "04",
    icon: MapPin,
    title: "DELIVERED",
    description: "Delivered to your door."
  }
];

const shippingOptions = [
  {
    icon: Truck,
    title: "CANADA — STANDARD",
    description: "Calculated by item type. Hats from $6.50, tees from $7, hoodies from $12 CAD — with a small additional charge per extra unit. 5-9 business days total (2-5 production + 3-4 shipping). Full tracking.",
    variant: "default" as const,
    badge: "BY ITEM",
  },
  {
    icon: Globe,
    title: "INTERNATIONAL — STANDARD",
    description: "Calculated by item type. Hats from $12, tees from $13, hoodies from $22 CAD — with a small additional charge per extra unit. 10-21 business days total (2-5 production + intl transit). Full tracking.",
    variant: "default" as const,
    badge: "BY ITEM",
  },
  {
    icon: Rocket,
    title: "FREE SHIPPING",
    description: "Any order with a subtotal over $250 CAD ships free — Canada or international, no code needed.",
    variant: "accent" as const,
    badge: "OVER $250",
  },
];

const internationalRegions = [
  {
    icon: MapPin,
    title: "NORTH AMERICA",
    description: "Canada & Mexico: 8-14 business days with full tracking."
  },
  {
    icon: MapPin,
    title: "EUROPE & UK",
    description: "10-18 business days. Express options available for faster delivery."
  },
  {
    icon: MapPin,
    title: "ASIA-PACIFIC",
    description: "Australia, Japan, Korea, Singapore: 12-21 business days."
  },
  {
    icon: MapPin,
    title: "BEYOND CANADA",
    description: "Rest of world: 14-25 business days. Contact us for specific regions."
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
    <>
      <PageSEO
        title="Shipping Info | Line of Judah"
        description="Flat $15 CAD shipping across Canada. Flat $40 CAD international. Free shipping on orders over $250 CAD. Full tracking on every order."
        path="/shipping"
      />
      <ServicePageLayout
      title="Reliable Delivery. Every Order."
      subtitle="Flat $15 across Canada · Flat $40 international · Free shipping over $250. Full tracking. Designed in Calgary, delivered worldwide."
      eyebrow="SHIPPING & DELIVERY"
      heroAlignment="center"
      heroValueProps={heroValueProps}
    >
      {/* Delivery Confidence Strip */}
      <div className="mb-12 p-4 bg-foreground/5 border border-foreground/10 text-center">
        <div className="flex items-center justify-center gap-3">
          <CheckCircle className="w-5 h-5 text-foreground flex-shrink-0" />
          <p className="text-sm font-medium text-foreground/80 tracking-wide">
            Proudly shipped from Calgary — every order packed with care
          </p>
        </div>
      </div>

      {/* Order Journey StepFlow */}
      <ServiceSection id="journey" title="Your Order's Journey" size="compact">
        <StepFlow steps={orderJourneySteps} variant="default" />
      </ServiceSection>

      {/* Shipping Calculator */}
      <ServiceSection id="calculator" title="Calculate Your Delivery Time">
        <p className="text-muted-foreground font-light mb-6">
          Enter your ZIP code to see estimated delivery times for your location.
        </p>
        <ShippingCalculator />
      </ServiceSection>

      {/* Shipping Options Grid */}
      <ServiceSection id="options" title="Shipping Options">
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
                  ? 'text-white'
                  : 'text-muted-foreground'
              }`}>
                {option.badge}
              </span>
            </div>
          ))}
        </div>
      </ServiceSection>

      {/* International Shipping */}
      <ServiceSection id="international" title="International Shipping">
        <p className="text-muted-foreground font-light mb-6">
          Designed in Calgary, we ship across Canada and to 50+ countries beyond. All international shipments include full tracking and delivery confirmation.
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
      <ServiceSection id="faq" title="Frequently Asked Questions">
        <ShippingFAQ />
      </ServiceSection>

      {/* Tracking CTA */}
      <ActionCTA
        title="Need Tracking Support?"
        subtitle="Enter your order number to check real-time status, or contact our support team directly."
        alignment="center"
        showInput
        inputPlaceholder="Order number (e.g., #LOJ-12345)"
        buttonText="CHECK STATUS"
        onSubmit={handleTrackOrder}
        footerText="Or contact"
        footerLinks={[
          { text: "1.lineofjudah.1@gmail.com", href: "mailto:1.lineofjudah.1@gmail.com", isExternal: true }
        ]}
      />
    </ServicePageLayout>
    </>
  );
};

export default ShippingInfo;
