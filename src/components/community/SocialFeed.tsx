import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function SocialFeed() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30 overflow-hidden">
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container mx-auto px-4 lg:px-8 mb-8"
      >
        <div className="flex items-baseline gap-4 mb-6">
          <motion.span variants={staggerItem} className="text-[10px] uppercase tracking-[0.2em] text-champagne-500 font-medium">03</motion.span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <motion.p 
          variants={staggerItem}
          className="text-[10px] uppercase tracking-[0.4em] text-champagne-600 mb-4"
        >
          Join The Movement
        </motion.p>
        <motion.h2 
          variants={staggerItem}
          className="text-4xl lg:text-5xl font-extralight mb-4"
        >
          #LineOfJudah
        </motion.h2>
      </motion.div>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground font-light tracking-wide">
            Coming soon...
          </p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="container mx-auto px-4 lg:px-8 mt-12"
      >
        <Button 
          variant="outline" 
          asChild
          className="rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background text-xs uppercase tracking-[0.2em] px-8"
        >
          <a href="https://instagram.com/lineofjudah" target="_blank" rel="noopener noreferrer">
            Follow @lineofjudah
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </motion.div>
    </section>
  );
}
