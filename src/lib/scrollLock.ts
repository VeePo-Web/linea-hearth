let savedScrollY = 0;

export function lockScroll() {
  savedScrollY = window.scrollY;
  document.documentElement.style.setProperty('--scroll-y', `-${savedScrollY}px`);
  document.documentElement.classList.add('scroll-locked');
}

export function unlockScroll() {
  document.documentElement.classList.remove('scroll-locked');
  document.documentElement.style.removeProperty('--scroll-y');
  window.scrollTo(0, savedScrollY);
}
