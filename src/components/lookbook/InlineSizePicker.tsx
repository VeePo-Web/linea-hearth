import { motion, useReducedMotion } from "framer-motion";

interface InlineSizePickerProps {
  sizes: string[];
  rememberedSize: string | null;
  onSelect: (size: string) => void;
  getStockForSize?: (size: string) => number;
}

const InlineSizePicker = ({ 
  sizes, 
  rememberedSize,
  onSelect, 
  getStockForSize 
}: InlineSizePickerProps) => {
  const prefersReducedMotion = useReducedMotion();

  const springConfig = { type: "spring" as const, stiffness: 400, damping: 25 };

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-0 left-0 right-0 bg-stone-900/95 
                 backdrop-blur-sm p-2.5 rounded-b-lg border-t border-white/10"
    >
      <p className="text-[9px] uppercase tracking-wider text-white/50 mb-2 text-center">
        Select Size
      </p>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {sizes.map(size => {
          const stock = getStockForSize ? getStockForSize(size) : 10;
          const isOutOfStock = stock === 0;
          const isRemembered = size === rememberedSize;
          
          return (
            <motion.button
              key={size}
              onClick={() => !isOutOfStock && onSelect(size)}
              disabled={isOutOfStock}
              className={`
                relative min-w-[36px] h-9 px-2 text-xs rounded transition-colors
                ${isOutOfStock 
                  ? 'bg-white/5 text-white/30 cursor-not-allowed line-through' 
                  : isRemembered
                    ? 'bg-amber-500 text-stone-900 font-medium'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }
              `}
              whileTap={isOutOfStock || prefersReducedMotion ? {} : { scale: 0.9 }}
              transition={springConfig}
              aria-label={`Size ${size}${isOutOfStock ? ' - Out of stock' : ''}`}
            >
              {size}
              {isRemembered && !isOutOfStock && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 
                                 text-[7px] uppercase tracking-wide text-amber-500 
                                 bg-stone-900 px-1 rounded whitespace-nowrap">
                  yours
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default InlineSizePicker;
