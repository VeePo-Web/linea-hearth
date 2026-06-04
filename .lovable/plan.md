# Three cart-drawer / search / size-quiz copy & color fixes

## 1. "Heavenly Crewneck" suggestion → remove
`src/components/header/SearchOverlay.tsx` line 50 — popular searches array has `"Heavenly Crewneck"`. We don't sell a crewneck. Replace with a real product/category from the catalogue. Safest pick that matches the rest of the list (`Stay Holy`, `Black Hoodies`, `Premium Tees`): swap to **`"Heavenly Cap"`** (the actual product we do sell — same "Heavenly" brand thread, no fake SKU).

## 2. "Mostly Bottoms" size-quiz option → remove
`src/components/size-guide/SizeQuizModal.tsx` lines 84–88 — `categoryOptions` offers `tops / bottoms / both`. We don't carry bottoms (Joggers/shorts/pants don't exist as live products).

Fix: drop the `bottoms` and `both` options entirely and reduce step 3 to a single relevant question. Cleanest path:
- Remove the third quiz step (`"What do you shop for most?"`) from the `steps` array — with only Tops as an answer it's a non-question.
- Default `primaryCategory` to `'tops'` in whatever hook persists the quiz answer (`useSizeQuiz`), and update the `PrimaryCategory` type to `'tops'` only (or keep the union but never offer the others).
- Update any results screen / progress bar that assumes 3 steps to 2 steps.

(Alternative if you'd rather keep the question: replace "Mostly Bottoms" + "Both Equally" with two real top-fit choices like "Hoodies" and "Tees". Tell me if you prefer that — I'll plan it instead.)

## 3. "Explore Collection" button is green → make it match chrome aesthetic
`src/components/cart/CartDrawer.tsx` lines 240–247. The button is `variant="outline"`, and `--accent` in `src/index.css` is forest green (`152 35% 30%`). On mobile webview the button is rendering with the accent fill (likely a tap/focus state stuck in the screenshot, or an inherited Link style turning it green).

Fix:
- Swap `variant="outline"` → `variant="default"` so it picks up the chrome `--primary` (off-white) on black background — matches the rest of the empty-state typography and the rounded-none editorial buttons used elsewhere.
- Force-clear any green hover/active leak with `hover:bg-primary-hover` and no `bg-accent` fallback. Keep `rounded-none` to honor the sharp-edge memory rule.
- If you'd rather it be ghost/outline (transparent with silver hairline border), I'll use `variant="outline"` + `border-white/20 bg-transparent hover:bg-white/5 text-foreground` instead. Tell me which.

## Out of scope
- Not changing the empty-bag illustration or copy.
- Not touching the global `--accent` token (forest green is correct elsewhere — only this button shouldn't pull from it).
- Not touching the "Tops/Bottoms/Both" persisted answers for users who already finished the quiz (the new flow just defaults them to tops on next open).

## One quick question
For #2, do you want me to (A) **drop the question entirely** (cleanest, 2-step quiz), or (B) **replace bottoms/both with two real top-fit choices** (keeps the 3-step flow)? My recommendation: A.
