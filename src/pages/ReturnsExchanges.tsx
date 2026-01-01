import { useEffect } from "react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import LegalSidebar from "@/components/legal/LegalSidebar";
import ReturnFlowSteps from "@/components/returns/ReturnFlowSteps";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, CheckCircle, Package, Clock, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const ReturnsExchanges = () => {
  useEffect(() => {
    document.title = "Returns & Exchanges - Line of Judah";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <section className="bg-stone-900 text-white pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block text-xs font-medium tracking-widest text-amber-500 mb-4">
            HASSLE-FREE RETURNS
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-4">
            EASY RETURNS. NO DRAMA.
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-white/80">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-amber-500" />
              30-Day Returns
            </span>
            <span className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" />
              Free US Shipping
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500" />
              Full Refunds
            </span>
          </div>
        </div>
      </section>

      {/* Visual Flow Steps */}
      <section className="py-16 px-6 bg-stone-50 dark:bg-stone-900/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-light text-center mb-12">
            How It Works
          </h2>
          <ReturnFlowSteps />
        </div>
      </section>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <aside className="lg:col-span-1">
            <LegalSidebar />
          </aside>
          
          <div className="lg:col-span-3">
            {/* Policy Details */}
            <div className="mb-16">
              <h2 className="text-2xl font-light mb-8 pb-4 border-b border-border">
                Return Policy Details
              </h2>
              
              <Accordion type="single" collapsible className="space-y-2">
                <AccordionItem value="eligible" className="border border-border px-6">
                  <AccordionTrigger className="text-left font-light py-5 hover:no-underline">
                    What's Eligible for Return
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                    <ul className="space-y-2">
                      <li>• Items purchased within the last 30 days</li>
                      <li>• Unworn items with original tags attached</li>
                      <li>• Items in original packaging (if applicable)</li>
                      <li>• Items free from odors, stains, or damage</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="not-eligible" className="border border-border px-6">
                  <AccordionTrigger className="text-left font-light py-5 hover:no-underline">
                    What's Not Eligible
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                    <ul className="space-y-2">
                      <li>• Final sale items (marked as such at purchase)</li>
                      <li>• Custom or personalized pieces</li>
                      <li>• Items without original tags</li>
                      <li>• Items showing signs of wear</li>
                      <li>• Gift cards</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="international" className="border border-border px-6">
                  <AccordionTrigger className="text-left font-light py-5 hover:no-underline">
                    International Returns
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                    <p className="mb-4">
                      International customers can return items within 30 days. Return shipping costs are the responsibility of the customer. We recommend using a tracked shipping method.
                    </p>
                    <p>
                      Duties and taxes paid at original purchase are non-refundable. Refunds are processed in the original currency.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="exchanges" className="border border-border px-6">
                  <AccordionTrigger className="text-left font-light py-5 hover:no-underline">
                    Exchange Process
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                    <p className="mb-4">
                      Want a different size or color? We've got you covered:
                    </p>
                    <ol className="space-y-2">
                      <li>1. Start your return online and select "Exchange"</li>
                      <li>2. Choose your preferred size or color</li>
                      <li>3. We'll ship your new item as soon as we receive the return</li>
                      <li>4. Free shipping on all exchanges (US only)</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="damaged" className="border border-border px-6">
                  <AccordionTrigger className="text-left font-light py-5 hover:no-underline">
                    Damaged or Defective Items
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground font-light leading-relaxed pb-6">
                    <p className="mb-4">
                      Received something damaged? We're sorry about that. Here's how we'll make it right:
                    </p>
                    <ul className="space-y-2">
                      <li>• Contact us within 7 days of delivery</li>
                      <li>• Include photos of the damage</li>
                      <li>• We'll send a replacement or full refund immediately</li>
                      <li>• No need to return the damaged item</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Quick FAQ */}
            <div className="mb-16">
              <h2 className="text-2xl font-light mb-8 pb-4 border-b border-border">
                Quick Questions
              </h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="p-6 bg-stone-50 dark:bg-stone-900/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <h3 className="font-medium">How long do I have?</h3>
                  </div>
                  <p className="text-sm text-muted-foreground font-light">
                    30 days from delivery date. Returns initiated after 30 days are not eligible for refund.
                  </p>
                </div>

                <div className="p-6 bg-stone-50 dark:bg-stone-900/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-amber-500" />
                    <h3 className="font-medium">Need original packaging?</h3>
                  </div>
                  <p className="text-sm text-muted-foreground font-light">
                    Original packaging is preferred but not required. Just pack items securely to prevent damage.
                  </p>
                </div>

                <div className="p-6 bg-stone-50 dark:bg-stone-900/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-amber-500" />
                    <h3 className="font-medium">When will I get my refund?</h3>
                  </div>
                  <p className="text-sm text-muted-foreground font-light">
                    5-7 business days after we receive your return. Refunds go to original payment method.
                  </p>
                </div>

                <div className="p-6 bg-stone-50 dark:bg-stone-900/50">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-amber-500" />
                    <h3 className="font-medium">Are returns free?</h3>
                  </div>
                  <p className="text-sm text-muted-foreground font-light">
                    Yes, returns are free for all US customers. We provide a prepaid return label.
                  </p>
                </div>
              </div>
            </div>

            {/* Start Return CTA */}
            <div className="bg-stone-900 text-white p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-light mb-4">
                Ready to Start Your Return?
              </h2>
              <p className="text-white/70 font-light mb-8 max-w-md mx-auto">
                Enter your order number to generate a prepaid return label and get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Order number (e.g., #LOJ-12345)"
                  className="flex-1 px-4 py-3 bg-white text-stone-900 placeholder:text-stone-400 text-sm"
                />
                <Button className="bg-amber-500 hover:bg-amber-600 text-white px-8">
                  Begin Return
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <p className="mt-6 text-sm text-white/50 font-light">
                Need help? <Link to="/faq" className="text-amber-400 hover:underline">Check our FAQ</Link> or email <a href="mailto:returns@lineofjudah.com" className="text-amber-400 hover:underline">returns@lineofjudah.com</a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReturnsExchanges;
