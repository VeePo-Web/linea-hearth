import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const shippingFAQs = [
  {
    question: "When does my order ship?",
    answer: "Orders placed before 2:00 PM EST on business days are processed and shipped the same day. Orders placed after 2:00 PM EST or on weekends/holidays will ship the next business day."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order ships, you'll receive a confirmation email with your tracking number. You can track your package directly through the carrier's website or by clicking the link in your email."
  },
  {
    question: "Can I change my shipping address after ordering?",
    answer: "If your order hasn't shipped yet, contact our customer care team immediately at support@lineofjudah.com. Once an order has shipped, we cannot modify the delivery address."
  },
  {
    question: "What if my package is lost or damaged?",
    answer: "All shipments are insured. If your package is lost or arrives damaged, please contact us within 48 hours of the expected delivery date. We'll work with the carrier to resolve the issue and ensure you receive your order or a full refund."
  },
  {
    question: "Do you offer gift wrapping?",
    answer: "Yes! Every order is beautifully packaged in our premium packaging at no additional charge. If you'd like a personalized gift message included, you can add one during checkout."
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
          <AccordionContent className="text-muted-foreground pb-4">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default ShippingFAQ;
