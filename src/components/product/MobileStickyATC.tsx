import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface MobileStickyATCProps {
  price: number;
  salePrice?: number | null;
  quantity: number;
  onAddToBag: () => void;
  disabled?: boolean;
}

const MobileStickyATC = ({ price, salePrice, quantity, onAddToBag, disabled }: MobileStickyATCProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const displayPrice = salePrice ?? price;
  const totalPrice = displayPrice * quantity;

  useEffect(() => {
    const mainCTA = document.getElementById("main-add-to-bag");
    const footer = document.querySelector("footer");

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.target === mainCTA) {
          setIsVisible(!entry.isIntersecting);
        }
        if (entry.target === footer) {
          setIsFooterVisible(entry.isIntersecting);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0,
    });

    if (mainCTA) observer.observe(mainCTA);
    if (footer) observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  const shouldShow = isVisible && !isFooterVisible;

  if (prefersReducedMotion) {
    return (
      <div
        className={`
          fixed bottom-0 left-0 right-0 z-50 lg:hidden
          bg-background/95 backdrop-blur-sm border-t border-border
          px-4 py-3 transition-transform duration-300 ease-out
          ${shouldShow ? "translate-y-0" : "translate-y-full"}
        `}
      >
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          <div className="flex flex-col">
            {salePrice && (
              <span className="text-xs font-light text-muted-foreground line-through">
                ${(price * quantity).toFixed(2)}
              </span>
            )}
            <span className="text-lg font-light text-foreground">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
          <Button
            onClick={onAddToBag}
            disabled={disabled}
            className="flex-1 max-w-[200px] h-11 bg-foreground text-background hover:bg-foreground/90 font-light rounded-none"
          >
            Add to Bag
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-sm border-t border-border px-4 py-3"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ 
            type: "spring" as const, 
            stiffness: 400, 
            damping: 30,
          }}
        >
          <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
            <div className="flex flex-col">
              {salePrice && (
                <motion.span 
                  className="text-xs font-light text-muted-foreground line-through"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  ${(price * quantity).toFixed(2)}
                </motion.span>
              )}
              <span className="text-lg font-light text-foreground">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
              className="flex-1 max-w-[200px]"
            >
              <Button
                onClick={onAddToBag}
                disabled={disabled}
                className="w-full h-11 bg-foreground text-background hover:bg-foreground/90 font-light rounded-none"
              >
                Add to Bag
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileStickyATC;
