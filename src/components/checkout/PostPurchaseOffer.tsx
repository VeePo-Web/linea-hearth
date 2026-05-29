import { useState, useEffect, useRef } from "react";
import { Clock, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

export interface UpsellOffer {
  token: string;
  expiresAt: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantLabel: string | null;
  imageUrl: string | null;
  priceCents: number;
  originalPriceCents: number;
  discountPct: number;
}

interface PostPurchaseOfferProps {
  isOpen: boolean;
  offer: UpsellOffer;
  customerEmail: string;
  onClose: () => void;
  onAccepted?: (childOrderId: string) => void;
}

type State = "idle" | "submitting" | "success" | "sca" | "declined" | "expired" | "error";

const PostPurchaseOffer = ({ isOpen, offer, customerEmail, onClose, onAccepted }: PostPurchaseOfferProps) => {
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((new Date(offer.expiresAt).getTime() - Date.now()) / 1000)),
  );
  const closedRef = useRef(false);

  // Countdown driven by absolute expiresAt
  useEffect(() => {
    if (!isOpen) return;
    const expiresMs = new Date(offer.expiresAt).getTime();
    const tick = () => {
      const s = Math.max(0, Math.floor((expiresMs - Date.now()) / 1000));
      setSecondsLeft(s);
      if (s <= 0 && state === "idle") setState("expired");
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [isOpen, offer.expiresAt, state]);

  const price = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const handleAccept = async () => {
    if (state !== "idle") return;
    setState("submitting");
    setErrorMsg(null);
    try {
      const { data, error } = await supabase.functions.invoke("accept-upsell-offer", {
        body: { token: offer.token },
      });
      if (error) {
        setState("error");
        setErrorMsg("We couldn't complete that. Try again from your cart.");
        return;
      }
      const outcome = (data as any)?.outcome;
      if (outcome === "charged") {
        setState("success");
        onAccepted?.((data as any).childOrderId);
        if (!closedRef.current) {
          setTimeout(() => {
            closedRef.current = true;
            onClose();
          }, 2500);
        }
      } else if (outcome === "authentication_required") {
        // Stripe SCA — full handling would mount Stripe Elements here.
        // Graceful fallback for v1: surface explicit message + dismiss.
        setState("sca");
      } else if (outcome === "out_of_stock") {
        setState("declined");
        setErrorMsg("Just sold out. We'll restock soon.");
      } else if (outcome === "expired") {
        setState("expired");
      } else {
        setState("declined");
        setErrorMsg("Your card couldn't be charged. Add it on your next order.");
      }
    } catch (_e) {
      setState("error");
      setErrorMsg("Connection hiccup. Try again from your cart.");
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isTerminal = state === "success" || state === "expired" || state === "declined" || state === "error" || state === "sca";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { closedRef.current = true; onClose(); } }}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-none border-foreground/20">
        {/* Timer header — Forest Green */}
        <div className="bg-[#4CAF50] text-white px-4 py-2 flex items-center justify-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="text-xs font-medium tracking-wide uppercase">
            {state === "idle" || state === "submitting" ? (
              <>One-Time Offer · {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</>
            ) : state === "success" ? "Added to your order" : "Offer closed"}
          </span>
        </div>

        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-foreground" />
            <DialogTitle className="text-lg font-light tracking-tight">
              Add one more — {offer.discountPct}% off
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 pt-2 space-y-4">
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-muted overflow-hidden flex-shrink-0">
              {offer.imageUrl && (
                <img src={offer.imageUrl} alt={offer.productName} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate">{offer.productName}</h3>
              {offer.variantLabel && (
                <p className="text-xs text-muted-foreground mt-1">{offer.variantLabel}</p>
              )}
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-lg font-medium text-foreground">{price(offer.priceCents)}</span>
                <span className="text-sm text-muted-foreground line-through">{price(offer.originalPriceCents)}</span>
                <span className="text-xs bg-[#4CAF50]/10 text-[#2E7D32] px-2 py-0.5">
                  −{offer.discountPct}%
                </span>
              </div>
            </div>
          </div>

          {state === "idle" || state === "submitting" ? (
            <>
              <div className="text-xs text-muted-foreground bg-muted/30 p-3 space-y-1 border-l-2 border-[#4CAF50]/40">
                <p>— One tap. No re-entering payment.</p>
                <p>— Ships together with your order.</p>
                <p>— Charged to the card you just used.</p>
              </div>
              <Button
                onClick={handleAccept}
                disabled={state === "submitting"}
                className="w-full h-12 text-base rounded-none bg-foreground text-background hover:bg-foreground/90"
              >
                {state === "submitting" ? "Charging your card…" : `Add to Order — ${price(offer.priceCents)}`}
              </Button>
              <button
                onClick={() => { closedRef.current = true; onClose(); }}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                No thanks
              </button>
            </>
          ) : state === "success" ? (
            <div className="flex items-start gap-3 p-4 bg-[#4CAF50]/10 border-l-2 border-[#4CAF50]">
              <CheckCircle2 className="h-5 w-5 text-[#2E7D32] mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground">Added — ships with your order.</p>
                <p className="text-xs text-muted-foreground mt-1">Confirmation sent to {customerEmail}.</p>
              </div>
            </div>
          ) : state === "sca" ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-muted/30 border-l-2 border-foreground/40">
                <AlertCircle className="h-5 w-5 text-foreground mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Your bank wants to verify this charge.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add this item from your cart on the next page and complete the bank check.
                  </p>
                </div>
              </div>
              <Button onClick={() => { closedRef.current = true; onClose(); }} className="w-full h-11 rounded-none">
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-muted/30 border-l-2 border-foreground/30">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {errorMsg ?? (state === "expired" ? "Offer ended." : "Your card couldn't be charged.")}
                </p>
              </div>
              <Button onClick={() => { closedRef.current = true; onClose(); }} className="w-full h-11 rounded-none" variant="outline">
                Close
              </Button>
            </div>
          )}

          {!isTerminal && state === "idle" && (
            <p className="text-[10px] text-center text-muted-foreground tracking-wide uppercase">
              Offer locked for this order only
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostPurchaseOffer;
