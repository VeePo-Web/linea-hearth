import { useEffect } from "react";
import LegalPageLayout from "@/components/legal/LegalPageLayout";
import ShippingCalculator from "@/components/shipping/ShippingCalculator";
import DeliveryConfidenceBadge from "@/components/shipping/DeliveryConfidenceBadge";
import ShippingOptionsGrid from "@/components/shipping/ShippingOptionsGrid";
import ShippingFAQ from "@/components/shipping/ShippingFAQ";
import { LegalSection } from "@/components/legal/LegalSection";

const ShippingInfo = () => {
  useEffect(() => {
    document.title = "Shipping Information - Linea Jewelry";
  }, []);

  return (
    <LegalPageLayout
      title="FAST. FREE. TRACKED."
      subtitle="Free shipping on orders over $75 • Tracked delivery • International shipping available"
      lastUpdated="January 2025"
    >
      {/* Delivery Confidence Badge */}
      <DeliveryConfidenceBadge />

      {/* Shipping Calculator */}
      <LegalSection id="calculator" title="Check Your Delivery Time">
        <ShippingCalculator />
      </LegalSection>

      {/* Shipping Options */}
      <LegalSection id="options" title="Shipping Options">
        <ShippingOptionsGrid />
      </LegalSection>

      {/* International Shipping */}
      <LegalSection id="international" title="International Shipping">
        <p>
          We ship to over 50 countries worldwide. International orders are 
          shipped via DHL or UPS with full tracking and delivery confirmation.
        </p>
        <div className="mt-6 space-y-4">
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Delivery Times</h4>
            <ul className="space-y-1">
              <li>Canada & Mexico: 5-10 business days</li>
              <li>Europe & UK: 7-14 business days</li>
              <li>Australia & Asia: 10-18 business days</li>
              <li>Rest of World: 14-21 business days</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Duties & Taxes</h4>
            <p>
              International orders may be subject to import duties, taxes, and customs 
              fees imposed by the destination country. These charges are the responsibility 
              of the recipient and are not included in the shipping cost.
            </p>
          </div>
        </div>
      </LegalSection>

      {/* Shipping FAQ */}
      <LegalSection id="faq" title="Shipping FAQ">
        <ShippingFAQ />
      </LegalSection>

      {/* Contact */}
      <LegalSection id="contact" title="Need Help?">
        <p>
          If you have questions about your shipment or need to make changes to your 
          delivery address, please contact our customer care team.
        </p>
        <div className="mt-4 space-y-1">
          <p className="text-foreground">Email: shipping@lineajewelry.com</p>
          <p className="text-foreground">Phone: +1 (212) 555-0123</p>
        </div>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default ShippingInfo;
