/**
 * Resolves an image URL to a guaranteed-renderable absolute URL.
 *
 * Handles three cases that otherwise produce broken thumbnails in the cart,
 * Stripe checkout, and email clients:
 *   - null / empty / placeholder → brand fallback (logo.png)
 *   - relative path (/foo.png) → absolute https URL on the canonical domain
 *   - already absolute → returned unchanged
 */

export const SITE_URL = "https://lineofjudah.clothing";
export const BRAND_FALLBACK_IMAGE = `${SITE_URL}/logo.png`;

export function resolveImageUrl(url?: string | null): string {
  if (!url) return BRAND_FALLBACK_IMAGE;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "/placeholder.svg" || trimmed.endsWith("/placeholder.svg")) {
    return BRAND_FALLBACK_IMAGE;
  }
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${SITE_URL}${trimmed}`;
  return trimmed;
}
