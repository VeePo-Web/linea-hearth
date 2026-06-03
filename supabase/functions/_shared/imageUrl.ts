// Shared image URL resolver for edge functions.
// Mirror of src/lib/imageUrl.ts (Deno cannot import from src/).
export const SITE_URL = "https://lineofjudah.clothing";
export const BRAND_FALLBACK_IMAGE = `${SITE_URL}/logo.png`;

export function resolveImageUrl(url?: string | null): string {
  if (!url) return BRAND_FALLBACK_IMAGE;
  const trimmed = String(url).trim();
  if (!trimmed || trimmed === "/placeholder.svg" || trimmed.endsWith("/placeholder.svg")) {
    return BRAND_FALLBACK_IMAGE;
  }
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${SITE_URL}${trimmed}`;
  return trimmed;
}
