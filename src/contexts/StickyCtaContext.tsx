import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

/**
 * Coordinates which sticky CTA "owns" the bottom of the mobile viewport at
 * any given moment. Prevents the global MobileStickyATC and the
 * CompleteTheLook bundle CTA from stacking on top of each other.
 *
 * Pattern: any sticky bar claims the slot with `claim(id)` when it intersects
 * the viewport, and releases it on unmount or when it scrolls out. The global
 * ATC only renders when no higher-priority claim is active.
 */

type StickySlot = "atc" | "bundle";

interface StickyCtaContextValue {
  /** Returns true if this id currently owns the sticky slot. */
  isOwner: (id: StickySlot) => boolean;
  /** Claim ownership. Higher priority wins; "bundle" outranks "atc". */
  claim: (id: StickySlot) => void;
  release: (id: StickySlot) => void;
}

const StickyCtaContext = createContext<StickyCtaContextValue | undefined>(undefined);

const PRIORITY: Record<StickySlot, number> = { atc: 1, bundle: 2 };

export const StickyCtaProvider = ({ children }: { children: ReactNode }) => {
  const claimsRef = useRef<Set<StickySlot>>(new Set());
  const [owner, setOwner] = useState<StickySlot | null>(null);

  const recomputeOwner = useCallback(() => {
    let best: StickySlot | null = null;
    for (const c of claimsRef.current) {
      if (!best || PRIORITY[c] > PRIORITY[best]) best = c;
    }
    setOwner(best);
  }, []);

  const claim = useCallback((id: StickySlot) => {
    claimsRef.current.add(id);
    recomputeOwner();
  }, [recomputeOwner]);

  const release = useCallback((id: StickySlot) => {
    claimsRef.current.delete(id);
    recomputeOwner();
  }, [recomputeOwner]);

  const isOwner = useCallback((id: StickySlot) => owner === id, [owner]);

  const value = useMemo(() => ({ isOwner, claim, release }), [isOwner, claim, release]);

  return <StickyCtaContext.Provider value={value}>{children}</StickyCtaContext.Provider>;
};

export const useStickyCtaOwner = (id: StickySlot) => {
  const ctx = useContext(StickyCtaContext);
  // Safe-fall: if provider isn't mounted, the slot is always "owned" — preserves
  // legacy behavior for surfaces that never compete (e.g. PLP).
  if (!ctx) {
    return { isOwner: true, claim: () => {}, release: () => {} };
  }
  return { isOwner: ctx.isOwner(id), claim: () => ctx.claim(id), release: () => ctx.release(id) };
};
