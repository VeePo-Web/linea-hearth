import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import ScrollReveal from "@/components/motion/ScrollReveal";
import TextReveal from "@/components/motion/TextReveal";

const emailSchema = z.string().email("Please enter a valid email address").max(255);

const EmailOptIn = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

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
    <section className="w-full py-24 md:py-32 bg-foreground">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Oversized Headline - Editorial impact */}
        <h2 className="text-display-sm text-background mb-6">
          <TextReveal text="JOIN THE" className="block" delay={0} />
          <TextReveal text="MOVEMENT." className="text-accent block" delay={0.3} />
        </h2>

        {/* Subtext */}
        <ScrollReveal variant="fadeUp" delay={0.5}>
          <p className="text-editorial text-background/60 mb-10 max-w-md mx-auto">
            Get 15% off your first order. Early access to drops. Faith inspiration weekly.
          </p>
        </ScrollReveal>

        {/* Form - Single line */}
        <ScrollReveal variant="fadeUp" delay={0.6}>
          {isSuccess ? (
            <motion.div 
              className="flex items-center justify-center gap-3 text-accent"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-light">You're in. Check your inbox.</span>
            </motion.div>
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
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
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
                </motion.div>
              </div>

              {error && (
                <motion.p 
                  className="text-destructive text-sm mt-3 text-left"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.p>
              )}
            </form>
          )}
        </ScrollReveal>

        {/* Privacy Note - Minimal */}
        <ScrollReveal variant="fadeIn" delay={0.8}>
          <p className="text-caption text-background/30 mt-8">
            By subscribing, you agree to our{" "}
            <a href="/privacy-policy" className="underline hover:text-background/50">Privacy Policy</a>.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default EmailOptIn;
