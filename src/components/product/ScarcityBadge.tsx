import { useMemo } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ScarcityBadgeProps {
  productId?: string;
  size?: string | null;
  className?: string;
  /** Compact variant for PLP tiles. */
  compact?: boolean;
}

/**
 * Deterministic limited-run scarcity strip. The "remaining" count is a
 * stable hash of productId (+ size) in the range 3–9, so it never
 * changes between renders for the same SKU but feels random across the
 * catalogue. Print-on-demand means we never actually sell out; this
 * exists purely as a conversion nudge.
 */
function hashToRange(seed: string, min: number, max: number) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const span = max - min + 1;
  return min + (Math.abs(h) % span);
}

const ScarcityBadge = ({ productId, size, className = "", compact = false }: ScarcityBadgeProps) => {
  const prefersReducedMotion = useReducedMotion();
  const seed = `${productId ?? "default"}::${size ?? ""}`;
  const remaining = useMemo(() => hashToRange(seed, 3, 9), [seed]);

  const copy = size
    ? `Only ${remaining} left in this size — selling fast`
    : `Limited run — moving quickly`;

  if (compact) {
    return (
      <div
        className={`flex items-center gap-1.5 text-[10px] font-light uppercase tracking-[0.15em] text-muted-foreground ${className}`}
      >
        <span className="relative inline-flex h-1.5 w-1.5">
          {!prefersReducedMotion && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
          )}
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
        <span>{size ? `Only ${remaining} left` : `Limited run`}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex items-center gap-2.5 border border-border bg-card px-3 py-2 ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="relative inline-flex h-2 w-2 flex-shrink-0">
        {!prefersReducedMotion && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
        )}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
      </span>
      <span className="text-[11px] font-light uppercase tracking-[0.15em] text-foreground">
        {copy}
      </span>
    </motion.div>
  );
};

export default ScarcityBadge;
