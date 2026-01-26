import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart, CartItem } from "./useCart";

interface BundleRule {
  id: string;
  name: string;
  description: string | null;
  source_type: string;
  source_id: string | null;
  min_items: number;
  max_items: number | null;
  discount_type: string;
  discount_value: number;
  stacks_with_codes: boolean;
  priority: number;
}

interface LookProductInfo {
  look_id: string;
  look_name: string;
  total_products: number;
  product_ids: string[];
}

export interface BundleMatch {
  bundleRuleId: string;
  bundleName: string;
  lookId: string;
  lookName: string;
  itemsInCart: CartItem[];
  totalItemsInLook: number;
  discountPercent: number;
  savingsAmount: number;
  isComplete: boolean;
  missingProductIds: string[];
  nextTierItemsNeeded: number;
  nextTierDiscountPercent: number | null;
}

export interface UseBundleDiscountsReturn {
  activeBundles: BundleMatch[];
  totalBundleSavings: number;
  hasActiveBundles: boolean;
  bestIncompleteBundle: BundleMatch | null;
  isLoading: boolean;
  bundleDataForCheckout: Array<{
    bundleRuleId: string;
    lookId: string;
    itemProductIds: string[];
    claimedSavings: number;
  }>;
}

// Fetch bundle discount rules from database
function useBundleRules() {
  return useQuery({
    queryKey: ["bundle-discounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bundle_discounts")
        .select("*")
        .eq("is_active", true)
        .eq("source_type", "lookbook")
        .order("priority", { ascending: false });

      if (error) throw error;
      return (data || []) as BundleRule[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

// Fetch look product info to determine total products per look
function useLookProductInfo(lookIds: string[]) {
  return useQuery({
    queryKey: ["look-products-info", lookIds],
    queryFn: async () => {
      if (lookIds.length === 0) return [];

      const { data, error } = await supabase
        .from("lookbook_look_products")
        .select(`
          look_id,
          product_id,
          lookbook_looks!inner (
            id,
            name
          )
        `)
        .in("look_id", lookIds);

      if (error) throw error;

      // Group by look_id
      const lookMap = new Map<string, LookProductInfo>();
      
      (data || []).forEach((row: any) => {
        const lookId = row.look_id;
        const lookName = row.lookbook_looks?.name || "Look";
        
        if (!lookMap.has(lookId)) {
          lookMap.set(lookId, {
            look_id: lookId,
            look_name: lookName,
            total_products: 0,
            product_ids: [],
          });
        }
        
        const info = lookMap.get(lookId)!;
        info.total_products++;
        info.product_ids.push(row.product_id);
      });

      return Array.from(lookMap.values());
    },
    enabled: lookIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBundleDiscounts(): UseBundleDiscountsReturn {
  const { items } = useCart();
  const { data: bundleRules = [], isLoading: rulesLoading } = useBundleRules();

  // Extract unique lookIds from cart items
  const lookIds = useMemo(() => {
    const ids = new Set<string>();
    items.forEach((item) => {
      if (item.lookId) {
        ids.add(item.lookId);
      }
    });
    return Array.from(ids);
  }, [items]);

  const { data: lookInfos = [], isLoading: lookInfoLoading } = useLookProductInfo(lookIds);

  // Calculate bundle matches
  const bundleMatches = useMemo((): BundleMatch[] => {
    if (bundleRules.length === 0 || lookIds.length === 0) return [];

    const matches: BundleMatch[] = [];

    // Group cart items by lookId
    const itemsByLook = new Map<string, CartItem[]>();
    items.forEach((item) => {
      if (item.lookId) {
        if (!itemsByLook.has(item.lookId)) {
          itemsByLook.set(item.lookId, []);
        }
        itemsByLook.get(item.lookId)!.push(item);
      }
    });

    // For each look in cart, find the best applicable bundle rule
    itemsByLook.forEach((lookItems, lookId) => {
      const lookInfo = lookInfos.find((l) => l.look_id === lookId);
      if (!lookInfo) return;

      const itemCount = lookItems.length;
      
      // Find the best matching rule (highest min_items that we qualify for)
      const applicableRules = bundleRules
        .filter((rule) => {
          const meetsMin = itemCount >= rule.min_items;
          const meetsMax = !rule.max_items || itemCount <= rule.max_items;
          const matchesSource = !rule.source_id || rule.source_id === lookId;
          return meetsMin && meetsMax && matchesSource;
        })
        .sort((a, b) => b.min_items - a.min_items); // Prefer higher tier

      const bestRule = applicableRules[0];
      
      // Find next tier rule (for progress display)
      const nextTierRule = bundleRules
        .filter((rule) => rule.min_items > itemCount)
        .sort((a, b) => a.min_items - b.min_items)[0];

      // Calculate savings
      const bundleSubtotal = lookItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const discountPercent = bestRule?.discount_value || 0;
      const savingsAmount = bestRule
        ? bundleSubtotal * (discountPercent / 100)
        : 0;

      // Find missing product IDs
      const cartProductIds = new Set(
        lookItems.map((item) => item.productId).filter(Boolean)
      );
      const missingProductIds = lookInfo.product_ids.filter(
        (id) => !cartProductIds.has(id)
      );

      matches.push({
        bundleRuleId: bestRule?.id || "",
        bundleName: bestRule?.name || "",
        lookId,
        lookName: lookInfo.look_name,
        itemsInCart: lookItems,
        totalItemsInLook: lookInfo.total_products,
        discountPercent,
        savingsAmount,
        isComplete: missingProductIds.length === 0,
        missingProductIds,
        nextTierItemsNeeded: nextTierRule
          ? nextTierRule.min_items - itemCount
          : 0,
        nextTierDiscountPercent: nextTierRule?.discount_value || null,
      });
    });

    return matches;
  }, [items, bundleRules, lookInfos, lookIds]);

  // Calculate totals
  const totalBundleSavings = useMemo(
    () => bundleMatches.reduce((sum, match) => sum + match.savingsAmount, 0),
    [bundleMatches]
  );

  // Find best incomplete bundle (for "complete the look" prompt)
  const bestIncompleteBundle = useMemo(() => {
    const incomplete = bundleMatches.filter((m) => !m.isComplete);
    if (incomplete.length === 0) return null;
    // Prefer the one closest to completion
    return incomplete.sort(
      (a, b) =>
        a.missingProductIds.length - b.missingProductIds.length ||
        b.savingsAmount - a.savingsAmount
    )[0];
  }, [bundleMatches]);

  // Format data for checkout
  const bundleDataForCheckout = useMemo(() => {
    return bundleMatches
      .filter((m) => m.savingsAmount > 0)
      .map((m) => ({
        bundleRuleId: m.bundleRuleId,
        lookId: m.lookId,
        itemProductIds: m.itemsInCart
          .map((item) => item.productId)
          .filter((id): id is string => !!id),
        claimedSavings: m.savingsAmount,
      }));
  }, [bundleMatches]);

  return {
    activeBundles: bundleMatches.filter((m) => m.savingsAmount > 0),
    totalBundleSavings,
    hasActiveBundles: totalBundleSavings > 0,
    bestIncompleteBundle,
    isLoading: rulesLoading || lookInfoLoading,
    bundleDataForCheckout,
  };
}
