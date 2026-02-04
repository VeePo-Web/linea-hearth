

# localStorage Migration Utility: 'linea-' → 'loj-' Prefix

## Executive Summary

This plan creates a robust localStorage migration utility that renames all `linea-` prefixed keys to `loj-` while preserving 100% of existing user data. The migration runs automatically on app initialization, is idempotent (safe to run multiple times), and includes comprehensive error handling.

---

## Complete Key Inventory

| Old Key | New Key | Data Type | Used In | Critical |
|---------|---------|-----------|---------|----------|
| `linea-cart` | `loj-cart` | `CartItem[]` | `useCart.tsx` | ⚠️ HIGH |
| `linea-size-memory` | `loj-size-memory` | `SizeMemory` | `useSizeMemory.ts`, `SizeQuizContext.tsx`, `PostPurchaseSignup.tsx` | ⚠️ HIGH |
| `linea-size-quiz-completed` | `loj-size-quiz-completed` | `"true"` | `SizeQuizContext.tsx` | MEDIUM |
| `linea-recently-viewed` | `loj-recently-viewed` | `RecentlyViewedProduct[]` | `RecentlyViewedContext.tsx` | MEDIUM |
| `linea-saved-for-later` | `loj-saved-for-later` | `LocalStorageSavedItem[]` | `useSavedForLater.ts` | MEDIUM |
| `linea-abandoned-cart-email` | `loj-abandoned-cart-email` | `string` | `useAbandonedCart.ts` | MEDIUM |
| `linea-abandoned-cart-id` | `loj-abandoned-cart-id` | `string` (UUID) | `useAbandonedCart.ts` | MEDIUM |
| `linea-behavior-cache` | `loj-behavior-cache` | `BehaviorCache` | `useBehaviorTracking.ts` | LOW |
| `linea-greeting-dismissed` | `loj-greeting-dismissed` | `string` (timestamp) | `useReturnCustomer.ts` | LOW |
| `linea_body_profiles` | `loj_body_profiles` | `ProfilesData` | `useBodyProfiles.ts` | MEDIUM |

**Note:** `linea-session-id` uses `sessionStorage` not `localStorage`, so it doesn't need migration (it resets per session anyway).

---

## Technical Architecture

### Phase 1: Create Migration Utility

Create a new file `src/lib/storageMigration.ts` that:

1. Defines the complete key mapping
2. Implements safe migration with data validation
3. Tracks migration completion to avoid re-running
4. Logs migration activity for debugging

```text
src/lib/storageMigration.ts (NEW FILE)
├── MIGRATION_COMPLETE_KEY = 'loj-migration-v1'
├── KEY_MAPPINGS: Record<string, string>
├── migrateLocalStorage(): MigrationResult
├── rollbackMigration(): void (for emergencies)
└── getMigrationStatus(): MigrationStatus
```

### Phase 2: Update All Consuming Hooks/Contexts

Each file using `linea-` keys must be updated to use `loj-` constants:

| File | Lines to Change | Change Summary |
|------|-----------------|----------------|
| `src/hooks/useCart.tsx` | Line 42 | `'linea-cart'` → `'loj-cart'` |
| `src/hooks/useSizeMemory.ts` | Line 5 | `'linea-size-memory'` → `'loj-size-memory'` |
| `src/hooks/useSavedForLater.ts` | Line 8 | `'linea-saved-for-later'` → `'loj-saved-for-later'` |
| `src/hooks/useAbandonedCart.ts` | Lines 5-6 | Both keys renamed |
| `src/hooks/useBehaviorTracking.ts` | Line 5 | `'linea-behavior-cache'` → `'loj-behavior-cache'` |
| `src/hooks/useReturnCustomer.ts` | Line 33 | `'linea-greeting-dismissed'` → `'loj-greeting-dismissed'` |
| `src/contexts/SizeQuizContext.tsx` | Lines 47-48 | Both keys renamed |
| `src/contexts/RecentlyViewedContext.tsx` | Line 26 | `'linea-recently-viewed'` → `'loj-recently-viewed'` |
| `src/components/try-on/hooks/useBodyProfiles.ts` | Line 4 | `'linea_body_profiles'` → `'loj_body_profiles'` |
| `src/components/checkout/PostPurchaseSignup.tsx` | Line 68 | `"linea-size-memory"` → `"loj-size-memory"` |

### Phase 3: Integrate Migration into App Initialization

Update `src/App.tsx` or create an initialization hook to run migration on first load.

---

## Migration Algorithm

```text
1. Check if migration already complete (MIGRATION_COMPLETE_KEY exists)
   → If yes: exit early (idempotent)

2. For each OLD_KEY → NEW_KEY mapping:
   a. Check if OLD_KEY exists in localStorage
   b. If OLD_KEY exists AND NEW_KEY does NOT exist:
      - Copy data from OLD_KEY to NEW_KEY
      - Delete OLD_KEY
      - Log success
   c. If both exist (edge case):
      - Compare timestamps if available
      - Keep most recent, log conflict
   d. If only NEW_KEY exists:
      - Already migrated, skip

3. Set MIGRATION_COMPLETE_KEY = timestamp

4. Return migration summary
```

---

## Implementation Details

### File 1: `src/lib/storageMigration.ts` (NEW)

```typescript
// Migration version - increment if adding new keys
const MIGRATION_VERSION = 'v1';
const MIGRATION_COMPLETE_KEY = `loj-migration-${MIGRATION_VERSION}`;

// Complete mapping of old keys to new keys
const KEY_MAPPINGS: Record<string, string> = {
  'linea-cart': 'loj-cart',
  'linea-size-memory': 'loj-size-memory',
  'linea-size-quiz-completed': 'loj-size-quiz-completed',
  'linea-recently-viewed': 'loj-recently-viewed',
  'linea-saved-for-later': 'loj-saved-for-later',
  'linea-abandoned-cart-email': 'loj-abandoned-cart-email',
  'linea-abandoned-cart-id': 'loj-abandoned-cart-id',
  'linea-behavior-cache': 'loj-behavior-cache',
  'linea-greeting-dismissed': 'loj-greeting-dismissed',
  'linea_body_profiles': 'loj_body_profiles',
};

interface MigrationResult {
  success: boolean;
  migrated: string[];
  skipped: string[];
  errors: string[];
}

export function migrateLocalStorage(): MigrationResult {
  // Check if already migrated
  // Loop through mappings
  // Copy and delete safely
  // Return result
}
```

### File Updates Summary

**10 files** require constant updates from `linea-` to `loj-`:
- All changes are single-line constant renames
- No logic changes required
- Type safety preserved

---

## Safety Mechanisms

1. **Idempotency**: Migration checks for completion flag before running
2. **Data Preservation**: Copy-then-delete pattern (never lose data)
3. **Conflict Resolution**: If both old and new keys exist, prefer newest data
4. **Error Isolation**: Try-catch around each key migration
5. **Rollback Function**: Emergency utility to reverse migration if needed
6. **Console Logging**: Development mode logs all migration activity
7. **No Breaking Changes**: Old keys are removed only after successful copy

---

## Testing Checklist

After implementation:

| Test Case | Expected Result |
|-----------|-----------------|
| Fresh user (no localStorage) | No migration runs, no errors |
| User with old `linea-cart` | Cart items appear under new key |
| User with old `linea-size-memory` | Sizes remembered correctly |
| Migration already complete | Skips without errors |
| Both old and new keys exist | Keeps newest data |
| Corrupted JSON in old key | Logs error, continues with other keys |
| Clear localStorage manually | Next visit is treated as fresh |

---

## Implementation Order

1. **Create** `src/lib/storageMigration.ts` with migration utility
2. **Update** all 10 files to use new `loj-` key constants
3. **Integrate** migration call in `src/App.tsx` (runs before providers)
4. **Test** with existing user data in browser
5. **Verify** no data loss across all storage types

---

## Rollback Plan

If issues discovered post-deployment:

1. The migration utility includes a `rollbackMigration()` function
2. Can be called from browser console: `window.__LOJ_ROLLBACK_MIGRATION()`
3. Reverses all key renames back to `linea-` prefix
4. Clears migration completion flag

---

## Files Created/Modified

**New File:**
- `src/lib/storageMigration.ts`

**Modified Files (10):**
- `src/hooks/useCart.tsx`
- `src/hooks/useSizeMemory.ts`
- `src/hooks/useSavedForLater.ts`
- `src/hooks/useAbandonedCart.ts`
- `src/hooks/useBehaviorTracking.ts`
- `src/hooks/useReturnCustomer.ts`
- `src/contexts/SizeQuizContext.tsx`
- `src/contexts/RecentlyViewedContext.tsx`
- `src/components/try-on/hooks/useBodyProfiles.ts`
- `src/components/checkout/PostPurchaseSignup.tsx`
- `src/App.tsx` (add migration call)

