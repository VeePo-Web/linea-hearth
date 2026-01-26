import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HighIntentPromptProps {
  isVisible: boolean;
  viewCount: number;
  onAddToCart: () => void;
  className?: string;
}

/**
 * A subtle prompt that appears when behavioral signals indicate high purchase intent.
 * Shows "Ready to buy?" message for users who have viewed a product 3+ times.
 */
const HighIntentPrompt = ({ 
  isVisible, 
  viewCount, 
  onAddToCart,
  className 
}: HighIntentPromptProps) => {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className={cn(
          "p-4 bg-primary/5 border border-primary/20 rounded-none",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              Ready to buy?
            </p>
            <p className="text-xs text-muted-foreground">
              {viewCount >= 3 
                ? `You've viewed this ${viewCount} times` 
                : "You seem interested in this piece"}
            </p>
          </div>
          
          <Button
            onClick={onAddToCart}
            size="sm"
            className="flex-shrink-0 text-xs font-light"
          >
            Add to Bag
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default HighIntentPrompt;
