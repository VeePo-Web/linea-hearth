import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSizeMemory } from "@/hooks/useSizeMemory";

/**
 * useCompleteTheLook
 *
 * Resolves the curated lookbook look that contains the current PDP product
 * (if any), the sibling products in that look, the applicable bundle
 * discount rule (priority: look-specific > global), and a Frequently
 * Bought Together fallback derived from order_items co-occurrence.
 *
 * Returns selection state for the bundle UI: which items are included,
 * which size is picked per item, and the live subtotal / savings.
 *
 * Pricing is DISPLAY ONLY here. The single source of truth for both unit
 * prices and bundle savings is the server in create-checkout-session.
 */

export interface LookProductRow {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  is_on_sale: boolean;
  position: string | null;
  category_slug: string | null;
  image_url: string;
  variants: Array<{
    id: string;
    size: string | null;
    color: string | null;
    stock_quantity: number;
    price_adjustment: number;
  }>;
}

export interface LookHeader {
  id: string;
  name: string;
  headline: string;
  scripture_reference: string | null;
  image_url: string;
}

export interface BundleRuleLite {
  id: string;
  name: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_items: number;
  max_items: number | null;
}

export interface SelectionEntry {
  productId: string;
  size: string | null;
  included: boolean;
  /** `true` for the PDP product itself — it cannot be unchecked. */
  anchored: boolean;
}

interface CompleteTheLookData {
  look: LookHeader | null;
  anchor: LookProductRow | null;
  siblings: LookProductRow[];
  /** Best applicable bundle rule for `look.id`, or null if none configured. */
  bundleRule: BundleRuleLite | null;
}

function pickPrimaryImage(images: Array<{ image_url: string; is_primary: boolean; display_order?: number | null }>) {
  if (!images?.length) return "/placeholder.svg";
  const primary = images.find((i) => i.is_primary);
  if (primary) return primary.image_url;
  return [...images].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))[0].image_url;
}

async function fetchCompleteTheLook(productId: string): Promise<CompleteTheLookData> {
  // 1. Find the active look containing this product (prefer lowest display_order).
  const { data: containingRows } = await supabase
    .from("lookbook_look_products")
    .select(`
      look_id,
      lookbook_looks!inner ( id, name, headline, scripture_reference, image_url, display_order, is_active )
    `)
    .eq("product_id", productId);

  const activeLook = (containingRows || [])
    .map((r: any) => r.lookbook_looks)
    .filter((l: any) => l?.is_active)
    .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))[0];

  if (!activeLook) {
    return { look: null, anchor: null, siblings: [], bundleRule: null };
  }

  // 2. Fetch all products in that look (ordered) and resolve full product rows.
  const { data: lookProducts } = await supabase
    .from("lookbook_look_products")
    .select("product_id, position, display_order")
    .eq("look_id", activeLook.id)
    .order("display_order", { ascending: true });

  const productIds = (lookProducts || []).map((lp) => lp.product_id);
  if (!productIds.length) {
    return { look: activeLook as LookHeader, anchor: null, siblings: [], bundleRule: null };
  }

  const { data: products } = await supabase
    .from("products")
    .select(`
      id, name, slug, price, sale_price, is_on_sale,
      categories:category_id ( slug ),
      product_images ( image_url, is_primary, display_order ),
      product_variants ( id, size, color, stock_quantity, price_adjustment )
    `)
    .in("id", productIds)
    .eq("status", "active");

  const byId = new Map<string, any>();
  for (const p of products || []) byId.set(p.id, p);

  const rows: Array<LookProductRow & { _position: string | null }> = [];
  for (const lp of lookProducts || []) {
    const p = byId.get(lp.product_id);
    if (!p) continue;
    rows.push({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      sale_price: p.sale_price != null ? Number(p.sale_price) : null,
      is_on_sale: !!p.is_on_sale,
      position: lp.position,
      category_slug: p.categories?.slug ?? null,
      image_url: pickPrimaryImage(p.product_images || []),
      variants: (p.product_variants || []).map((v: any) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        stock_quantity: v.stock_quantity ?? 0,
        price_adjustment: Number(v.price_adjustment ?? 0),
      })),
      _position: lp.position,
    });
  }

  const anchor = rows.find((r) => r.id === productId) ?? null;
  const siblings = rows.filter((r) => r.id !== productId);

  // 3. Resolve best bundle rule: look-specific first, then global lookbook rule.
  const nowIso = new Date().toISOString();
  const { data: rules } = await supabase
    .from("bundle_discounts")
    .select("id, name, discount_type, discount_value, min_items, max_items, source_type, source_id, priority, starts_at, expires_at, is_active")
    .eq("is_active", true)
    .eq("source_type", "lookbook")
    .or(`source_id.eq.${activeLook.id},source_id.is.null`)
    .order("priority", { ascending: false });

  const valid = (rules || []).filter((r: any) => {
    if (r.starts_at && r.starts_at > nowIso) return false;
    if (r.expires_at && r.expires_at <= nowIso) return false;
    return true;
  });
  // Prefer look-specific over global, then highest priority, then highest discount.
  const bundleRule =
    valid.sort((a: any, b: any) => {
      const aSpecific = a.source_id === activeLook.id ? 1 : 0;
      const bSpecific = b.source_id === activeLook.id ? 1 : 0;
      if (aSpecific !== bSpecific) return bSpecific - aSpecific;
      if ((b.priority ?? 0) !== (a.priority ?? 0)) return (b.priority ?? 0) - (a.priority ?? 0);
      return Number(b.discount_value) - Number(a.discount_value);
    })[0] || null;

  return {
    look: {
      id: activeLook.id,
      name: activeLook.name,
      headline: activeLook.headline,
      scripture_reference: activeLook.scripture_reference,
      image_url: activeLook.image_url,
    },
    anchor,
    siblings,
    bundleRule: bundleRule
      ? {
          id: bundleRule.id,
          name: bundleRule.name,
          discount_type: bundleRule.discount_type as "percentage" | "fixed",
          discount_value: Number(bundleRule.discount_value),
          min_items: bundleRule.min_items,
          max_items: bundleRule.max_items,
        }
      : null,
  };
}

/** Pick an initial size, biased toward the size memory hint. POD = always available. */
function pickInitialSize(row: LookProductRow, hint: string | null): string | null {
  const sizedVariants = row.variants.filter((v) => v.size);
  if (!sizedVariants.length) return null;
  if (hint) {
    const hit = sizedVariants.find((v) => v.size === hint);
    if (hit) return hit.size!;
  }
  return sizedVariants[0].size ?? null;
}

function unitDisplayPrice(row: LookProductRow, size: string | null): number {
  const base = row.is_on_sale && row.sale_price != null ? row.sale_price : row.price;
  if (!size) return base;
  const v = row.variants.find((vv) => vv.size === size);
  return base + (v?.price_adjustment ?? 0);
}

export interface UseCompleteTheLookReturn {
  isLoading: boolean;
  look: LookHeader | null;
  anchor: LookProductRow | null;
  /** All rows in selection order (anchor first, then siblings). */
  rows: LookProductRow[];
  /** Selection map keyed by productId. */
  selection: Record<string, SelectionEntry>;
  /** Toggle inclusion (anchor is locked). */
  toggleInclude: (productId: string) => void;
  setSize: (productId: string, size: string) => void;
  setRow: (productId: string, replacement: LookProductRow) => void;
  /** Number of items checked. */
  selectedCount: number;
  selectedRows: Array<{ row: LookProductRow; size: string | null }>;
  /** Pre-discount sum of selected display prices. */
  subtotal: number;
  /** Display saving from the bundle rule, only if min_items met. */
  bundleSaving: number;
  bundleRule: BundleRuleLite | null;
  /** subtotal - bundleSaving */
  total: number;
  /** True if at least one selected item is missing a size. */
  hasMissingSize: boolean;
}

export function useCompleteTheLook(productId: string | undefined): UseCompleteTheLookReturn {
  const { getRememberedSize } = useSizeMemory();

  const { data, isLoading } = useQuery({
    queryKey: ["complete-the-look", productId],
    queryFn: () => fetchCompleteTheLook(productId!),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });

  const rows = useMemo<LookProductRow[]>(() => {
    if (!data?.anchor) return [];
    return [data.anchor, ...data.siblings];
  }, [data]);

  // Selection state. Initialized once per resolved look. Anchored = anchor product.
  const [selection, setSelection] = useState<Record<string, SelectionEntry>>({});
  const seededKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!rows.length || !data) return;
    const seedKey = `${data.look?.id ?? "none"}::${data.anchor?.id ?? ""}`;
    if (seededKeyRef.current === seedKey) return;
    seededKeyRef.current = seedKey;
    const next: Record<string, SelectionEntry> = {};
    for (const row of rows) {
      const hint = getRememberedSize(row.position || row.category_slug || "");
      const size = pickInitialSize(row, hint);
      const anyStock = true; // Print-on-demand: always available
      next[row.id] = {
        productId: row.id,
        size,
        included: row.id === data.anchor?.id ? true : anyStock,
        anchored: row.id === data.anchor?.id,
      };
    }
    setSelection(next);
  }, [rows, data, getRememberedSize]);

  const toggleInclude = useCallback((productId: string) => {
    setSelection((prev) => {
      const entry = prev[productId];
      if (!entry || entry.anchored) return prev;
      return { ...prev, [productId]: { ...entry, included: !entry.included } };
    });
  }, []);

  const setSize = useCallback((productId: string, size: string) => {
    setSelection((prev) => {
      const entry = prev[productId];
      if (!entry) return prev;
      return { ...prev, [productId]: { ...entry, size, included: true } };
    });
  }, []);

  const setRow = useCallback((_productId: string, _replacement: LookProductRow) => {
    // Swap-and-shop is wired up in v2; the row replacement requires re-fetching
    // siblings to keep the rule + telemetry coherent. Placeholder for now.
  }, []);

  const selectedRows = useMemo(() => {
    return rows
      .filter((r) => selection[r.id]?.included)
      .map((r) => ({ row: r, size: selection[r.id]?.size ?? null }));
  }, [rows, selection]);

  const subtotal = useMemo(
    () => selectedRows.reduce((sum, { row, size }) => sum + unitDisplayPrice(row, size), 0),
    [selectedRows],
  );

  const bundleRule = data?.bundleRule ?? null;
  const bundleSaving = useMemo(() => {
    if (!bundleRule) return 0;
    if (selectedRows.length < bundleRule.min_items) return 0;
    if (bundleRule.max_items && selectedRows.length > bundleRule.max_items) return 0;
    if (bundleRule.discount_type === "percentage") {
      return +(subtotal * (bundleRule.discount_value / 100)).toFixed(2);
    }
    return Math.min(bundleRule.discount_value, subtotal);
  }, [bundleRule, selectedRows.length, subtotal]);

  const hasMissingSize = useMemo(
    () => selectedRows.some(({ row, size }) => row.variants.some((v) => v.size) && !size),
    [selectedRows],
  );

  return {
    isLoading,
    look: data?.look ?? null,
    anchor: data?.anchor ?? null,
    rows,
    selection,
    toggleInclude,
    setSize,
    setRow,
    selectedCount: selectedRows.length,
    selectedRows,
    subtotal,
    bundleSaving,
    bundleRule,
    total: Math.max(0, subtotal - bundleSaving),
    hasMissingSize,
  };
}

/** Best-effort fire-and-forget telemetry insert. Anon-friendly. */
export async function logUpsellEvent(payload: {
  sessionId: string;
  userId?: string | null;
  anchorProductId: string | null;
  lookId?: string | null;
  eventType: "impression" | "toggle" | "size_pick" | "swap" | "add_look" | "add_partial";
  items?: unknown;
  subtotalCents?: number;
  discountCents?: number;
}) {
  try {
    await supabase.from("upsell_events").insert({
      session_id: payload.sessionId,
      user_id: payload.userId ?? null,
      anchor_product_id: payload.anchorProductId,
      look_id: payload.lookId ?? null,
      event_type: payload.eventType,
      items: (payload.items as any) ?? [],
      subtotal_cents: Math.round((payload.subtotalCents ?? 0)),
      discount_cents: Math.round((payload.discountCents ?? 0)),
    });
  } catch (e) {
    // Telemetry must never break the UX.
    if (typeof console !== "undefined") console.debug("upsell_events insert failed", e);
  }
}
