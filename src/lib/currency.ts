/**
 * Centralized currency configuration for Line of Judah
 * All pricing display must use these utilities for consistency.
 * Store currency is locked to CAD — every formatted price is suffixed
 * with " CAD" so customers and ops staff can never misread it as USD.
 */
import {
  computeShippingDollars,
  FREE_SHIPPING_THRESHOLD,
  profileFromCategory,
  type ShippingLine,
  type ShippingProfile,
} from "@/lib/shipping";

export const CURRENCY = {
  /** ISO 4217 currency code */
  code: 'CAD' as const,
  /** Display symbol */
  symbol: '$',
  /** Locale for formatting */
  locale: 'en-CA',
  /** Free shipping threshold in dollars (applies in CAD to both domestic and international) */
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
};

/**
 * Per-product-type shipping. Pass cart lines so we can bucket by profile.
 * Falls back to a tee-bucket single-item charge if items are omitted (legacy
 * callers) — keeps the free-shipping threshold authoritative either way.
 */
export function getShippingCost(
  country: string | undefined,
  subtotal: number,
  items?: Array<{ quantity: number; shippingProfile?: ShippingProfile; category?: string }>,
): number {
  const lines: ShippingLine[] = (items ?? [{ quantity: 1 }]).map((it) => ({
    profile: it.shippingProfile ?? profileFromCategory(it.category),
    quantity: it.quantity,
  }));
  return computeShippingDollars(lines, country, subtotal);
}

/**
 * Returns true if a given country code is Canada (default treats undefined as CA).
 */
export function isCanada(country: string | undefined): boolean {
  return (country || 'CA').trim().toUpperCase() === 'CA';
}

/**
 * Formats a numeric price as a CAD currency string with explicit "CAD" suffix.
 * @param price - Price in dollars (not cents)
 * @returns Formatted string like "$69.99 CAD"
 */
export function formatPrice(price: number): string {
  const v = (price ?? 0).toLocaleString(CURRENCY.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `$${v} CAD`;
}

/**
 * Formats a price from cents to CAD string ("$69.99 CAD")
 */
export function formatPriceCents(cents: number): string {
  return formatPrice((cents ?? 0) / 100);
}

/**
 * Formats a price without the currency symbol (just the number)
 * @param price - Price in dollars
 * @returns Formatted string like "69.99"
 */
export function formatPriceNumeric(price: number): string {
  return price.toFixed(2);
}

/**
 * Formats a price as a simple display string with CAD suffix.
 * @returns Formatted string like "$69.99 CAD"
 */
export function formatPriceSimple(price: number): string {
  return `$${(price ?? 0).toFixed(2)} CAD`;
}

/**
 * Formats a signed price delta (e.g. style upcharge chips). Returns
 * "+$15 CAD", "-$15 CAD", or "" when zero. Pass `fractionDigits` for cents.
 */
export function formatPriceDelta(delta: number, fractionDigits = 0): string {
  if (!delta) return '';
  const abs = Math.abs(delta).toFixed(fractionDigits);
  const sign = delta > 0 ? '+' : '-';
  return `${sign}$${abs} CAD`;
}
