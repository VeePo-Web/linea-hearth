import { useState, useMemo, useEffect } from "react";
import { Search, MessageCircle } from "lucide-react";
import ServicePageLayout from "@/components/service/ServicePageLayout";
import ServiceSection from "@/components/service/ServiceSection";
import ActionCTA from "@/components/service/ActionCTA";
import FAQCategoryTabs from "@/components/faq/FAQCategoryTabs";
import FAQAccordionGroup from "@/components/faq/FAQAccordionGroup";
import AskUsModal from "@/components/faq/AskUsModal";
import { Button } from "@/components/ui/button";
import PageSEO from "@/components/seo/PageSEO";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "shipping" | "returns" | "products" | "sizing" | "orders" | "care";
  keywords: string[];
}

const faqData: FAQItem[] = [
  // Shipping / DEPLOYMENT
  {
    id: "ship-1",
    question: "How long does shipping take?",
    answer: "Canadian orders arrive in 5-9 business days (2-5 days production + 3-4 days transit). International orders take 10-21 business days total. Every order ships with full tracking.",
    category: "shipping",
    keywords: ["delivery", "time", "days", "fast", "quick"]
  },
  {
    id: "ship-2",
    question: "How much is shipping?",
    answer: "Flat $15 CAD across Canada. Flat $40 CAD anywhere outside Canada. Any order with a subtotal over $250 CAD ships FREE — Canada or international, no code needed.",
    category: "shipping",
    keywords: ["free", "cost", "price", "charge", "flat", "rate"]
  },
  {
    id: "ship-3",
    question: "Do you ship internationally?",
    answer: "Yes — designed in Calgary, shipped worldwide. International shipping is a flat $40 CAD anywhere outside Canada and typically arrives in 10-21 business days. Duties and taxes are the responsibility of the recipient.",
    category: "shipping",
    keywords: ["international", "calgary", "canada", "overseas", "country"]
  },
  {
    id: "ship-4",
    question: "Can I track my order?",
    answer: "Absolutely! Once your order ships, you'll receive an email with tracking information. You can also track your order in your account dashboard.",
    category: "shipping",
    keywords: ["track", "tracking", "where", "status", "locate"]
  },
  // Returns / TACTICAL RESET
  {
    id: "ret-1",
    question: "What is your return policy?",
    answer: "You may request a return or refund within 14 days of delivery. For misprinted, damaged, defective, or lost items, submit your claim within 3 days of delivery so we can investigate quickly. Items must be unused, unworn, unwashed, and in original condition.",
    category: "returns",
    keywords: ["return", "policy", "refund", "money back", "14 days"]
  },
  {
    id: "ret-2",
    question: "How do I start a return?",
    answer: "Email us with your order number, a brief description of the issue, and photos or video where relevant. We review every request within 3 business days. Once approved, we'll send the correct return address and instructions — returns shipped without prior approval cannot be accepted.",
    category: "returns",
    keywords: ["start", "begin", "initiate", "process", "approval"]
  },
  {
    id: "ret-3",
    question: "Are returns free?",
    answer: "Return shipping is the customer's responsibility. We do not provide freight-to-collect (FTC) service. Once your return arrives and passes inspection, we refund the full product cost to the original payment method in CAD.",
    category: "returns",
    keywords: ["free", "cost", "pay", "charge", "shipping"]
  },
  {
    id: "ret-4",
    question: "When will I receive my refund?",
    answer: "Once your return is received and approved, we issue the refund to your original payment method in the original purchase currency (CAD). Processing times after that depend on your payment provider.",
    category: "returns",
    keywords: ["refund", "money", "credit", "when", "time"]
  },
  {
    id: "ret-5",
    question: "Can I exchange an item?",
    answer: "Yes. Email us within the 14-day window with your order number and the size or colour you'd like instead. Once your original piece arrives back and passes inspection, we ship the replacement. Return shipping on the original item remains the customer's responsibility.",
    category: "returns",
    keywords: ["exchange", "swap", "different", "size", "color", "colour"]
  },
  // Products / ARMOR SPECS
  {
    id: "prod-1",
    question: "What materials do you use?",
    answer: "We use premium, sustainably-sourced materials including 100% organic cotton, recycled polyester, and eco-friendly dyes. Each product description includes detailed material information.",
    category: "products",
    keywords: ["material", "fabric", "cotton", "quality", "sustainable"]
  },
  {
    id: "prod-2",
    question: "Are your products ethically made?",
    answer: "Yes, all our products are made in facilities that meet fair labor standards. We partner with certified manufacturers and conduct regular audits.",
    category: "products",
    keywords: ["ethical", "fair", "labor", "made", "manufacture"]
  },
  {
    id: "prod-3",
    question: "How do I care for my items?",
    answer: "Care instructions vary by product and are included on the garment tag. Generally, we recommend washing in cold water and hang drying to maintain quality and longevity.",
    category: "products",
    keywords: ["care", "wash", "clean", "maintain", "instructions"]
  },
  // Sizing / FIT INTEL
  {
    id: "size-1",
    question: "How do I find my size?",
    answer: "Check our Size Guide for detailed measurements. Each product page also includes model information and fit notes to help you choose the right size.",
    category: "sizing",
    keywords: ["size", "fit", "measure", "chart", "guide"]
  },
  {
    id: "size-2",
    question: "What if something doesn't fit?",
    answer: "No worries! You can return or exchange any item within 14 days. We recommend checking the size guide and fit notes before ordering.",
    category: "sizing",
    keywords: ["fit", "wrong", "small", "large", "tight", "loose"]
  },
  {
    id: "size-3",
    question: "Do your sizes run true to size?",
    answer: "Our sizing is designed to be true to standard US sizes. Each product page includes specific fit information—some styles may be relaxed or fitted cuts.",
    category: "sizing",
    keywords: ["true", "standard", "accurate", "run"]
  },
  // Orders / MISSION STATUS
  {
    id: "ord-1",
    question: "Can I modify my order after placing it?",
    answer: "You can modify your order within 1 hour of placing it. After that, orders are processed and cannot be changed. Contact us immediately if you need help.",
    category: "orders",
    keywords: ["modify", "change", "edit", "cancel", "update"]
  },
  {
    id: "ord-2",
    question: "Can I cancel my order?",
    answer: "Orders can be cancelled within 1 hour of placement. After that, the order will ship and you'll need to initiate a return once received.",
    category: "orders",
    keywords: ["cancel", "stop", "void", "delete"]
  },
  {
    id: "ord-3",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, and Google Pay. We also offer Afterpay for eligible orders.",
    category: "orders",
    keywords: ["payment", "pay", "credit", "card", "paypal", "afterpay"]
  },
  // Care / GEAR MAINTENANCE
  {
    id: "care-1",
    question: "How should I wash my apparel?",
    answer: "For best results, wash in cold water on a gentle cycle, inside out. Avoid bleach and tumble dry on low or hang dry. Iron on low if needed.",
    category: "care",
    keywords: ["wash", "laundry", "clean", "machine"]
  },
  {
    id: "care-2",
    question: "Will the print fade or crack?",
    answer: "Our prints are made with high-quality, durable inks. Following care instructions will help maintain vibrancy. Avoid ironing directly on printed areas.",
    category: "care",
    keywords: ["fade", "crack", "print", "color", "quality"]
  },
  {
    id: "care-3",
    question: "Can I dry clean my items?",
    answer: "While most items are machine washable, dry cleaning is safe for all our products. Check the care label for specific recommendations.",
    category: "care",
    keywords: ["dry clean", "professional", "cleaning"]
  }
];

// Brand-voice category labels
const categoryLabels: Record<string, string> = {
  shipping: "DEPLOYMENT",
  returns: "TACTICAL RESET",
  products: "ARMOR SPECS",
  sizing: "FIT INTEL",
  orders: "MISSION STATUS",
  care: "GEAR MAINTENANCE",
};

const categories = [
  { id: "all", label: "ALL INTEL" },
  { id: "shipping", label: "DEPLOYMENT" },
  { id: "returns", label: "TACTICAL RESET" },
  { id: "products", label: "ARMOR SPECS" },
  { id: "sizing", label: "FIT INTEL" },
  { id: "orders", label: "MISSION STATUS" },
  { id: "care", label: "GEAR MAINTENANCE" }
] as const;

const getCategoryLabel = (category: string) => categoryLabels[category] || category.toUpperCase();

// No Results State Component
const NoResultsState = ({ 
  searchQuery, 
  onAskClick 
}: { 
  searchQuery: string; 
  onAskClick: () => void;
}) => (
  <div className="text-center py-12 md:py-16">
    <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-6">
      <Search className="w-6 h-6 text-muted-foreground" />
    </div>
    <h3 className="text-lg md:text-xl font-light mb-2 uppercase tracking-wide">INTEL NOT FOUND.</h3>
    <p className="text-muted-foreground font-light mb-8 max-w-md mx-auto px-4">
      Your search for "<span className="font-medium truncate max-w-[200px] inline-block align-bottom">{searchQuery}</span>" returned no active briefings. Our command center is standing by.
    </p>
    <Button 
      onClick={onAskClick}
      className="bg-champagne-500 hover:bg-champagne-600 text-white min-h-[48px]"
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      CONTACT COMMAND
    </Button>
  </div>
);

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);

  useEffect(() => {
    document.title = "FAQ - Line of Judah";
  }, []);

  const filteredFAQs = useMemo(() => {
    let items = faqData;

    // Filter by category
    if (activeCategory !== "all") {
      items = items.filter(item => item.category === activeCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.keywords.some(k => k.toLowerCase().includes(query))
      );
    }

    return items;
  }, [searchQuery, activeCategory]);

  // Group FAQs by category for display
  const groupedFAQs = useMemo(() => {
    const groups: Record<string, FAQItem[]> = {};
    filteredFAQs.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredFAQs]);

  const hasNoResults = searchQuery.trim() && filteredFAQs.length === 0;

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    // Clear search when changing categories for cleaner UX
    if (searchQuery) {
      setSearchQuery("");
    }
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <PageSEO
        title="FAQ | Line of Judah"
        description="Answers to common questions about shipping, returns, sizing, materials and orders at Line of Judah."
        path="/faq"
        jsonLd={faqJsonLd}
      />
      <ServicePageLayout
      title="MISSION INTEL. DECODED."
      subtitle="The answers you need to stay battle-ready. Search the archives or browse by operation."
      eyebrow="TACTICAL INTELLIGENCE"
      heroAlignment="center"
      showSearch
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      searchPlaceholder="Search the intel archives..."
    >
      {/* Category Tabs */}
      <FAQCategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* FAQ Content */}
      <div className="min-h-[400px]">
        {hasNoResults ? (
          <NoResultsState 
            searchQuery={searchQuery} 
            onAskClick={() => setIsAskModalOpen(true)} 
          />
        ) : activeCategory === "all" && !searchQuery ? (
          // Show grouped by category with ServiceSection wrappers
          Object.entries(groupedFAQs).map(([category, items]) => (
            <ServiceSection 
              key={category}
              id={category}
              title={getCategoryLabel(category)}
              size="compact"
            >
              <FAQAccordionGroup items={items} searchQuery={searchQuery} />
            </ServiceSection>
          ))
        ) : (
          // Show flat list for filtered results
          <FAQAccordionGroup 
            items={filteredFAQs}
            searchQuery={searchQuery}
          />
        )}
      </div>

      {/* CTA */}
      {!hasNoResults && (
        <ActionCTA
          title="NEED DIRECT COMMS?"
          subtitle="Our command center responds within 24 hours. No question too complex."
          alignment="center"
          buttonText="OPEN CHANNEL"
          onSubmit={() => setIsAskModalOpen(true)}
          footerText="Or reach us at"
          footerLinks={[
            { text: "1.lineofjudah.1@gmail.com", href: "mailto:1.lineofjudah.1@gmail.com", isExternal: true }
          ]}
          className="mt-16"
        />
      )}

      <AskUsModal 
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
      />
    </ServicePageLayout>
    </>
  );
};

export default FAQ;
