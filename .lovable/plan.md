## Swap tagline to "THE TRIBE OF JUDAH LIVES IN YOU"

**1. Cart strip — `src/components/cart/AffirmationStrip.tsx`**
Replace `Anointed — Worn with Purpose` with `THE TRIBE OF JUDAH LIVES IN YOU`. Already uppercase + tracking-[0.2em], no style changes needed.

**2. Checkout — `src/components/checkout/MissionStrip.tsx`**
Replace the current copy (`Every piece crafted with purpose — designed to inspire`) with `THE TRIBE OF JUDAH LIVES IN YOU`, styled to match the cart strip (10px, tracking-[0.2em], uppercase) so it reads as the same brand line. Keep the `Gem` icon + dark bar wrapper untouched — this is the single checkout placement (renders once via `CheckoutHeader`).

No other files touched. No new components, no route changes.