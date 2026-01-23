import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const shippingFAQs = [
  {
    question: "When does my order ship?",
    answer: "Orders placed before 2:00 PM EST on business days are processed and shipped the same day. Orders placed after 2:00 PM EST or on weekends/holidays ship the next business day. No exceptions. We move fast."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order ships, you'll receive a confirmation email with your tracking number and direct carrier link. Full visibility, every step of the way. You can also check status on your account dashboard."
  },
  {
    question: "Can I change my shipping address after ordering?",
    answer: "If your order hasn't shipped yet, contact our logistics team immediately at logistics@lineofjudah.com. Once an order is in transit, we cannot modify the delivery address. Plan accordingly."
  },
  {
    question: "What if my package is lost or damaged?",
    answer: "All shipments are fully insured. If your package is lost or arrives damaged, contact us within 48 hours of the expected delivery date. We'll resolve it—either a replacement ships immediately or you get a full refund. No runaround."
  },
  {
    question: "Do you offer gift packaging?",
    answer: "Every order ships in our premium packaging at no extra charge. If you want a personalized gift message included, add it during checkout. Your recipient will know it came from someone with taste."
  },
  {
    question: "What carriers do you use?",
    answer: "Domestic orders ship via USPS Priority Mail (standard) or FedEx (express/overnight). International orders ship via DHL or UPS with full tracking and customs documentation included."
  }
];

const ShippingFAQ = () => {
  return (
    <Accordion type="single" collapsible className="w-full">
      {shippingFAQs.map((faq, index) => (
        <AccordionItem 
          key={index} 
          value={`item-${index}`}
          className="border-b border-border"
        >
          <AccordionTrigger className="text-left font-light hover:no-underline py-4">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground font-light pb-4">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default ShippingFAQ;
