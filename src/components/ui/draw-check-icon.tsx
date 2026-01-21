import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { easing, timing } from "@/lib/animations";

type SizeToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface DrawCheckIconProps {
  /** Size preset or custom pixel value */
  size?: SizeToken | number;
  /** Whether to animate on mount */
  animate?: boolean;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Animation duration (ms) */
  duration?: number;
  /** Additional classes */
  className?: string;
  /** SVG stroke width */
  strokeWidth?: number;
  /** Stroke color (default: currentColor) */
  color?: string;
  /** Visual variant */
  variant?: 'check' | 'circle-check' | 'square-check';
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
}

const sizeMap: Record<SizeToken, number> = {
  xs: 16,
  sm: 20,
  md: 28,
  lg: 40,
  xl: 56,
};

const getPixelSize = (size: SizeToken | number): number => {
  if (typeof size === 'number') return size;
  return sizeMap[size];
};

// Animation variants
const createPathVariants = (
  duration: number,
  delay: number,
  reduced: boolean
): Variants => ({
  hidden: {
    pathLength: reduced ? 1 : 0,
    opacity: reduced ? 1 : 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: reduced ? 0 : duration / 1000,
        ease: easing.editorial,
        delay: reduced ? 0 : delay / 1000,
      },
      opacity: {
        duration: 0.01,
        delay: reduced ? 0 : delay / 1000,
      },
    },
  },
});

const createContainerVariants = (
  duration: number,
  reduced: boolean
): Variants => ({
  hidden: {
    pathLength: reduced ? 1 : 0,
    opacity: reduced ? 1 : 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: reduced ? 0 : duration / 1000,
        ease: easing.editorial,
      },
      opacity: {
        duration: 0.01,
      },
    },
  },
});

export const DrawCheckIcon = ({
  size = 'md',
  animate = true,
  delay = 200,
  duration = 500,
  className,
  strokeWidth = 1.5,
  color = 'currentColor',
  variant = 'check',
  onAnimationComplete,
}: DrawCheckIconProps) => {
  const prefersReducedMotion = useReducedMotion();
  const reduced = prefersReducedMotion || !animate;
  const pixelSize = getPixelSize(size);
  
  const pathVariants = createPathVariants(duration, delay, reduced);
  const containerVariants = createContainerVariants(duration * 0.6, reduced);
  
  // Stagger: container draws first, then checkmark
  const checkDelay = variant !== 'check' ? delay + (duration * 0.4) : delay;
  const checkPathVariants = createPathVariants(duration, checkDelay, reduced);

  const commonProps = {
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
      style={{ width: pixelSize, height: pixelSize }}
      initial="hidden"
      animate="visible"
      aria-hidden="true"
    >
      {/* Container shapes for circle-check and square-check variants */}
      {variant === 'circle-check' && (
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          {...commonProps}
          variants={containerVariants}
        />
      )}
      
      {variant === 'square-check' && (
        <motion.rect
          x="3"
          y="3"
          width="18"
          height="18"
          {...commonProps}
          variants={containerVariants}
        />
      )}
      
      {/* Checkmark path */}
      <motion.path
        d="M7 13l3 3 7-7"
        {...commonProps}
        variants={checkPathVariants}
        onAnimationComplete={() => {
          if (!reduced && onAnimationComplete) {
            onAnimationComplete();
          }
        }}
      />
    </motion.svg>
  );
};

export default DrawCheckIcon;
