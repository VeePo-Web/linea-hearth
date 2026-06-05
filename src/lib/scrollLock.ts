let lockCount = 0;
let savedScrollY = 0;
let lockedPathname = '';

export function lockScroll() {
  if (lockCount === 0) {
    savedScrollY = window.scrollY;
    lockedPathname = typeof window !== 'undefined' ? window.location.pathname : '';
    document.documentElement.style.setProperty('--scroll-y', `-${savedScrollY}px`);
    document.documentElement.classList.add('scroll-locked');
  }
  lockCount++;
}

export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.documentElement.classList.remove('scroll-locked');
    document.documentElement.style.removeProperty('--scroll-y');

    // Only restore scroll if we're still on the same page. If the route
    // changed while a modal/drawer was open (e.g. tapping "Full Details"
    // or "Checkout"), let the new page's ScrollToTop control scroll instead
    // of clobbering it back to the previous page's offset.
    const samePath =
      typeof window !== 'undefined' &&
      window.location.pathname === lockedPathname;

    if (samePath) {
      const max = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      window.scrollTo(0, Math.min(savedScrollY, max));
    }
  }
}
