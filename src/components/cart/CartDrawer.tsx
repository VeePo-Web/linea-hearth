import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import FreeShippingBar from "./FreeShippingBar";
import CartItem from "./CartItem";
import SmartUpsell from "./SmartUpsell";
import TrustRow from "./TrustRow";
import AffirmationStrip from "./AffirmationStrip";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface CartDrawerProps {
  onViewFavorites?: () => void;
}

const CartDrawer = ({ onViewFavorites }: CartDrawerProps) => {
  const { items, itemCount, subtotal, isCartOpen, closeCart } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Focus trap and escape key handling
  useEffect(() => {
    if (!isCartOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 h-screen">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 h-screen transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className={cn(
          "absolute right-0 top-0 h-screen w-full max-w-md bg-background border-l border-border flex flex-col",
          "animate-slide-in-right"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 id="cart-title" className="text-lg font-light text-foreground">
            Your Bag ({itemCount})
          </h2>
          <button
            onClick={closeCart}
            className="p-2 text-foreground hover:text-muted-foreground transition-colors -mr-2"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress - Sticky */}
        {items.length > 0 && <FreeShippingBar />}

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 py-12">
              <div className="w-16 h-16 mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="w-8 h-8 text-muted-foreground">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
              <p className="text-muted-foreground text-sm text-center mb-6">
                Your shopping bag is empty.<br />
                Discover our curated collections.
              </p>
              <Button
                asChild
                variant="outline"
                className="rounded-none"
                onClick={closeCart}
              >
                <Link to="/category/shop">Explore Collection</Link>
              </Button>

              {/* Mobile favorites toggle */}
              {onViewFavorites && (
                <button
                  onClick={() => {
                    closeCart();
                    onViewFavorites();
                  }}
                  className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors md:hidden"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                  </svg>
                  View Favorites
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Cart items */}
              <div className="px-6 divide-y divide-border">
                {items.map(item => (
                  <CartItem key={`${item.id}-${item.size}-${item.color}`} item={item} />
                ))}
              </div>

              {/* Smart upsell */}
              <SmartUpsell />

              {/* Mobile favorites link */}
              {onViewFavorites && (
                <div className="px-6 py-4 border-t border-border md:hidden">
                  <button
                    onClick={() => {
                      closeCart();
                      onViewFavorites();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                    View Favorites
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer - Sticky at bottom when cart has items */}
        {items.length > 0 && (
          <div className="border-t border-border bg-background">
            {/* Affirmation strip */}
            <AffirmationStrip />

            {/* Subtotal + CTA */}
            <div className="px-6 py-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-lg font-medium text-foreground">
                  €{subtotal.toLocaleString('en-EU', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                Shipping and taxes calculated at checkout
              </p>

              <Button
                asChild
                className="w-full rounded-none h-12 text-sm uppercase tracking-wider"
                size="lg"
                onClick={closeCart}
              >
                <Link to="/checkout">
                  Proceed to Checkout
                </Link>
              </Button>

              <Button
                variant="ghost"
                className="w-full rounded-none text-sm"
                onClick={closeCart}
                asChild
              >
                <Link to="/category/shop">
                  Continue Shopping
                </Link>
              </Button>
            </div>

            {/* Trust row */}
            <TrustRow />
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
