import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { formatPrice } from "@/lib/currency";

interface RecoveredItem {
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_size: string | null;
  variant_color: string | null;
  quantity: number;
  unit_price_cents: number;
  product_image_url: string | null;
}

interface RecoveryResponse {
  success?: boolean;
  orderId?: string;
  email?: string;
  discountCode?: string | null;
  reason?: "expired" | "payment_failed" | null;
  items?: RecoveredItem[];
  error?: string;
}

// Stable string-to-int hash so cart dedupe/update-by-id still works
// when the source is an order_items.product_id UUID.
function hashId(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const RecoverPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItems, clearCart } = useCart();
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No recovery token provided.");
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/recover-payment?token=${encodeURIComponent(token)}`,
          { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } },
        );
        const data: RecoveryResponse = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || "Failed to restore your cart.");
        }

        clearCart();
        await new Promise((r) => setTimeout(r, 100));

        const items = (data.items || []).map((it) => {
          const price = it.unit_price_cents / 100;
          return {
            id: hashId(`${it.product_id || it.product_name}|${it.variant_id || ""}`),
            name: it.product_name,
            price,
            priceFormatted: formatPrice(price),
            image: it.product_image_url || "/placeholder.svg",
            category: "shop",
            size: it.variant_size ?? undefined,
            color: it.variant_color ?? undefined,
            productId: it.product_id ?? undefined,
            variantId: it.variant_id ?? undefined,
            quantity: it.quantity,
          };
        });

        addItems(items, { openDrawer: false });

        if (data.discountCode) {
          localStorage.setItem("loj-recovery-discount-code", data.discountCode);
        }

        setStatus("success");
        toast({
          title: "Cart restored",
          description: "Taking you back to checkout.",
        });

        // Brief pause so users register the success state, then redirect.
        setTimeout(() => navigate("/checkout"), 900);
      } catch (e) {
        setStatus("error");
        setErrorMessage(e instanceof Error ? e.message : "Unable to restore cart.");
      }
    })();
  }, [token, addItems, clearCart, toast, navigate]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
          className="max-w-md w-full text-center space-y-8"
        >
          {status === "loading" && (
            <>
              <div className="flex items-center justify-center gap-3">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2.5 h-2.5 bg-foreground rounded-full"
                    animate={prefersReducedMotion ? {} : { opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
              <h1 className="text-sm font-medium uppercase tracking-[0.3em]">
                Restoring your cart
              </h1>
            </>
          )}

          {status === "success" && (
            <>
              <h1 className="text-3xl font-light uppercase tracking-[0.08em]">Ready</h1>
              <p className="text-sm text-muted-foreground">
                Taking you to checkout…
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 mx-auto border border-muted-foreground/30 flex items-center justify-center">
                <span className="text-2xl text-muted-foreground font-light">—</span>
              </div>
              <h1 className="text-2xl font-light uppercase tracking-[0.08em]">
                Unable to restore
              </h1>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={() => navigate("/category/shop")}
                  className="w-full rounded-none h-14 text-xs uppercase tracking-[0.2em]"
                  size="lg"
                >
                  Browse Collection
                </Button>
                <button
                  onClick={() => navigate("/cart")}
                  className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  View Cart
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default RecoverPayment;
