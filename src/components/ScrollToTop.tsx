import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  // Disable the browser's automatic scroll restoration so it never
  // re-applies a remembered position on top of our reset.
  useEffect(() => {
    if (typeof window === "undefined" || !("history" in window)) return;
    try {
      window.history.scrollRestoration = "manual";
    } catch {
      // no-op
    }
  }, []);

  useLayoutEffect(() => {
    // Respect in-page anchor links (e.g. /faq#shipping, /legal/...#section).
    if (hash) return;

    window.scrollTo(0, 0);

    // Defeat any late scroll writes (e.g. an unmounting modal calling
    // unlockScroll on the next frame) by re-asserting top after paint.
    const raf = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
