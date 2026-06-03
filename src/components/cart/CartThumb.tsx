import { useState } from "react";
import { cn } from "@/lib/utils";
import { resolveImageUrl, BRAND_FALLBACK_IMAGE } from "@/lib/imageUrl";

interface CartThumbProps {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

/**
 * Cart/email-grade thumbnail that always renders.
 * - Resolves null/empty/relative URLs to an absolute brand-safe URL.
 * - On load error, swaps to the brand fallback so the slot is never blank.
 */
export const CartThumb = ({ src, alt, className, loading = "lazy" }: CartThumbProps) => {
  const [errored, setErrored] = useState(false);
  const resolved = errored ? BRAND_FALLBACK_IMAGE : resolveImageUrl(src);
  return (
    <img
      src={resolved}
      alt={alt}
      loading={loading}
      onError={() => {
        if (!errored) setErrored(true);
      }}
      className={cn("w-full h-full object-cover", className)}
    />
  );
};
