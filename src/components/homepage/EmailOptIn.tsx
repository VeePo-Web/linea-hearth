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
          setError("You're already subscribed!");
        } else {
          throw insertError;
        }
      } else {
        setIsSuccess(true);
        setEmail("");
        toast({
          title: "Welcome to the movement.",
          description: "Check your email for your discount code.",
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
      className="w-full py-24 md:py-32 bg-foreground"
    >
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div 
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Oversized Headline - Editorial impact */}
          <h2 className="text-display-sm text-background mb-6">
            JOIN THE
            <br />
            <span className="text-accent">MOVEMENT.</span>
          </h2>

          {/* Subtext */}
          <p className="text-editorial text-background/60 mb-10 max-w-md mx-auto">
            Get 15% off your first order. Early access to drops. Faith inspiration weekly.
          </p>

          {/* Form - Single line */}
          {isSuccess ? (
            <div className="flex items-center justify-center gap-3 text-accent">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-light">You're in. Check your inbox.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <Input 
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="flex-1 bg-transparent border-background/30 text-background placeholder:text-background/40 h-12 rounded-none focus:border-accent focus:ring-accent"
                  disabled={isSubmitting}
                />
                <Button 
                  type="submit"
                  size="lg"
                  className="bg-background text-foreground hover:bg-accent hover:text-foreground h-12 px-6 rounded-none font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {error && (
                <p className="text-destructive text-sm mt-3 text-left">{error}</p>
              )}
            </form>
          )}

          {/* Privacy Note - Minimal */}
          <p className="text-caption text-background/30 mt-8">
            By subscribing, you agree to our{" "}
            <a href="/privacy-policy" className="underline hover:text-background/50">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default EmailOptIn;