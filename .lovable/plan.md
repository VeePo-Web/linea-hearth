

# Performance & Polish Audit: Round 6 — Remaining Emerald Bleed, Emojis, and Cheap Patterns

## Findings

### 1. PostPurchaseSignup Success State — Emerald Gradient + Circle
**File:** `src/components/checkout/PostPurchaseSignup.tsx` (lines 170, 176)
The success state uses `bg-gradient-to-br from-emerald-500/10 to-primary/5 border border-emerald-500/30` and a `bg-emerald-500` circle. Previous rounds standardized other checkout surfaces to `bg-foreground` but missed this one.

**Fix:** Replace emerald gradient with `from-foreground/5 to-primary/5 border border-foreground/20`. Replace `bg-emerald-500` circle with `bg-foreground`.

### 2. BundleProgress — Heavy Emerald Theming (14 instances)
**File:** `src/components/cart/BundleProgress.tsx`
The entire bundle progress component is themed in emerald green — borders, backgrounds, text, gradients, check icons. This creates a jarring "Shopify plugin" feel inside the otherwise editorial cart drawer.

**Fix:** Replace all emerald references with the brand's champagne palette (which is already used for the pre-discount state). Use `champagne-500/600/700` consistently for all states — the distinction between "has discount" and "no discount" can use opacity/weight differences instead of a color switch.

### 3. BundleSavingsRow — Emerald Text and Icon
**File:** `src/components/cart/BundleSavingsRow.tsx` (lines 46, 48, 61)
`text-emerald-500` on Gift icon, `text-emerald-600` on savings text. Same issue — cart internals bleeding generic green.

**Fix:** Replace with `text-champagne-600 dark:text-champagne-400` to match the brand palette.

### 4. SecondaryCTAStrip — Sparkle Emoji in Copy
**File:** `src/components/homepage/SecondaryCTAStrip.tsx` (line 52)
`"✨ New Arrivals Just Dropped"` — Emojis in marketing copy read as social media, not premium editorial. A luxury brand would never use sparkle emojis in a persistent CTA strip.

**Fix:** Remove the `✨` emoji. The copy stands on its own: `"New Arrivals Just Dropped — Shop the Latest"`.

### 5. SizeQuizContext — Party Emoji in Toast
**File:** `src/contexts/SizeQuizContext.tsx` (line 237)
`title: "Sizes saved! 🎉"` — Emojis in system toasts are informal and cheap.

**Fix:** Change to `"Sizes saved"` (no emoji, no exclamation).

### 6. SignInForm — Green Success Circle with Spring Animation
**File:** `src/components/auth/SignInForm.tsx` (lines 361-364)
`bg-green-100 dark:bg-green-900/20` circle with `text-green-600` Mail icon, using a spring animation. The green is off-brand and the spring is inconsistent with the editorial tween standard.

**Fix:** Replace `bg-green-100` with `bg-muted`, `text-green-600` with `text-foreground`. Replace spring with editorial tween: `type: 'tween', duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94]`.

### 7. ImpactMap — animate-ping on Map Dots
**File:** `src/components/about/ImpactMap.tsx` (line 178)
`animate-ping` on map indicator dots. While thematically appropriate for a "live presence" visualization, the ping effect still reads as cheap notification-style UI. A subtle opacity pulse via CSS would be more refined.

**Fix:** Replace `animate-ping` with a custom CSS animation using `animate-[pulse-soft_3s_ease-in-out_infinite]` or simply remove it — the staggered entrance animation already communicates activity.

---

## Summary

| File | Change |
|------|--------|
| `PostPurchaseSignup.tsx` | Replace emerald gradient/circle with foreground |
| `BundleProgress.tsx` | Replace all emerald with champagne palette |
| `BundleSavingsRow.tsx` | Replace emerald text/icon with champagne |
| `SecondaryCTAStrip.tsx` | Remove ✨ emoji from copy |
| `SizeQuizContext.tsx` | Remove 🎉 emoji from toast |
| `SignInForm.tsx` | Replace green with foreground, spring with tween |
| `ImpactMap.tsx` | Remove animate-ping from map dots |

## What Is NOT Changed
- Green in admin pages (AdminProducts status badges, AdminOrderDetail discounts) — admin uses standard semantic colors, acceptable
- Green in account pages (order status badges) — standard status indicators
- Green in form validation (CreateAccountForm, ResetPassword) — standard validation UX
- Green in lookbook swipe actions — transient gesture feedback in an immersive context
- Green in AskUsModal success — genuine form submission confirmation
- All functional logic preserved exactly

