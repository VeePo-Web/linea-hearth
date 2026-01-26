import { motion } from 'framer-motion';
import { toast as sonnerToast } from 'sonner';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AddedToCartToastProps {
  productName: string;
  productImage: string;
  size?: string;
  color?: string;
  toastId?: string | number;
}

const AddedToCartToast = ({
  productName,
  productImage,
  size,
  color,
  toastId,
}: AddedToCartToastProps) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
      transition={{ 
        duration: prefersReducedMotion ? 0 : 0.25,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg shadow-lg max-w-[320px] w-full cursor-pointer"
      role="status"
      aria-live="polite"
      onClick={() => toastId && sonnerToast.dismiss(toastId)}
    >
      {/* Product Thumbnail */}
      <div className="w-12 h-16 bg-muted/30 overflow-hidden flex-shrink-0 rounded">
        <img
          src={productImage}
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0 py-0.5">
        <p className="text-sm font-medium text-foreground truncate">
          {productName}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {size && <>Size {size}</>}
          {size && color && <span className="mx-1">·</span>}
          {color && <>{color}</>}
          {!size && !color && <>Added to bag</>}
        </p>
      </div>
    </motion.div>
  );
};

export default AddedToCartToast;
