import { useState, useMemo } from "react";
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import FAQHero from "@/components/faq/FAQHero";
import FAQCategoryNav from "@/components/faq/FAQCategoryNav";
import FAQAccordionGroup from "@/components/faq/FAQAccordionGroup";
import AskUsModal from "@/components/faq/AskUsModal";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "shipping" | "returns" | "products" | "sizing" | "orders" | "care";
  keywords: string[];
}

const faqData: FAQItem[] = [
  // Shipping
  {
    id: "ship-1",
    question: "How long does shipping take?",
    answer: "Standard shipping takes 5-7 business days. Express shipping is 2-3 business days, and overnight delivery is available for orders placed before 12pm EST.",
    category: "shipping",
    keywords: ["delivery", "time", "days", "fast", "quick"]
  },
  {
    id: "ship-2",
    question: "Is shipping free?",
    answer: "Yes! We offer free standard shipping on all orders over $75. Orders under $75 have a flat rate of $5.99 for standard shipping.",
    category: "shipping",
    keywords: ["free", "cost", "price", "charge"]
  },
  {
    id: "ship-3",
    question: "Do you ship internationally?",
    answer: "Yes, we ship to over 50 countries worldwide. International shipping typically takes 7-14 business days. Duties and taxes are the responsibility of the customer.",
    category: "shipping",
    keywords: ["international", "worldwide", "global", "overseas", "country"]
  },
  {
    id: "ship-4",
    question: "Can I track my order?",
    answer: "Absolutely! Once your order ships, you'll receive an email with tracking information. You can also track your order in your account dashboard.",
    category: "shipping",
    keywords: ["track", "tracking", "where", "status", "locate"]
  },
  // Returns
  {
    id: "ret-1",
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for all unworn items with original tags attached. Items must be in their original condition for a full refund.",
    category: "returns",
    keywords: ["return", "policy", "refund", "money back"]
  },
  {
    id: "ret-2",
    question: "How do I start a return?",
    answer: "Visit our Returns page and enter your order number to generate a prepaid return label. Pack your items securely and drop off at any authorized shipping location.",
    category: "returns",
    keywords: ["start", "begin", "initiate", "process"]
  },
  {
    id: "ret-3",
    question: "Are returns free?",
    answer: "Yes, returns are free for US customers. We provide a prepaid shipping label. International returns require customers to cover return shipping costs.",
    category: "returns",
    keywords: ["free", "cost", "pay", "charge"]
  },
  {
    id: "ret-4",
    question: "When will I receive my refund?",
    answer: "Refunds are processed within 5-7 business days after we receive your return. The refund will be credited to your original payment method.",
    category: "returns",
    keywords: ["refund", "money", "credit", "when", "time"]
  },
  {
    id: "ret-5",
    question: "Can I exchange an item?",
    answer: "Yes! You can request an exchange for a different size or color. Simply select 'Exchange' when starting your return and choose your preferred option.",
    category: "returns",
    keywords: ["exchange", "swap", "different", "size", "color"]
  },
  // Products
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
  // Sizing
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
    answer: "No worries! You can return or exchange any item within 30 days. We recommend checking the size guide and fit notes before ordering.",
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
  // Orders
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
  // Care
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

const categories = [
  { id: "all", label: "All" },
  { id: "shipping", label: "Shipping" },
  { id: "returns", label: "Returns" },
  { id: "products", label: "Products" },
  { id: "sizing", label: "Sizing" },
  { id: "orders", label: "Orders" },
  { id: "care", label: "Care" }
] as const;

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

  return (
    <Layout>
      <FAQHero 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <FAQCategoryNav 
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {hasNoResults ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground mb-6">
              No results found for "{searchQuery}"
            </p>
            <Button 
              onClick={() => setIsAskModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Ask Us Instead
            </Button>
          </div>
        ) : activeCategory === "all" && !searchQuery ? (
          // Show grouped by category
          Object.entries(groupedFAQs).map(([category, items]) => (
            <FAQAccordionGroup 
              key={category}
              category={category}
              items={items}
              searchQuery={searchQuery}
            />
          ))
        ) : (
          // Show flat list for filtered results
          <FAQAccordionGroup 
            items={filteredFAQs}
            searchQuery={searchQuery}
          />
        )}

        {/* Ask Us CTA */}
        {!hasNoResults && (
          <div className="mt-16 p-8 bg-stone-900 text-white text-center">
            <h3 className="text-2xl font-light mb-3">
              Can't find what you're looking for?
            </h3>
            <p className="text-white/70 mb-6 font-light">
              Our team is here to help with any questions.
            </p>
            <Button 
              onClick={() => setIsAskModalOpen(true)}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-stone-900"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Ask Us a Question
            </Button>
          </div>
        )}
      </main>

      <AskUsModal 
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
      />
    </Layout>
  );
};

export default FAQ;
