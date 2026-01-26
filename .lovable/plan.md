

# Email Typo Detection - Friction Reduction Feature

## Overview

Implement intelligent email typo detection that catches common mistakes and suggests corrections before the user proceeds with checkout. This follows TEMU-tier conversion psychology: **Error Prevention, Not Correction**.

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         EMAIL TYPO DETECTION SYSTEM                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                    useEmailTypoDetection Hook                            │   │
│  │  • Detects common domain typos (gmial → gmail)                          │   │
│  │  • Suggests TLD corrections (.con → .com)                               │   │
│  │  • Catches keyboard adjacency errors (gmai; → gmail)                    │   │
│  │  • Triggers on blur (not keystroke - avoids annoyance)                  │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                            │
│                                    ▼                                            │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                   EmailTypoSuggestion Component                          │   │
│  │  ┌────────────────────────────────────────────────────────────────────┐  │   │
│  │  │  Did you mean user@gmail.com?                                      │  │   │
│  │  │  [Yes, fix it]  [No, keep it]                                      │  │   │
│  │  └────────────────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Integration Points:                                                            │
│  • Checkout.tsx - Customer email, billing email                                 │
│  • ContactForm.tsx - Contact email                                              │
│  • EmailOptIn.tsx - Newsletter signup                                           │
│  • FooterEmailCapture.tsx - Footer newsletter                                   │
│  • AmbassadorForm.tsx - Ambassador application                                  │
│  • SignInForm.tsx / CreateAccountForm.tsx - Auth flows                          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### 1. Email Typo Detection Utility

**New File:** `src/lib/emailTypoDetection.ts`

This utility contains the core typo detection logic, supporting:

**Common Domain Typos (Levenshtein-based):**
```text
gmial.com → gmail.com
gamil.com → gmail.com
gmal.com → gmail.com
gmail.co → gmail.com
gnail.com → gmail.com
yahooo.com → yahoo.com
yaho.com → yahoo.com
hotmal.com → hotmail.com
outloook.com → outlook.com
iclould.com → icloud.com
```

**TLD Corrections:**
```text
.con → .com
.cmo → .com
.vom → .com
.ney → .net
.ogr → .org
.co.ik → .co.uk
```

**Keyboard Adjacency Errors:**
```text
gmail;com → gmail.com (semicolon for period)
user@gmail,com → user@gmail.com
```

**Algorithm:**
1. Parse email into `local@domain`
2. Split domain into `name.tld`
3. Compare domain name against common providers using Levenshtein distance (threshold ≤ 2)
4. Check TLD against common typos
5. Return suggestion only if confidence is high

### 2. useEmailTypoDetection Hook

**New File:** `src/hooks/useEmailTypoDetection.ts`

```typescript
interface UseEmailTypoDetectionReturn {
  // Current email value
  email: string;
  setEmail: (email: string) => void;
  
  // Suggestion state
  suggestion: string | null;
  showSuggestion: boolean;
  
  // Actions
  acceptSuggestion: () => void;
  dismissSuggestion: () => void;
  
  // Event handlers to spread on input
  inputProps: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
  };
}
```

**Key Behaviors:**
- Detects typos on **blur only** (not on every keystroke to avoid annoyance)
- Debounces detection to prevent flicker
- Auto-dismisses suggestion after 10 seconds if ignored
- Tracks dismissed suggestions to avoid re-showing for same typo
- Respects user choice - if they dismiss, don't show again for that input

### 3. EmailTypoSuggestion Component

**New File:** `src/components/ui/EmailTypoSuggestion.tsx`

A subtle, non-intrusive inline suggestion that appears below the email input:

```text
┌─────────────────────────────────────────────────────────┐
│  Email Address *                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ user@gmial.com                                   │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 💡 Did you mean user@gmail.com?                 │    │
│  │    [Yes, fix it]  [No, keep user@gmial.com]     │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**Visual Design (preserves existing UI identity):**
- Background: `bg-amber-500/10` (matches existing warning styles)
- Border: `border-amber-500/30`
- Text: `text-amber-600` for the suggestion
- Buttons: ghost style, small size
- Animation: slide-in with opacity fade (respects reduce-motion)
- Auto-dismiss: subtle fade after 10s

### 4. Integration Points

**Checkout.tsx (Primary):**
```text
Location: Line 492-505 (customer email input)
Location: Line 637-648 (billing email input)

Changes:
- Replace direct state management with useEmailTypoDetection hook
- Add EmailTypoSuggestion component below each email input
- Update handleCustomerDetailsChange to use hook's setEmail
```

**Other Forms (Secondary):**
| File | Priority | Notes |
|------|----------|-------|
| `ContactForm.tsx` | Medium | Replace email state with hook |
| `EmailOptIn.tsx` | Medium | Newsletter signups |
| `FooterEmailCapture.tsx` | Low | Footer capture |
| `AmbassadorForm.tsx` | Low | Uses react-hook-form, may need adapter |
| `SignInForm.tsx` | Low | Auth form, less critical |

---

## Common Domain Database

The detection system maintains a curated list of common email providers:

```typescript
const COMMON_DOMAINS = [
  // Global giants
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'aol.com',
  'protonmail.com',
  'mail.com',
  
  // Regional (Europe)
  'gmx.com',
  'gmx.de',
  'web.de',
  'orange.fr',
  'free.fr',
  
  // Business
  'live.com',
  'msn.com',
  
  // Country-specific
  'yahoo.co.uk',
  'outlook.co.uk',
  'btinternet.com',
];
```

---

## Typo Detection Rules

### Rule 1: Domain Typos (Levenshtein Distance ≤ 2)
```text
gmial.com (distance 1 from gmail.com) → SUGGEST gmail.com
gamil.com (distance 1 from gmail.com) → SUGGEST gmail.com
gmal.com (distance 1 from gmail.com) → SUGGEST gmail.com
htomail.com (distance 2 from hotmail.com) → SUGGEST hotmail.com
```

### Rule 2: TLD Typos
```text
.con → .com
.cmo → .com
.vom → .com
.ocm → .com
.ney → .net
.ogr → .org
.oi → .io
```

### Rule 3: Missing TLD Parts
```text
gmail.co → gmail.com
outlook.c → outlook.com
yahoo → yahoo.com
```

### Rule 4: Keyboard Adjacency
```text
Semicolon for period: user@gmail;com → user@gmail.com
Comma for period: user@gmail,com → user@gmail.com
```

### Rule 5: Double Letters
```text
yahooo.com → yahoo.com
gmaill.com → gmail.com
outloook.com → outlook.com
```

---

## File Changes Summary

### New Files (3)

| File | Purpose |
|------|---------|
| `src/lib/emailTypoDetection.ts` | Core typo detection algorithms |
| `src/hooks/useEmailTypoDetection.ts` | React hook for managing detection state |
| `src/components/ui/EmailTypoSuggestion.tsx` | Suggestion UI component |

### Modified Files (6)

| File | Changes |
|------|---------|
| `src/pages/Checkout.tsx` | Integrate hook for customer email + billing email |
| `src/components/contact/ContactForm.tsx` | Integrate hook for contact email |
| `src/components/homepage/EmailOptIn.tsx` | Integrate hook for newsletter |
| `src/components/footer/FooterEmailCapture.tsx` | Integrate hook for footer capture |
| `src/components/ambassador/AmbassadorForm.tsx` | Integrate with react-hook-form |
| `src/components/auth/CreateAccountForm.tsx` | Integrate for signup flow |

---

## UX Considerations

### Non-Intrusive Design
- Only triggers on **blur**, not during typing
- Suggestion appears subtly below input
- Auto-dismisses after 10 seconds
- User can easily dismiss without friction

### Conversion Psychology
- Frames as helpful, not corrective: "Did you mean...?"
- Positive action is prominent: "Yes, fix it"
- Respects user choice: "No, keep it" doesn't shame

### Accessibility
- Suggestion has proper ARIA live region for screen readers
- Buttons have clear focus states
- Works with keyboard navigation
- Respects `prefers-reduced-motion`

---

## Performance Considerations

1. **No external dependencies** - pure TypeScript implementation
2. **Lazy evaluation** - only runs Levenshtein on blur, not keystroke
3. **Memoized domain list** - compiled once at import time
4. **< 1ms detection time** - negligible impact on interaction

---

## Analytics Events

| Event | Properties | Trigger |
|-------|------------|---------|
| `email_typo_detected` | `original_email`, `suggested_email`, `surface` | Typo detected |
| `email_typo_accepted` | `original_email`, `suggested_email`, `surface` | User accepts suggestion |
| `email_typo_dismissed` | `original_email`, `suggested_email`, `surface` | User dismisses suggestion |
| `email_typo_auto_dismissed` | `original_email`, `suggested_email`, `surface` | Suggestion times out |

---

## Conversion Impact

| Metric | Expected Lift |
|--------|--------------|
| Checkout form abandonment | -2-3% |
| Order confirmation delivery rate | +5-8% (fewer bounced emails) |
| Abandoned cart recovery emails | +10% (correct email = deliverable) |
| Customer support tickets | -5% (fewer "didn't get confirmation" tickets) |

Email typo detection is a low-effort, high-impact feature that silently saves users from errors they would otherwise only discover when their confirmation email never arrives.

---

## Implementation Order

1. Create `emailTypoDetection.ts` utility with all detection algorithms
2. Create `useEmailTypoDetection.ts` hook
3. Create `EmailTypoSuggestion.tsx` component
4. Integrate into `Checkout.tsx` (highest impact surface)
5. Integrate into remaining forms (progressive rollout)

