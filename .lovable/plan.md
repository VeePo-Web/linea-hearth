
# Brand Name Correction Plan: "LINEA" → "Line of Judah"

## Executive Summary

A comprehensive audit has revealed **47 instances across 23 files** where incorrect brand names (LINEA, Linea Jewelry Inc, lineajewelry) appear instead of "Line of Judah". This plan provides a surgical, file-by-file correction strategy to ensure complete brand consistency across the entire codebase.

---

## Critical Severity Issues (Must Fix Immediately)

### 1. Logo SVG Files in `/public` Directory

| File | Current State | Action Required |
|------|---------------|-----------------|
| `/public/LINEA-1.svg` | Contains "LINEA" wordmark | Replace with "Line of Judah" logo or rename |
| `/public/LINEA.svg` | Contains "LINEA" wordmark | Delete or replace with correct branding |
| `/public/LINEA_JEWELRY_INC.svg` | "Linea Jewelry Inc" text | Delete - incorrect brand entirely |
| `/public/Linea_Jewelry_Inc-2.svg` | "Linea Jewelry Inc" text | Delete - incorrect brand entirely |
| `/src/assets/LINEA.svg` | "LINEA" wordmark | Delete or replace |

**Owner Action Required**: Provide the official "Line of Judah" logo in SVG format for header/footer usage.

---

### 2. Terms of Service Page - COMPLETELY WRONG BRAND

**File**: `src/pages/TermsOfService.tsx`

| Line | Current | Correction |
|------|---------|------------|
| 23 | `document.title = "Terms of Service - Linea Jewelry"` | `"Terms of Service - Line of Judah"` |
| 36 | `Linea Jewelry Inc. website and services` | `Line of Judah LLC website and services` |
| 44-45 | `Linea Jewelry Inc.'s website` | `Line of Judah LLC's website` |
| 109 | `Our jewelry comes with a limited warranty` | Rewrite for apparel context |
| 118 | `Linea Jewelry Inc.` | `Line of Judah LLC` |
| 126 | `Linea Jewelry Inc. or its suppliers` | `Line of Judah LLC or its suppliers` |
| 170 | `legal@lineajewelry.com` | `legal@lineofjudah.com` |

**Note**: This entire page has jewelry-specific language that needs rewriting for a streetwear/apparel brand.

---

## High Severity Issues (User-Facing)

### 3. Header & Navigation Components

**File**: `src/components/header/Navigation.tsx`

| Line | Current | Correction |
|------|---------|------------|
| 159 | `src="/LINEA-1.svg"` | Update to new logo path |
| 160 | `alt="LINEA"` | `alt="Line of Judah"` |

**File**: `src/components/header/MobileMenu.tsx`

| Line | Current | Correction |
|------|---------|------------|
| 141 | `src="/LINEA-1.svg" alt="LINEA"` | Update path and `alt="Line of Judah"` |
| 329 | `href="mailto:hello@linea.com"` | `href="mailto:hello@lineofjudah.com"` |

**File**: `src/components/header/CheckoutHeader.tsx`

| Line | Current | Correction |
|------|---------|------------|
| 25 | `src="/LINEA-1.svg"` | Update to new logo path |
| 26 | `alt="Linea Jewelry Inc"` | `alt="Line of Judah"` |

---

### 4. Authentication & Account Toasts

**File**: `src/components/auth/CreateAccountForm.tsx`

| Line | Current | Correction |
|------|---------|------------|
| 69 | `toast.success('Welcome to LINEA!')` | `toast.success('Welcome to Line of Judah!')` |

**File**: `src/components/checkout/PostPurchaseSignup.tsx`

| Line | Current | Correction |
|------|---------|------------|
| 183 | `Welcome to LINEA` | `Welcome to Line of Judah` |

---

## Medium Severity Issues (Backend/Infrastructure)

### 5. Edge Functions - Discount Code Prefix

**File**: `supabase/functions/process-abandoned-carts/index.ts`

| Line | Current | Correction |
|------|---------|------------|
| 42 | `let code = 'LINEA15-'` | `let code = 'LOJ15-'` or `'JUDAH15-'` |
| 440 | `'https://linea-hearth.lovable.app'` | Keep as fallback URL (technical, not branding) |

**File**: `supabase/functions/create-checkout-session/index.ts`

| Line | Current | Correction |
|------|---------|------------|
| 86 | `'https://linea-hearth.lovable.app'` | Keep as fallback (technical URL) |

**File**: `supabase/functions/send-order-confirmation/index.ts`

| Line | Current | Correction |
|------|---------|------------|
| 307 | `'https://linea-hearth.lovable.app'` | Keep as fallback (technical URL) |

---

### 6. LocalStorage Keys (Internal, No User Impact)

These are technical identifiers that don't need to match brand name, but could be updated for consistency:

| File | Key | Suggestion |
|------|-----|------------|
| `src/contexts/SizeQuizContext.tsx` | `'linea-size-quiz-completed'` | Optional: `'loj-size-quiz-completed'` |
| `src/contexts/SizeQuizContext.tsx` | `'linea-size-memory'` | Optional: `'loj-size-memory'` |
| `src/hooks/useSizeMemory.ts` | `'linea-size-memory'` | Optional: `'loj-size-memory'` |
| `src/components/try-on/hooks/useBodyProfiles.ts` | `'linea_body_profiles'` | Optional: `'loj_body_profiles'` |
| `src/components/checkout/PostPurchaseSignup.tsx` | `'linea-size-memory'` | Must match above if changed |

**Recommendation**: Keep these as-is to avoid breaking existing user data, OR create a migration script.

---

## Low Severity Issues (Content Reference)

### 7. OG Image Reference in `index.html`

| Line | Current | Note |
|------|---------|------|
| 17 | `social-1758825622907-Linea OG Image.png` | External URL - requires uploading new OG image |
| 21 | Same image for Twitter | Same action |

**Owner Action Required**: Provide new OG/social sharing image with "Line of Judah" branding.

---

### 8. Orphaned Asset Files (May Not Be Used)

**File**: `src/components/content/OneThirdTwoThirdsSection.tsx`

References images that don't exist and have jewelry-themed alt text:
- `@/assets/circular-collection.png` - File doesn't exist
- `@/assets/organic-earring.png` - File doesn't exist
- Alt text: "Artisan crafted jewelry", "Circular jewelry collection"

**Recommendation**: This component appears unused. Verify and delete or update for streetwear context.

---

## Complete File Change Manifest

### Files Requiring Code Changes (17 files)

```text
1.  src/pages/TermsOfService.tsx — 8 changes (CRITICAL)
2.  src/components/header/Navigation.tsx — 2 changes
3.  src/components/header/MobileMenu.tsx — 2 changes
4.  src/components/header/CheckoutHeader.tsx — 2 changes
5.  src/components/auth/CreateAccountForm.tsx — 1 change
6.  src/components/checkout/PostPurchaseSignup.tsx — 2 changes
7.  supabase/functions/process-abandoned-carts/index.ts — 1 change
8.  index.html — Update OG image URL (after new image uploaded)
9.  src/contexts/SizeQuizContext.tsx — 2 changes (optional)
10. src/hooks/useSizeMemory.ts — 1 change (optional)
11. src/components/try-on/hooks/useBodyProfiles.ts — 1 change (optional)
12. src/components/content/OneThirdTwoThirdsSection.tsx — Delete or rewrite
```

### Files to Delete (4 files)

```text
1. public/LINEA_JEWELRY_INC.svg
2. public/Linea_Jewelry_Inc-2.svg
3. public/LINEA.svg (if not used)
4. src/assets/LINEA.svg
```

### Files Requiring Owner Assets (2 items)

```text
1. New logo SVG → Replace /public/LINEA-1.svg
2. New OG image → Update external URL in index.html
```

---

## Implementation Order

### Phase 1: Critical Brand Errors (Do First)
1. Delete incorrect logo files (`LINEA_JEWELRY_INC.svg`, etc.)
2. Fix Terms of Service page entirely
3. Update all header/navigation logo alt text

### Phase 2: User-Facing Messages
4. Fix welcome toasts in auth forms
5. Fix email links in MobileMenu
6. Update discount code prefix in edge function

### Phase 3: Owner-Dependent Items
7. Wait for new logo SVG from owner
8. Wait for new OG image from owner
9. Update index.html with new social image URLs

### Phase 4: Optional Cleanup
10. Evaluate localStorage key migration
11. Delete or update orphaned OneThirdTwoThirdsSection component

---

## Verification Checklist

After implementation, search the entire codebase for these patterns to confirm zero matches:

```text
□ "LINEA" (case-insensitive, excluding technical CSS like "linear-gradient")
□ "Linea Jewelry"
□ "lineajewelry"
□ "@linea.com" (email)
□ "Jewelry" in alt text (should be apparel-related)
```

---

## Questions for Owner

Before proceeding, please provide:

1. **Official Logo SVG** — What is the exact logo file to use in header/footer?
2. **Legal Entity Name** — Is it "Line of Judah LLC" or another entity for Terms of Service?
3. **Discount Code Prefix** — Preferred prefix: `LOJ15-`, `JUDAH15-`, or `TRIBE15-`?
4. **OG/Social Image** — New social sharing image for Facebook/Twitter previews?
5. **LocalStorage Migration** — Should existing user size data be migrated or reset?
