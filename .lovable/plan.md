
# Size Quiz Debug & Fix Plan

## Problem Summary
The Size Quiz system has a critical architectural flaw: **dual state management** where `useSizeQuiz` hook and `SizeQuizContext` maintain separate, unsynchronized state. This causes the quiz to behave unpredictably, fail to save sizes correctly, and not properly execute pending actions after completion.

---

## Identified Bugs

### Bug 1: Dual State Management Conflict (CRITICAL)
**Location**: `src/hooks/useSizeQuiz.ts` + `src/contexts/SizeQuizContext.tsx`

**Problem**: Two separate state systems for the same quiz:
- `useSizeQuiz` hook has its own `isOpen`, `currentStep`, `answers` state
- `SizeQuizContext` has its own `isOpen`, `hasCompletedQuiz` state
- Modal receives `isOpen` from context, but internally uses hook state

**Impact**: Quiz steps don't advance properly, answers don't persist between open/close cycles

### Bug 2: Pending Action Category Mismatch (HIGH)
**Location**: `src/contexts/SizeQuizContext.tsx` lines 85-90

**Problem**: When resolving pending action size, always picks `tops` first:
```typescript
const size = parsed.tops || parsed.bottoms || parsed.hats;
```

**Impact**: User shopping for bottoms gets assigned their tops size instead

### Bug 3: Missing DialogDescription (MEDIUM)
**Location**: `src/components/size-guide/SizeQuizModal.tsx`

**Problem**: `DialogContent` lacks `DialogDescription`, causing console warning

**Impact**: Accessibility warning, screen readers don't announce dialog purpose

### Bug 4: Race Condition on Quiz Completion (HIGH)
**Location**: `src/contexts/SizeQuizContext.tsx` lines 73-104

**Problem**: `closeQuiz()` calls `hasCompletedQuizBefore()` immediately after quiz submits, but localStorage write may not be complete

**Impact**: Pending actions fail to execute because completion status isn't detected

### Bug 5: Size Memory Format Mismatch (MEDIUM)
**Location**: `src/contexts/SizeQuizContext.tsx` vs `src/hooks/useSizeMemory.ts`

**Problem**: Context reads `localStorage.getItem('linea-size-memory')` expecting `{ tops: 'M' }` format, but `useSizeMemory` stores with additional timestamp fields

**Impact**: Size resolution works but could fail on edge cases

---

## Solution Architecture

### Approach: Unify State Management
Eliminate the dual-state problem by removing the standalone `useSizeQuiz` hook's state and using only the context's state. The modal becomes a pure presentation component that receives all state/actions from context.

```
                     CURRENT (Broken)
┌─────────────────────────────────────────────────────────┐
│  SizeQuizContext                                        │
│  ├── isOpen (state)                                     │
│  ├── hasCompletedQuiz (state)                           │
│  └── pendingAction (ref)                                │
│                                                         │
│  └── <SizeQuizModal isOpen={isOpen} onClose={...}>      │
│       └── useSizeQuiz() ← SEPARATE STATE!               │
│            ├── isOpen (state) ← NEVER USED              │
│            ├── currentStep (state)                      │
│            └── answers (state)                          │
└─────────────────────────────────────────────────────────┘

                      FIXED
┌─────────────────────────────────────────────────────────┐
│  SizeQuizContext                                        │
│  ├── isOpen (state)                                     │
│  ├── hasCompletedQuiz (state)                           │
│  ├── currentStep (state) ← MOVED HERE                   │
│  ├── answers (state) ← MOVED HERE                       │
│  ├── pendingAction (ref)                                │
│  └── recommendedSizes (derived)                         │
│                                                         │
│  └── <SizeQuizModal                                     │
│         isOpen={isOpen}                                 │
│         currentStep={currentStep}                       │
│         answers={answers}                               │
│         onSetAnswer={setAnswer}                         │
│         ... />                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Consolidate State in Context

**File: `src/contexts/SizeQuizContext.tsx`**

1. Move quiz logic from `useSizeQuiz` into context:
   - Add `currentStep` state
   - Add `answers` state  
   - Add `recommendedSizes` derived value
   - Add `setAnswer`, `nextStep`, `prevStep` actions
   - Add `submitQuiz` that saves sizes and handles pending action

2. Update `closeQuiz` to:
   - Reset `currentStep` to 0
   - Reset `answers` to null values
   - Clear pending action if quiz wasn't completed

3. Fix pending action category resolution:
   - Store the product's category in pending action
   - Use category-specific size when executing callback

### Phase 2: Update Modal Component

**File: `src/components/size-guide/SizeQuizModal.tsx`**

1. Remove `useSizeQuiz()` hook usage
2. Receive all state and actions from props
3. Add `DialogDescription` for accessibility
4. Add `VisuallyHidden` wrapper if description shouldn't be visible

### Phase 3: Fix Pending Action Logic

**File: `src/contexts/SizeQuizContext.tsx`**

Update pending action interface:
```typescript
interface PendingAction {
  productId: string;
  categorySlug: string; // ADD: to resolve correct size
  size?: string;
  color?: string;
  callback: (size: string, color?: string) => void;
}
```

Update `openQuizWithPending` call sites:
- `src/hooks/useQuickAdd.ts` - pass `categorySlug`

### Phase 4: Fix Race Condition

In `submitQuiz`:
1. Save sizes synchronously to localStorage
2. Mark quiz completed
3. Update `hasCompletedQuiz` state
4. Execute pending action BEFORE calling `closeQuiz`
5. Reset quiz state

---

## Detailed Code Changes

### 1. `src/contexts/SizeQuizContext.tsx` - Complete Rewrite

Key changes:
- Import `useSizeMemory` for size persistence
- Move all quiz state into context
- Move size recommendation logic into context
- Fix pending action to use category-aware size resolution
- Ensure synchronous completion before callback execution

### 2. `src/components/size-guide/SizeQuizModal.tsx`

Key changes:
- Import `useSizeQuizContext` instead of `useSizeQuiz`
- Remove local hook usage
- Add `DialogDescription` with `sr-only` class for accessibility
- Receive `onSubmit` handler from context

### 3. `src/hooks/useQuickAdd.ts`

Key changes:
- Update `openQuizWithPending` call to include `categorySlug`:
```typescript
sizeQuizContext.openQuizWithPending({
  productId: product.id,
  categorySlug: categorySlug, // ADD THIS
  callback: (size: string, color?: string) => {
    addToCart({ size, color });
  },
});
```

### 4. `src/hooks/useSizeQuiz.ts` - Deprecate

- Keep file for backwards compatibility
- Have it consume context instead of maintaining its own state
- Or remove entirely if no other consumers

---

## Testing Checklist

### Functional Tests
- [ ] Open quiz from Size Guide page manually
- [ ] Complete all 3 steps and verify sizes save
- [ ] Verify toast appears on completion
- [ ] Open quiz again - verify it doesn't re-appear (completed state)
- [ ] Clear localStorage, trigger quiz via Quick Add
- [ ] Complete quiz, verify item gets added to cart
- [ ] Test quiz with pending action for TOPS product
- [ ] Test quiz with pending action for BOTTOMS product
- [ ] Test closing quiz without completing (Skip button)
- [ ] Test Back button navigation through steps
- [ ] Verify "Your Recommended Sizes" preview on step 3

### Edge Cases
- [ ] Open quiz, close immediately, reopen - state should reset
- [ ] Complete quiz as guest, login, verify sizes sync
- [ ] Complete quiz, add item, remove item, add again - no quiz
- [ ] Rapidly click Next button - steps shouldn't skip

### Accessibility
- [ ] No console warnings about DialogDescription
- [ ] Screen reader announces dialog purpose
- [ ] Focus traps correctly in modal
- [ ] Escape key closes modal

---

## Files Modified

| File | Change Type | Description |
|------|-------------|-------------|
| `src/contexts/SizeQuizContext.tsx` | Major rewrite | Consolidate all quiz state, fix pending action |
| `src/components/size-guide/SizeQuizModal.tsx` | Update | Use context, add DialogDescription |
| `src/hooks/useQuickAdd.ts` | Minor update | Pass categorySlug to pending action |
| `src/hooks/useSizeQuiz.ts` | Deprecate/Remove | No longer needed |

---

## Success Criteria

1. Size quiz opens and progresses through all 3 steps without bugs
2. Completing quiz saves sizes to localStorage (and DB if authenticated)
3. Quick Add triggers quiz for first-time users WITHOUT saved sizes
4. After quiz completion, pending add-to-cart action executes correctly
5. Correct size is selected based on product category (tops vs bottoms)
6. No console warnings about DialogDescription
7. Quiz state resets properly when closed without completing
8. Quiz doesn't reappear for users who have completed it
