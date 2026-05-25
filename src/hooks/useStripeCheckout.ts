import { useState, useCallback } from "react";
import { useCart } from "./useCart";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment, isPaymentsConfigured } from "@/lib/stripe";

interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface CheckoutData {
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone?: string;
  shippingAddress: ShippingAddress;
  shippingMethod: "standard" | "express" | "overnight";
  discountCodeId?: string;
  abandonedCartId?: string;
}

interface CheckoutResult {
  success: boolean;
  clientSecret?: string;
  orderId?: string;
  sessionId?: string;
  error?: string;
  configured?: boolean;
  message?: string;
}

export const useStripeCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const { items } = useCart();

  const initiateCheckout = useCallback(
    async (data: CheckoutData): Promise<CheckoutResult> => {
      setIsLoading(true);
      setError(null);

      if (!isPaymentsConfigured()) {
        const msg = "Payments are not configured.";
        setError(msg);
        setIsLoading(false);
        return { success: false, configured: false, message: msg };
      }

      try {
        const checkoutItems = items.map((item) => ({
          productId: item.productId || item.id?.toString() || "",
          variantId: undefined,
          name: item.name,
          image: item.image?.startsWith("http")
            ? item.image
            : `${window.location.origin}${item.image ?? ""}`,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        }));

        const returnUrl = `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;

        const { data: result, error: invokeErr } = await supabase.functions.invoke(
          "create-checkout-session",
          {
            body: {
              items: checkoutItems,
              ...data,
              returnUrl,
              environment: getStripeEnvironment(),
            },
          },
        );

        if (invokeErr || !result?.success || !result?.clientSecret) {
          const msg = result?.error || invokeErr?.message || "Checkout failed";
          setError(msg);
          return { success: false, error: msg };
        }

        setClientSecret(result.clientSecret);
        setOrderId(result.orderId ?? null);
        return result as CheckoutResult;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "An error occurred";
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setIsLoading(false);
      }
    },
    [items],
  );

  const resetCheckout = useCallback(() => {
    setClientSecret(null);
    setOrderId(null);
    setError(null);
  }, []);

  return {
    initiateCheckout,
    resetCheckout,
    isLoading,
    error,
    clientSecret,
    orderId,
    clearError: () => setError(null),
  };
};
