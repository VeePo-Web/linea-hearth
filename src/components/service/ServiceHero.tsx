import { Search, LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ServiceHeroProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  lastUpdated?: string;
  alignment?: 'left' | 'center';
  valueProps?: Array<{
    icon: LucideIcon;
    text: string;
  }>;
  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
}

const ServiceHero = ({
  title,
  subtitle,
  eyebrow,
  lastUpdated,
  alignment = 'left',
  valueProps,
  showSearch,
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = "Search for answers..."
}: ServiceHeroProps) => {
  const prefersReducedMotion = useReducedMotion();
  const isCenter = alignment === 'center';
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const }
    }
  };
  
  return (
    <section className="bg-stone-900 text-white pt-[calc(var(--header-height)+2rem)] pb-16 px-6">
      <motion.div 
        className={cn(
          "max-w-7xl mx-auto",
          isCenter && "text-center"
        )}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={cn(isCenter ? "max-w-3xl mx-auto" : "max-w-3xl")}>
          {/* Eyebrow or Last Updated */}
          {(eyebrow || lastUpdated) && (
            <motion.span 
              variants={itemVariants}
              className="inline-block text-xs font-medium tracking-widest text-amber-500 mb-4"
            >
              {lastUpdated ? `LAST UPDATED: ${lastUpdated.toUpperCase()}` : eyebrow?.toUpperCase()}
            </motion.span>
          )}
          
          {/* Title */}
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight uppercase mb-4"
          >
            {title}
          </motion.h1>
          
          {/* Subtitle */}
          {subtitle && (
            <motion.p 
              variants={itemVariants}
              className={cn(
                "text-lg text-white/70 font-light leading-relaxed",
                isCenter && "max-w-xl mx-auto"
              )}
            >
              {subtitle}
            </motion.p>
          )}
          
          {/* Value Props */}
          {valueProps && valueProps.length > 0 && (
            <motion.div 
              variants={itemVariants}
              className={cn(
                "flex flex-wrap items-center gap-6 mt-8 text-sm text-white/80",
                isCenter && "justify-center"
              )}
            >
              {valueProps.map((prop, index) => (
                <span key={index} className="flex items-center gap-2">
                  <prop.icon className="w-4 h-4 text-amber-500" />
                  {prop.text}
                </span>
              ))}
            </motion.div>
          )}
        </div>
        
        {/* Search Bar */}
        {showSearch && onSearchChange && (
          <motion.div 
            variants={itemVariants}
            className="relative max-w-xl mx-auto mt-10"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-white text-stone-900 border-0 placeholder:text-stone-400 text-base focus-visible:ring-amber-500 rounded-none"
            />
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default ServiceHero;
