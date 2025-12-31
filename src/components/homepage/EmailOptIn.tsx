import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address").max(255);

const EmailOptIn = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const sectionRef = useRef<HTMLElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email
    const validation = emailSchema.safeParse(email.trim());
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({ 
          email: email.trim().toLowerCase(),
          source: 'homepage'
        });

      if (insertError) {
        if (insertError.code === '23505') {
          // Duplicate email
          setError("You're already subscribed! Check your inbox for updates.");
        } else {
          throw insertError;
        }
      } else {
        setIsSuccess(true);
        setEmail("");
        toast({
          title: "Welcome to the tribe! 🙌",
          description: "Check your email for your 15% discount code.",
        });
      }
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="w-full py-16 md:py-24 bg-stone-900"
    >
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div 
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Eyebrow */}
          <p className="text-amber-500 text-xs tracking-[0.3em] uppercase mb-4">
            Newsletter
          </p>

          {/* Headline */}
          <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-light mb-4">
            Join the Tribe
          </h2>

          {/* Subtext */}
          <p className="text-white/70 text-lg font-light mb-8 max-w-lg mx-auto">
            Get <span className="text-amber-400 font-medium">15% off</span> your first order, 
            plus exclusive drops, faith inspiration, and early access to new collections.
          </p>

          {/* Form */}
          {isSuccess ? (
            <div 
              className={`flex items-center justify-center gap-3 text-amber-400 transition-all duration-500 ${
                isSuccess ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            >
              <CheckCircle className="w-6 h-6" />
              <span className="text-lg font-light">You're in! Check your inbox.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input 
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 rounded-none focus:border-amber-500 focus:ring-amber-500"
                    disabled={isSubmitting}
                  />
                </div>
                <Button 
                  type="submit"
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-medium h-12 px-8 rounded-none group"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Joining...
                    </span>
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-red-400 text-sm mt-3 text-left">{error}</p>
              )}
            </form>
          )}

          {/* Privacy Note */}
          <p className="text-white/40 text-xs font-light mt-6">
            By subscribing, you agree to our{" "}
            <a href="/privacy-policy" className="underline hover:text-white/60">Privacy Policy</a>.
            Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default EmailOptIn;
