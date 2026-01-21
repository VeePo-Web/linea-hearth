import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2, AlertCircle, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";

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

const RecoverCart = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem, clearCart } = useCart();
  const { toast } = useToast();
  
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

        // Show success toast
        toast({
          title: "Welcome back, soldier",
          description: data.discountCode 
            ? `Your cart has been restored. Use code ${data.discountCode} for 15% off!`
            : "Your cart has been restored. Ready to complete your mission.",
        });

      } catch (error) {
        console.error('Cart recovery failed:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Failed to recover cart');
      }
    };

    recoverCart();
  }, [token, addItem, clearCart, toast]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center"
        >
          {status === 'loading' && (
            <div className="space-y-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto"
              >
                <Loader2 className="w-16 h-16 text-primary" />
              </motion.div>
              <h1 className="text-2xl font-light text-foreground">
                RECOVERING YOUR MISSION
              </h1>
              <p className="text-muted-foreground">
                Stand by while we retrieve your gear...
              </p>
            </div>
          )}

          {status === 'success' && recoveredData && (
            <div className="space-y-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center"
              >
                <ShieldCheck className="w-10 h-10 text-primary" />
              </motion.div>

              <div className="space-y-2">
                <h1 className="text-3xl font-light text-foreground">
                  WELCOME BACK, SOLDIER
                </h1>
                <p className="text-muted-foreground">
                  Your cart has been restored with {recoveredData.cartItems.length} item{recoveredData.cartItems.length !== 1 ? 's' : ''}.
                </p>
              </div>

              {recoveredData.discountCode && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-accent/10 border border-accent p-6 space-y-2"
                >
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">
                    Your exclusive discount
                  </p>
                  <p className="text-2xl font-bold text-accent tracking-widest">
                    {recoveredData.discountCode}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    15% off your order • Expires in 24 hours
                  </p>
                </motion.div>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => navigate('/checkout')}
                  className="w-full rounded-none h-12 text-sm uppercase tracking-wider"
                  size="lg"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Proceed to Checkout
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/category/shop')}
                  className="w-full rounded-none"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-20 h-20 mx-auto bg-destructive/10 rounded-full flex items-center justify-center"
              >
                <AlertCircle className="w-10 h-10 text-destructive" />
              </motion.div>

              <div className="space-y-2">
                <h1 className="text-2xl font-light text-foreground">
                  MISSION COMPROMISED
                </h1>
                <p className="text-muted-foreground">
                  {errorMessage || 'We couldn\'t recover your cart. It may have expired or already been used.'}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => navigate('/category/shop')}
                  className="w-full rounded-none h-12 text-sm uppercase tracking-wider"
                  size="lg"
                >
                  Start Fresh
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="w-full rounded-none"
                >
                  Return Home
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default RecoverCart;
