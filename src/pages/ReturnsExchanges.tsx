import { useEffect } from "react";
import { Mail, Package, Truck, CreditCard, Shield, CheckCircle, RotateCcw, Clock } from "lucide-react";
import { ServicePageLayout, ServiceSection, InfoCard, ActionCTA, StepFlow } from "@/components/service";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PageSEO from "@/components/seo/PageSEO";

const returnSteps = [
  {
    icon: Mail,
    title: "CONTACT US",
    description: "Email us with your order number, a brief description of the issue, and photos or video where relevant.",
  },
  {
    icon: Clock,
    title: "AWAIT APPROVAL",
    description: "We review every request within 3 business days and reply with the correct return address and instructions.",
  },
  {
    icon: Truck,
    title: "SHIP BACK",
    description: "Pack the piece in its original condition and ship to the address we provide. Return shipping is the customer's responsibility.",
  },
  {
    icon: CreditCard,
    title: "REFUND",
    description: "Once your return arrives and passes inspection, we refund the full product cost to your original payment method in CAD.",
  },
];

const heroValueProps = [
  { icon: Shield, text: "90-Day Window" },
  { icon: CheckCircle, text: "Full Product Refund" },
  { icon: RotateCcw, text: "Exchanges Honored" },
];

const quickQuestions = [
  {
    icon: Clock,
    title: "How Long Do I Have?",
    description: "90 days from delivery for returns and refunds. 3 days from delivery for misprint, damage, defect, or lost-package claims.",
    variant: "default" as const,
  },
  {
    icon: Package,
    title: "What Condition Must It Be In?",
    description: "Unused, unworn, unwashed, and in original condition. Worn, stained, altered, or misuse-damaged pieces will not be accepted.",
    variant: "default" as const,
  },
  {
    icon: CreditCard,
    title: "When Does the Refund Hit?",
    description: "Issued to your original payment method in the original purchase currency (CAD) after the return passes inspection. Processing time depends on your bank.",
    variant: "accent" as const,
  },
  {
    icon: CheckCircle,
    title: "Who Pays Return Shipping?",
    description: "The customer. We do not provide freight-to-collect (FTC) service. The full product cost is refunded once your return arrives and passes inspection.",
    variant: "default" as const,
  },
];

const ReturnsExchanges = () => {
  useEffect(() => {
    document.title = "Returns & Exchanges - Line of Judah";
  }, []);

  const handleReturnSubmit = (_orderNumber: string) => {
    // TODO: Implement return flow
  };

  return (
    <>
      <PageSEO
        title="Returns & Exchanges | Line of Judah"
        description="Return or refund eligible pieces within 90 days of delivery. Read the Line of Judah returns policy and start a return."
        path="/returns"
      />
      <ServicePageLayout
        title="Returns Done Right."
        subtitle="If something isn't right, we'll make it right. You have 90 days from delivery to request a return or refund."
        eyebrow="RETURNS & EXCHANGES"
        heroAlignment="center"
        heroValueProps={heroValueProps}
      >
        {/* StepFlow Section */}
        <div className="p-8 md:p-12 bg-stone-50 dark:bg-stone-900/30 mb-16 -mx-6 lg:mx-0">
          <h2 className="text-sm font-medium tracking-widest text-center mb-10 uppercase">
            How Returns Work
          </h2>
          <StepFlow steps={returnSteps} />
        </div>

        {/* Policy Details */}
        <ServiceSection id="policy" title="Return Policy Details">
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="timeframe" className="border border-border px-6">
              <AccordionTrigger className="text-left font-light py-5 hover:no-underline">
                Return & Refund Request Timeframe
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                <p className="mb-4">
                  You may request a return or refund within <strong>90 days after the order has been delivered</strong>.
                </p>
                <p className="mb-2">For issues related to:</p>
                <ul className="space-y-2 mb-4">
                  <li>• Misprinted items</li>
                  <li>• Damaged products</li>
                  <li>• Defective items</li>
                  <li>• Lost packages</li>
                </ul>
                <p>
                  Claims should be submitted within <strong>3 days of delivery</strong> so we can investigate and resolve quickly.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="process" className="border border-border px-6">
              <AccordionTrigger className="text-left font-light py-5 hover:no-underline">
                Return Process
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                <p className="mb-4">
                  Once your request has been reviewed and approved, our team will provide the correct return address and return instructions.
                </p>
                <ul className="space-y-2">
                  <li>• Returns sent without prior approval may not be accepted.</li>
                  <li>• Unauthorized returns are not accepted.</li>
                  <li>• We review and process requests within <strong>3 business days</strong>.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="conditions" className="border border-border px-6">
              <AccordionTrigger className="text-left font-light py-5 hover:no-underline">
                Conditions for Returned Items
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                <p className="mb-2">Unless the item is defective or incorrectly produced, returned items must be:</p>
                <ul className="space-y-2 mb-4">
                  <li>• Unused</li>
                  <li>• Unworn</li>
                  <li>• Unwashed</li>
                  <li>• In original condition</li>
                </ul>
                <p className="mb-2">We do not accept items that are:</p>
                <ul className="space-y-2 mb-4">
                  <li>• Worn</li>
                  <li>• Stained</li>
                  <li>• Damaged due to misuse</li>
                  <li>• Altered after delivery</li>
                </ul>
                <p>
                  Customers are responsible for return shipping costs. We do not provide Freight-To-Collect (FTC) return services.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="refunds" className="border border-border px-6">
              <AccordionTrigger className="text-left font-light py-5 hover:no-underline">
                Refunds
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                <p className="mb-4">If your refund request is approved:</p>
                <ul className="space-y-2 mb-4">
                  <li>• Refunds are issued to the original payment method used for the purchase.</li>
                  <li>• Refunds are processed in the original purchase currency (CAD).</li>
                </ul>
                <p>Processing times may vary depending on your payment provider.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="non-returnable" className="border border-border px-6">
              <AccordionTrigger className="text-left font-light py-5 hover:no-underline">
                Non-Returnable Items
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                <p className="mb-2">
                  The following are not eligible for return or refund unless there is a manufacturing defect or fulfillment error:
                </p>
                <ul className="space-y-2">
                  <li>• Tights, underwear, pajamas, swimsuits, socks, and masks (hygiene)</li>
                  <li>• Sample items</li>
                  <li>• Deliberately damaged items</li>
                  <li>• Items returned beyond the 90-day return window</li>
                  <li>• Items accurately produced to the customer's specifications but later deemed unwanted</li>
                  <li>• Orders delayed due to incorrect information provided by the customer (wrong shipping address, wrong phone number, customer-requested design or order modifications)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cancellation" className="border border-border px-6">
              <AccordionTrigger className="text-left font-light py-5 hover:no-underline">
                Order Cancellation
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                <p className="mb-4">
                  Orders may only be canceled and fully refunded while they remain in the <strong>"In Review"</strong> status.
                </p>
                <p>
                  If you wish to cancel your order, contact us as soon as possible. Once production has started, cancellation requests may no longer be eligible for a full refund.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="lost" className="border border-border px-6">
              <AccordionTrigger className="text-left font-light py-5 hover:no-underline">
                Lost Packages
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                <p>
                  For packages confirmed as lost in transit, claims should be submitted within <strong>3 days after the estimated delivery date</strong>. Our team will work with the logistics provider to investigate and resolve.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ServiceSection>

        {/* Quick Questions */}
        <ServiceSection id="faq" title="Quick Answers" showDivider={false}>
          <div className="grid gap-6 md:grid-cols-2">
            {quickQuestions.map((question) => (
              <InfoCard
                key={question.title}
                icon={question.icon}
                title={question.title}
                description={question.description}
                variant={question.variant}
              />
            ))}
          </div>
        </ServiceSection>

        {/* CTA */}
        <ActionCTA
          title="Start Your Return"
          subtitle="Enter your order number and we'll email you return instructions within 3 business days."
          alignment="center"
          showInput
          inputPlaceholder="Order number (e.g., #LOJ-12345)"
          buttonText="SUBMIT REQUEST"
          onSubmit={handleReturnSubmit}
          footerText="Questions?"
          footerLinks={[
            { text: "Check our FAQ", href: "/faq" },
            { text: "1.lineofjudah.1@gmail.com", href: "mailto:1.lineofjudah.1@gmail.com", isExternal: true },
          ]}
        />
      </ServicePageLayout>
    </>
  );
};

export default ReturnsExchanges;
