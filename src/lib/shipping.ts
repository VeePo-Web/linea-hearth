/**
 * Per-product-type shipping engine (client mirror).
 *
 * MUST stay in sync with supabase/functions/_shared/shipping.ts — same
 * rates, same buckets, same threshold. The edge function is the authority;
 * this client copy exists only for live display in cart/checkout.
 */

export type ShippingProfile = "hat" | "tee" | "hoodie";

export const SHIPPING_PROFILES: ShippingProfile[] = ["hat", "tee", "hoodie"];

export const FREE_SHIPPING_THRESHOLD_CENTS = 25000; // $250 CAD
export const FREE_SHIPPING_THRESHOLD = FREE_SHIPPING_THRESHOLD_CENTS / 100;

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

export const PROFILE_LABEL: Record<ShippingProfile, string> = {
  hat: "Hat",
  tee: "Tee / Top",
  hoodie: "Hoodie / Heavy",
};

export const DEFAULT_PROFILE: ShippingProfile = "tee";

export function normalizeProfile(value: unknown): ShippingProfile {
  return value === "hat" || value === "tee" || value === "hoodie" ? value : DEFAULT_PROFILE;
}

/**
 * Best-effort derivation of a shipping profile from a category slug/label
 * when a product/category row hasn't supplied an explicit profile. Lets the
 * cart UI render a credible shipping estimate before checkout. The edge
 * function is still the authority at payment time.
 */
export function profileFromCategory(category: string | undefined | null): ShippingProfile {
  const c = (category || "").trim().toLowerCase();
  if (!c) return DEFAULT_PROFILE;
  if (c.includes("hat") || c.includes("cap") || c.includes("beanie") || c.includes("visor")) return "hat";
  if (c.includes("hoodie") || c.includes("sweater") || c.includes("sweatshirt") || c.includes("quarter-zip") || c.includes("quarter zip") || c.includes("zip-up") || c.includes("zip up") || c.includes("pullover")) return "hoodie";
  return "tee";
}

export function isCanadaCountry(country: string | undefined | null): boolean {
  const c = (country || "CA").trim().toUpperCase();
  return c === "CA" || c === "CANADA";
}

export interface ShippingLine {
  profile: ShippingProfile;
  quantity: number;
}

export function computeShippingCents(
  items: ShippingLine[],
  country: string | undefined | null,
  subtotalCents: number,
): number {
  if (subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) return 0;
  const ca = isCanadaCountry(country);
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

/** Dollar-denominated convenience wrapper for legacy call sites. */
export function computeShippingDollars(
  items: ShippingLine[],
  country: string | undefined | null,
  subtotal: number,
): number {
  return computeShippingCents(items, country, Math.round(subtotal * 100)) / 100;
}
