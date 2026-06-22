import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Lock, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useSizeMemory } from "@/hooks/useSizeMemory";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useStickyCtaOwner } from "@/contexts/StickyCtaContext";
import {
  useCompleteTheLook,
  logUpsellEvent,
  type LookProductRow,
} from "@/hooks/useCompleteTheLook";
import { productIdToCartId, formatPrice } from "@/lib/cartUtils";
import { easing } from "@/lib/animations";

const SESSION_KEY = "loj-session-id";
function getSessionId() {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    try { localStorage.setItem(SESSION_KEY, id); } catch { /* ignore */ }
  }
  return id;
}

interface Props {
  currentProductId: string;
}

const PRICE_FALLBACK = (n: number) => `$${n.toFixed(2)} CAD`;
const fmt = (n: number) => {
  try { return formatPrice(n); } catch { return PRICE_FALLBACK(n); }
};

const CompleteTheLookBundle = ({ currentProductId }: Props) => {
  const ctl = useCompleteTheLook(currentProductId);
  const { addItems } = useCart();
  const { rememberSize } = useSizeMemory();
  const prefersReducedMotion = useReducedMotion();
  const sticky = useStickyCtaOwner("bundle");

  const sectionRef = useRef<HTMLElement>(null);
  const [hasImpression, setHasImpression] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const sessionId = useMemo(getSessionId, []);

  // Telemetry: impression once the module is on screen.
  useEffect(() => {
    if (!sectionRef.current || hasImpression || !ctl.look) return;
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          setHasImpression(true);
          logUpsellEvent({
            sessionId,
            anchorProductId: currentProductId,
            lookId: ctl.look?.id ?? null,
            eventType: "impression",
            items: ctl.rows.map((r) => r.id),
            subtotalCents: Math.round(ctl.subtotal * 100),
            discountCents: Math.round(ctl.bundleSaving * 100),
          });
          obs.disconnect();
        }
      }
    }, { threshold: 0.25 });
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [hasImpression, ctl.look, ctl.rows, ctl.subtotal, ctl.bundleSaving, sessionId, currentProductId]);

  // Sticky CTA ownership while module is in view (mobile only).
  useEffect(() => {
    if (!sectionRef.current) return;
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) sticky.claim();
        else sticky.release();
      }
    }, { threshold: 0.05 });
    obs.observe(sectionRef.current);
    return () => { sticky.release(); obs.disconnect(); };
  }, [sticky]);

  if (ctl.isLoading) {
    return (
      <section className="w-full py-12 lg:py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="h-4 bg-muted rounded w-40 mb-6 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="aspect-[4/5] bg-muted animate-pulse" />
            <div className="space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-16 bg-muted animate-pulse" />)}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!ctl.look || !ctl.anchor || ctl.rows.length < 2) return null;

  const handleAddTheLook = () => {
    if (ctl.hasMissingSize) {
      // Soft-focus the first missing picker
      const el = document.querySelector<HTMLElement>("[data-ctl-row-missing='true']");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const items = ctl.selectedRows.map(({ row, size }) => {
      const variant = row.variants.find((v) => v.size === size);
      const unitPrice = (row.is_on_sale && row.sale_price != null ? row.sale_price : row.price) + (variant?.price_adjustment ?? 0);
      if (size) rememberSize(row.position || row.category_slug || "", size);
      return {
        id: productIdToCartId(row.id),
        name: row.name,
        price: unitPrice,
        priceFormatted: fmt(unitPrice),
        image: row.image_url,
        category: row.category_slug || "tops",
        size: size || undefined,
        productId: row.id,
        variantId: variant?.id,
        lookId: ctl.look!.id,
        lookName: ctl.look!.name,
      };
    });
    addItems(items, { openDrawer: true });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);

    logUpsellEvent({
      sessionId,
      anchorProductId: currentProductId,
      lookId: ctl.look!.id,
      eventType: ctl.selectedCount === ctl.rows.length ? "add_look" : "add_partial",
      items: items.map(i => ({ productId: i.productId, size: i.size })),
      subtotalCents: Math.round(ctl.subtotal * 100),
      discountCents: Math.round(ctl.bundleSaving * 100),
    });
  };

  return (
    <section
      ref={sectionRef}
      className="w-full py-12 lg:py-20 px-6 bg-background"
      aria-label="Complete the look"
    >
      <div className="max-w-6xl mx-auto">
        {/* Editorial header */}
        <div className="mb-8 lg:mb-10">
          <p className="text-[10px] font-light text-muted-foreground uppercase tracking-[0.25em] mb-1.5">
            From The {ctl.look.name}
          </p>
          <p className="text-base lg:text-lg font-light italic text-foreground mb-1 max-w-2xl">
            "{ctl.look.headline}"
          </p>
          {ctl.look.scripture_reference && (
            <p className="text-[11px] text-muted-foreground/80 font-light">
              {ctl.look.scripture_reference}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-6 lg:gap-12 items-start">
          {/* Look hero */}
          <div className="relative aspect-[4/5] bg-muted overflow-hidden">
            <img
              src={ctl.look.image_url}
              alt={ctl.look.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/70 text-white text-[9px] uppercase tracking-[0.2em] font-light">
              The Look
            </div>
          </div>

          {/* Bundle column */}
          <div className="flex flex-col">
            <ul className="divide-y divide-border" role="list">
              {ctl.rows.map((row) => (
                <BundleRow
                  key={row.id}
                  row={row}
                  entry={ctl.selection[row.id]}
                  onToggle={() => {
                    ctl.toggleInclude(row.id);
                    logUpsellEvent({
                      sessionId,
                      anchorProductId: currentProductId,
                      lookId: ctl.look?.id,
                      eventType: "toggle",
                      items: { productId: row.id, included: !ctl.selection[row.id]?.included },
                    });
                  }}
                  onSize={(size) => {
                    ctl.setSize(row.id, size);
                    logUpsellEvent({
                      sessionId,
                      anchorProductId: currentProductId,
                      lookId: ctl.look?.id,
                      eventType: "size_pick",
                      items: { productId: row.id, size },
                    });
                  }}
                />
              ))}
            </ul>

            {/* Totals */}
            <div className="mt-5 space-y-1.5 text-sm font-light">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Bundle subtotal</span>
                <span>{fmt(ctl.subtotal)}</span>
              </div>
              {ctl.bundleSaving > 0 && (
                <div className="flex items-center justify-between text-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 bg-foreground" />
                    Save as a set
                  </span>
                  <span className="text-foreground">−{fmt(ctl.bundleSaving)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-foreground pt-2 border-t border-border">
                <span className="uppercase tracking-wider text-[11px]">Total</span>
                <span className="text-base">{fmt(ctl.total)}</span>
              </div>
            </div>

            {/* Primary CTA */}
            <div className="mt-5">
              <motion.button
                onClick={handleAddTheLook}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                disabled={ctl.selectedCount === 0}
                className="w-full h-12 bg-foreground text-background text-xs uppercase tracking-[0.2em] font-light flex items-center justify-center gap-3 hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-none transition-colors"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {justAdded ? (
                    <motion.span
                      key="added"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="inline-flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Look Added
                    </motion.span>
                  ) : ctl.hasMissingSize ? (
                    <motion.span key="missing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      Pick a Size to Continue
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="inline-flex items-center gap-3"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add the Look · {fmt(ctl.total)}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              <Link
                to={`/lookbook#look-${ctl.look.id}`}
                className="block mt-3 text-center text-[11px] font-light uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
              >
                View Full Look
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface BundleRowProps {
  row: LookProductRow;
  entry?: { size: string | null; included: boolean; anchored: boolean };
  onToggle: () => void;
  onSize: (size: string) => void;
}

const BundleRow = ({ row, entry, onToggle, onSize }: BundleRowProps) => {
  const sizedVariants = row.variants.filter((v) => v.size);
  const sizes = Array.from(new Set(sizedVariants.map((v) => v.size!)));
  const inStockSet = new Set(sizedVariants.map((v) => v.size!));
  const anyStock = true; // Print-on-demand: always available
  const size = entry?.size ?? null;
  const included = entry?.included ?? false;
  const anchored = entry?.anchored ?? false;
  const missingSize = included && sizes.length > 0 && !size;

  const basePrice = row.is_on_sale && row.sale_price != null ? row.sale_price : row.price;
  const variant = row.variants.find((v) => v.size === size);
  const unitPrice = basePrice + (variant?.price_adjustment ?? 0);

  return (
    <li className="py-4 flex items-start gap-4" data-ctl-row-missing={missingSize}>
      {/* Check / lock */}
      <button
        type="button"
        onClick={onToggle}
        disabled={anchored || !anyStock}
        aria-pressed={included}
        aria-label={anchored ? "This item — locked into bundle" : included ? `Remove ${row.name} from bundle` : `Add ${row.name} to bundle`}
        className={`mt-1 shrink-0 w-5 h-5 border flex items-center justify-center transition-colors rounded-none
          ${anchored ? "bg-foreground border-foreground text-background"
            : included ? "bg-foreground border-foreground text-background"
            : "bg-background border-border text-transparent hover:border-foreground"}
          ${!anyStock ? "opacity-40" : ""}
        `}
      >
        {anchored ? <Lock className="w-3 h-3" /> : <Check className="w-3.5 h-3.5" />}
      </button>

      {/* Thumb */}
      <Link to={`/product/${row.slug}`} className="shrink-0 w-16 h-20 bg-muted overflow-hidden">
        <img src={row.image_url} alt={row.name} className="w-full h-full object-cover" loading="lazy" />
      </Link>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/product/${row.slug}`} className="block">
              <p className="text-sm font-light text-foreground truncate">{row.name}</p>
            </Link>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
              {anchored ? "This item" : (row.position || "From the look")}
            </p>
          </div>
          <p className="text-sm font-light text-foreground whitespace-nowrap">
            {fmt(unitPrice)}
          </p>
        </div>

        {/* Size pills */}
        {sizes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Size for ${row.name}`}>
            {sizes.map((s) => {
              const inStock = inStockSet.has(s);
              const isSel = size === s;
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={isSel}
                  disabled={!inStock}
                  onClick={() => onSize(s)}
                  className={`min-w-[36px] h-8 px-2 text-[11px] font-light tracking-wider transition-colors rounded-none border
                    ${!inStock
                      ? "text-muted-foreground/40 border-border/40 line-through cursor-not-allowed"
                      : isSel
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-border hover:border-foreground"}
                  `}
                >
                  {s}
                </button>
              );
            })}
          </div>
        )}

        {!anyStock && (
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Restocking soon
          </p>
        )}
      </div>
    </li>
  );
};

export default CompleteTheLookBundle;
