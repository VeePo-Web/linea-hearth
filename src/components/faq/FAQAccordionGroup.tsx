import { FAQItem } from "@/pages/FAQ";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Truck, RotateCcw, Package, Ruler, ShoppingBag, Sparkles } from "lucide-react";

const categoryIcons: Record<string, typeof Truck> = {
  shipping: Truck,
  returns: RotateCcw,
  products: Package,
  sizing: Ruler,
  orders: ShoppingBag,
  care: Sparkles,
};

const categoryLabels: Record<string, string> = {
  shipping: "Shipping",
  returns: "Returns & Exchanges",
  products: "Products",
  sizing: "Sizing & Fit",
  orders: "Orders & Payment",
  care: "Care & Maintenance",
};

interface FAQAccordionGroupProps {
  category?: string;
  items: FAQItem[];
  searchQuery?: string;
}

const highlightText = (text: string, query: string) => {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query})`, "gi");
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? (
      <mark key={i} className="bg-amber-200 dark:bg-amber-800 px-0.5 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

const FAQAccordionGroup = ({ category, items, searchQuery = "" }: FAQAccordionGroupProps) => {
  const Icon = category ? categoryIcons[category] : null;
  const label = category ? categoryLabels[category] : null;

  return (
    <div className="mb-12">
      {category && label && (
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          {Icon && <Icon className="w-5 h-5 text-amber-500" strokeWidth={1.5} />}
          <h2 className="text-xl font-light tracking-tight">{label}</h2>
        </div>
      )}
      
      <Accordion type="single" collapsible className="space-y-2">
        {items.map((item) => (
          <AccordionItem 
            key={item.id} 
            value={item.id}
            className="border border-border px-6 data-[state=open]:bg-stone-50 dark:data-[state=open]:bg-stone-900/50"
          >
            <AccordionTrigger className="text-left font-light py-5 hover:no-underline">
              <span className="pr-4">
                {highlightText(item.question, searchQuery)}
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
              {highlightText(item.answer, searchQuery)}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FAQAccordionGroup;
