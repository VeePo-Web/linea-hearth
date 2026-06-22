/**
 * Per-product-type shipping engine for Line of Judah.
 *
 * Items are bucketed by `profile` (hat / tee / hoodie). For each bucket we
 * charge `first` once and `additional` for every extra unit. The buckets are
 * summed; if the order subtotal meets the free-shipping threshold, shipping
 * becomes $0. Anything outside Canada uses the international column.
 *
 * Pricing source-of-truth — keep in sync with src/lib/shipping.ts.
 */

export type ShippingProfile = "hat" | "tee" | "hoodie";

export const SHIPPING_PROFILES: ShippingProfile[] = ["hat", "tee", "hoodie"];

export const FREE_SHIPPING_THRESHOLD_CENTS = 25000; // $250 CAD

interface ProfileRate {
  ca: { first: number; additional: number };
  intl: { first: number; additional: number };
}

/** All values in CENTS (CAD). */
export const SHIPPING_RATES: Record<ShippingProfile, ProfileRate> = {
  hat:    { ca: { first: 650,  additional: 200 }, intl: { first: 1200, additional: 300 } },
  tee:    { ca: { first: 700,  additional: 300 }, intl: { first: 1300, additional: 350 } },
  hoodie: { ca: { first: 1200, additional: 300 }, intl: { first: 2200, additional: 500 } },
};

/** Fallback when a product/category has no profile set. */
export const DEFAULT_PROFILE: ShippingProfile = "tee";

export function normalizeProfile(value: unknown): ShippingProfile {
  return value === "hat" || value === "tee" || value === "hoodie" ? value : DEFAULT_PROFILE;
}

export function isCanadaCountry(country: string | undefined | null): boolean {
  const c = (country || "CA").trim().toUpperCase();
  return c === "CA" || c === "CANADA";
}

export interface ShippingLine {
  profile: ShippingProfile;
  quantity: number;
}

/**
 * Compute shipping in cents.
 * @param items per-line profile + quantity
 * @param country destination country code or name
 * @param subtotalCents authorized subtotal in cents (for free-ship test)
 */
export function computeShippingCents(
  items: ShippingLine[],
  country: string | undefined | null,
  subtotalCents: number,
): number {
  if (subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) return 0;
  const ca = isCanadaCountry(country);
  // Aggregate qty per profile
  const qtyByProfile: Record<ShippingProfile, number> = { hat: 0, tee: 0, hoodie: 0 };
  for (const it of items) {
    if (!it || it.quantity <= 0) continue;
    qtyByProfile[normalizeProfile(it.profile)] += it.quantity;
  }
  let total = 0;
  for (const p of SHIPPING_PROFILES) {
    const qty = qtyByProfile[p];
    if (qty <= 0) continue;
    const rate = ca ? SHIPPING_RATES[p].ca : SHIPPING_RATES[p].intl;
    total += rate.first + rate.additional * Math.max(0, qty - 1);
  }
  return total;
}
