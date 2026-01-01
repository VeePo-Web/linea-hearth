import { useState, useRef } from "react";
import { motion, useInView, Variants, Transition } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const emailSchema = z.string().email("Please enter a valid email address");

interface EmailOptInProps {
  variant?: "default" | "compact";
}

const EmailOptIn = ({ variant = "default" }: EmailOptInProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { toast } = useToast();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const prefersReducedMotion = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setIsLoading(true);

    try {
      const { error: supabaseError } = await supabase
        .from("newsletter_subscribers")
        .insert([{ email, source: "homepage_editorial" }]);

      if (supabaseError) {
        if (supabaseError.code === "23505") {
          setError("You're already subscribed.");
        } else {
          throw supabaseError;
        }
      } else {
        setIsSuccess(true);
        toast({
          title: "You're in.",
          description: "Check your inbox for your 15% off code.",
        });
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Easing as tuple for Framer Motion type safety
  const editorialEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

  // Character animation for headline
  const headlineWords = ["THE", "TRIBE", "LIST."];
  
  const getCharacterTransition = (delay: number): Transition => ({
    type: "spring" as const,
    stiffness: 100,
    damping: 12,
    delay: prefersReducedMotion ? 0 : delay,
  });

  const lineVariants: Variants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: { duration: 0.8, ease: editorialEase, delay: 1.0 },
    },
  };

  const getFadeUpTransition = (delay: number): Transition => ({
    duration: 0.6,
    ease: editorialEase,
    delay,
  });

  return (
    <section
      ref={ref}
      className="relative bg-foreground text-background py-24 md:py-32 lg:py-40 overflow-hidden"
    >
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Large index number watermark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.08 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 2.0 }}
        className="absolute bottom-8 right-8 md:bottom-12 md:right-12 pointer-events-none select-none"
      >
        <span className="text-[80px] md:text-[120px] lg:text-[180px] font-extralight leading-none text-background">
          024
        </span>
        <div className="w-12 h-px bg-background/30 mt-2" />
      </motion.div>

      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-end">
          {/* Typography Zone - 60% */}
          <div className="lg:col-span-3">
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={getFadeUpTransition(0.2)}
              className="text-xs uppercase tracking-[0.3em] text-background/50 mb-8"
            >
              Only for those who are serious
            </motion.p>

            {/* Massive headline with character animation */}
            <div className="space-y-0">
              {headlineWords.map((word, wordIndex) => (
                <div
                  key={word}
                  className={`overflow-hidden ${
                    word === "MISS A" ? "ml-[5vw] md:ml-[8vw]" : ""
                  }`}
                >
                  <motion.h2
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className={`text-[16vw] md:text-[12vw] lg:text-[8vw] font-extralight leading-[0.85] tracking-[-0.04em] ${
                      word === "DROP." ? "text-amber-400" : "text-background"
                    }`}
                  >
                    {prefersReducedMotion ? (
                      word
                    ) : (
                      word.split("").map((char, charIndex) => (
                        <motion.span
                          key={charIndex}
                          initial={{ opacity: 0, y: 20, rotateX: -15 }}
                          animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 20, rotateX: -15 }}
                          transition={getCharacterTransition(wordIndex * 0.15 + charIndex * 0.02 + 0.3)}
                          style={{
                            display: "inline-block",
                            whiteSpace: char === " " ? "pre" : "normal",
                          }}
                        >
                          {char}
                        </motion.span>
                      ))
                    )}
                  </motion.h2>
                </div>
              ))}
            </div>
          </div>

          {/* Form Zone - 40% */}
          <div className="lg:col-span-2">
            {/* Divider line */}
            <motion.div
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              variants={lineVariants}
              className="w-full h-px bg-background/20 mb-8 origin-left"
            />

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                    className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-foreground" />
                  </motion.div>
                  <span className="text-2xl md:text-3xl font-light tracking-tight">
                    YOU'RE IN.
                  </span>
                </div>
                <p className="text-sm text-background/60 uppercase tracking-[0.15em]">
                  Check your inbox for your code.
                </p>
              </motion.div>
            ) : (
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="space-y-6"
              >
                {/* Floating label input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={getFadeUpTransition(1.2)}
                  className="relative"
                >
                  <label
                    htmlFor="newsletter-email"
                    className={`absolute left-0 transition-all duration-300 text-background/50 uppercase tracking-[0.2em] ${
                      isFocused || email
                        ? "text-[10px] -top-5"
                        : "text-xs top-2"
                    }`}
                  >
                    Your Email
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`w-full bg-transparent border-0 border-b-2 py-2 text-lg text-background placeholder-transparent focus:outline-none transition-colors duration-300 ${
                      isFocused ? "border-amber-400" : "border-background/30"
                    }`}
                    placeholder="your@email.com"
                    disabled={isLoading}
                  />
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-6 left-0 text-xs text-red-400"
                    >
                      {error}
                    </motion.p>
                  )}
                </motion.div>

                {/* Text link CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={getFadeUpTransition(1.4)}
                >
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative text-xs uppercase tracking-[0.2em] text-background/80 hover:text-background transition-colors duration-300 flex items-center gap-2 mt-8"
                  >
                    <span>{isLoading ? "JOINING..." : "GET EARLY ACCESS"}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    {/* Animated underline */}
                    <span className="absolute -bottom-1 left-0 h-px bg-background origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100 w-full" />
                  </button>
                </motion.div>

                {/* Subtext */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={getFadeUpTransition(1.6)}
                  className="text-xs text-background/40 uppercase tracking-[0.15em] pt-4"
                >
                  First to know. First to shop. 15% off your first order.
                </motion.p>
              </motion.form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmailOptIn;
