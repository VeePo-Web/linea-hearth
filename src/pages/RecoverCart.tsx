import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface RecoveredCartItem {
  id: number;
  name: string;
  price: number;
  priceFormatted: string;
  image: string;
  quantity: number;
  category: string;
  size?: string;
  color?: string;
}

interface RecoveryResponse {
  success: boolean;
  cartId: string;
  email: string;
  cartItems: RecoveredCartItem[];
  cartTotal: number;
  discountCode?: string;
  error?: string;
}

// Pulsing dots loading indicator
const LoadingDots = () => (
  <div className="flex items-center justify-center gap-2">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-2 h-2 bg-foreground rounded-full"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: i * 0.2,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

const RecoverCart = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem, clearCart } = useCart();
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [recoveredData, setRecoveredData] = useState<RecoveryResponse | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No recovery token provided');
      return;
    }

    const recoverCart = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/recover-cart?token=${token}`,
          {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
          }
        );

        const data: RecoveryResponse = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || 'Failed to recover cart');
        }

        // Clear existing cart and add recovered items
        clearCart();
        
        // Small delay to ensure cart is cleared
        await new Promise(resolve => setTimeout(resolve, 100));

        // Add each item to cart
        for (const item of data.cartItems) {
          addItem({
            id: item.id,
            name: item.name,
            price: item.price,
            priceFormatted: item.priceFormatted,
            image: item.image,
            category: item.category,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
          });
        }

        setRecoveredData(data);
        setStatus('success');

        toast({
          title: "Cart restored",
          description: data.discountCode 
            ? `Use code ${data.discountCode} for 15% off your order.`
            : "Your items are ready for checkout.",
        });

      } catch (error) {
        console.error('Cart recovery failed:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Failed to recover cart');
      }
    };

    recoverCart();
  }, [token, addItem, clearCart, toast]);

  const animationProps = prefersReducedMotion 
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-24">
        <motion.div
          {...animationProps}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-md w-full text-center"
        >
          {/* Loading State */}
          {status === 'loading' && (
            <div className="space-y-8">
              <LoadingDots />
              <div className="space-y-2">
                <h1 className="text-sm font-medium text-foreground uppercase tracking-[0.2em]">
                  Retrieving Your Order
                </h1>
                <p className="text-sm text-muted-foreground">
                  One moment...
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && recoveredData && (
            <motion.div 
              className="space-y-8"
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Checkmark */}
              <motion.div
                initial={prefersReducedMotion ? {} : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-16 h-16 mx-auto border border-foreground rounded-full flex items-center justify-center"
              >
                <Check className="w-7 h-7 text-foreground" strokeWidth={1.5} />
              </motion.div>

              {/* Headline */}
              <div className="space-y-2">
                <h1 className="text-2xl font-light text-foreground tracking-wide">
                  CART RESTORED
                </h1>
                <p className="text-sm text-muted-foreground">
                  {recoveredData.cartItems.length} item{recoveredData.cartItems.length !== 1 ? 's' : ''} ready for checkout
                </p>
              </div>

              {/* Discount Code */}
              {recoveredData.discountCode && (
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="border border-foreground p-6 space-y-3"
                >
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em]">
                    Your Exclusive Code
                  </p>
                  <p className="text-xl font-medium text-foreground tracking-[0.15em]">
                    {recoveredData.discountCode}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    15% off · Expires in 24 hours
                  </p>
                </motion.div>
              )}

              {/* Actions */}
              <motion.div 
                className="flex flex-col gap-3 pt-2"
                initial={prefersReducedMotion ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <Button
                  onClick={() => navigate('/checkout')}
                  className="w-full rounded-none h-12 text-xs uppercase tracking-[0.2em]"
                  size="lg"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Complete Your Order
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/category/shop')}
                  className="w-full rounded-none text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
                >
                  Continue Shopping
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <motion.div 
              className="space-y-8"
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* X mark */}
              <div className="w-16 h-16 mx-auto border border-muted-foreground/50 rounded-full flex items-center justify-center">
                <span className="text-2xl text-muted-foreground font-light">×</span>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <h1 className="text-lg font-light text-foreground uppercase tracking-[0.15em]">
                  Link Expired
                </h1>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  {errorMessage || 'This recovery link is no longer valid. Your cart may have expired or already been used.'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 pt-2">
                <Button
                  onClick={() => navigate('/category/shop')}
                  className="w-full rounded-none h-12 text-xs uppercase tracking-[0.2em]"
                  size="lg"
                >
                  Browse Collection
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="w-full rounded-none text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
                >
                  Return to Home
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default RecoverCart;