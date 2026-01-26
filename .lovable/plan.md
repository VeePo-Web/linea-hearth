

# Size Memory Database Sync Implementation

## Overview

Upgrade the `useSizeMemory` hook from localStorage-only to a full bidirectional database sync system with:
- Cross-session persistence to `user_size_preferences` table
- Guest-to-authenticated migration on login
- Size confidence scoring from order history
- Offline-first with localStorage fallback

---

## Current State Analysis

### What Already Exists

| Component | Status |
|-----------|--------|
| `user_size_preferences` table | Created with proper schema |
| RLS policies | All 4 policies in place (SELECT, INSERT, UPDATE, DELETE) |
| `size_confidence_stats` view | Created (calculates confidence from orders) |
| `useSizeMemory` hook | localStorage-only, needs database sync |
| `useAuth` hook | Ready to hook into for migration trigger |

### What Needs to Be Built

1. **Database sync logic** in `useSizeMemory` hook
2. **Guest-to-auth migration** triggered on login
3. **Confidence fetching** and display helpers
4. **UI updates** for confidence badges

---

## Implementation Details

### Phase 1: Refactor useSizeMemory Hook

**File:** `src/hooks/useSizeMemory.ts`

**New Capabilities:**
- Fetch preferences from database when authenticated
- Merge localStorage with database on login (most recent wins)
- Upsert to database on size change (optimistic)
- Fetch size confidence scores
- Expose sync state (`isSynced`, `isLoading`)

**Extended Interface:**
```typescript
interface SizeConfidence {
  tops: { size: string; confidence: number } | null;
  bottoms: { size: string; confidence: number } | null;
  hats: { size: string; confidence: number } | null;
}

interface UseSizeMemoryReturn {
  // Existing
  getRememberedSize: (categorySlug: string) => string | null;
  rememberSize: (categorySlug: string, size: string) => void;
  clearSizeMemory: () => void;
  sizeMemory: SizeMemory;
  
  // NEW: Database sync
  isSynced: boolean;
  isLoading: boolean;
  
  // NEW: Confidence scoring
  sizeConfidence: SizeConfidence;
  getSizeConfidence: (categorySlug: string) => number | null;
  getSizeConfidenceMessage: (categorySlug: string) => string | null;
  
  // NEW: Migration
  migrateGuestPreferences: () => Promise<void>;
}
```

**Core Logic Flow:**

```text
┌─────────────────────────────────────────────────────────┐
│                    ON MOUNT                             │
├─────────────────────────────────────────────────────────┤
│ 1. Load localStorage immediately (instant UI)          │
│ 2. Check if user is authenticated                      │
│    ├─ NO: Set isSynced = false, done                   │
│    └─ YES: Fetch database preferences                  │
│           Merge (most recent wins per category)        │
│           Update state + localStorage with merged      │
│           Fetch confidence scores                      │
│           Set isSynced = true                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                ON SIZE SELECTION                        │
├─────────────────────────────────────────────────────────┤
│ 1. Update local state immediately (optimistic)         │
│ 2. Save to localStorage (offline resilience)           │
│ 3. If authenticated: upsert to database                │
│    (include {type}_updated_at timestamp)               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              ON LOGIN (MIGRATION)                       │
├─────────────────────────────────────────────────────────┤
│ 1. Fetch existing database preferences                 │
│ 2. Compare timestamps per category:                    │
│    localStorage.tops_updated_at vs db.tops_updated_at  │
│ 3. Keep most recent for each category                  │
│ 4. Upsert merged result to database                    │
│ 5. Update localStorage with merged                     │
│ 6. Show toast: "Your sizes are synced"                 │
└─────────────────────────────────────────────────────────┘
```

---

### Phase 2: Auth Integration for Migration

**File:** `src/hooks/useAuth.tsx`

**Changes:**
- Expose a callback mechanism for login events
- Alternative: Create a new `useSizeSync` hook that listens to auth state

**Implementation Approach:**
The `useSizeMemory` hook will internally subscribe to auth state changes using `supabase.auth.onAuthStateChange`. When a user transitions from logged-out to logged-in, trigger `migrateGuestPreferences()` automatically.

```typescript
// Inside useSizeMemory hook
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // User just logged in - trigger migration
        handleAuthSync(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        // User logged out - keep localStorage, clear db cache
        setIsSynced(false);
        setSizeConfidence({ tops: null, bottoms: null, hats: null });
      }
    }
  );
  
  return () => subscription.unsubscribe();
}, []);
```

---

### Phase 3: Confidence Scoring Integration

**Database View:** `size_confidence_stats` (already exists)

**Hook Addition:**
```typescript
const fetchSizeConfidence = async (userId: string) => {
  const { data } = await supabase
    .from('size_confidence_stats')
    .select('size_type, size, confidence_percentage')
    .eq('user_id', userId);
  
  // Transform to SizeConfidence shape
  const confidence: SizeConfidence = {
    tops: null,
    bottoms: null,
    hats: null,
  };
  
  data?.forEach(row => {
    if (row.size_type && row.size && row.confidence_percentage) {
      confidence[row.size_type as keyof SizeConfidence] = {
        size: row.size,
        confidence: row.confidence_percentage,
      };
    }
  });
  
  return confidence;
};
```

**Helper Functions:**
```typescript
const getSizeConfidence = (categorySlug: string): number | null => {
  const sizeType = getSizeType(categorySlug);
  if (!sizeType) return null;
  return sizeConfidence[sizeType]?.confidence ?? null;
};

const getSizeConfidenceMessage = (categorySlug: string): string | null => {
  const sizeType = getSizeType(categorySlug);
  if (!sizeType) return null;
  
  const conf = sizeConfidence[sizeType];
  if (!conf || conf.confidence < 50) return null;
  
  return `Your size ${conf.size} fits ${conf.confidence}% of our ${sizeType}`;
};
```

---

### Phase 4: SizeSelector UI Enhancement

**File:** `src/components/product/SizeSelector.tsx`

**Changes:**
- Import extended `useSizeMemory` hook
- Display confidence percentage under "Your size" badge
- Add tooltip with confidence message on hover

**Visual Enhancement (minimal, preserves design):**
```tsx
{/* "Your size" badge for remembered size */}
{isRemembered && stock > 0 && (
  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex flex-col items-center">
    <span className="text-[8px] uppercase tracking-wider bg-amber-500 text-white px-1.5 py-0.5 rounded-full whitespace-nowrap font-medium">
      Your size
    </span>
    {/* NEW: Confidence indicator */}
    {sizeConfidence && (
      <span className="text-[7px] text-muted-foreground mt-0.5">
        {sizeConfidence}% fit
      </span>
    )}
  </div>
)}
```

---

### Phase 5: Update useQuickAdd Hook

**File:** `src/hooks/useQuickAdd.ts`

**Changes:**
- Pass through confidence data for display on product cards
- Add `confidenceForRemembered` to return object

```typescript
// Add to return object
return {
  // ...existing
  confidenceForRemembered: rememberedSize 
    ? getSizeConfidence(categorySlug) 
    : null,
  confidenceMessage: getSizeConfidenceMessage(categorySlug),
};
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useSizeMemory.ts` | Complete refactor with database sync, confidence, migration |
| `src/components/product/SizeSelector.tsx` | Add confidence display under "Your size" badge |
| `src/hooks/useQuickAdd.ts` | Expose confidence data in return object |

---

## Technical Considerations

### Merge Strategy (Most Recent Wins)

For each category (tops, bottoms, hats):
1. Compare `localStorage.{type}_updated_at` with `db.{type}_updated_at`
2. If localStorage is newer: use localStorage value
3. If database is newer: use database value
4. If equal or missing: prefer localStorage (guest preference honored)

### Offline Resilience

- Always read from localStorage first (instant)
- Database fetch is secondary (async)
- If offline: localStorage works, database sync fails silently
- On reconnect: next size change triggers sync

### Performance

- Database calls are deferred (not blocking UI)
- Confidence fetch is cached in state
- No additional re-renders on mount (single state update after merge)
- Optimistic updates for size changes

---

## Acceptance Criteria

- [ ] Guests: sizes persist in localStorage only
- [ ] Authenticated: sizes sync to database on selection
- [ ] Login: localStorage merged with database (most recent wins)
- [ ] Logout: localStorage preserved for guest continuity
- [ ] Confidence displayed when available (50%+ threshold)
- [ ] Toast shown on successful migration: "Your sizes are synced"
- [ ] Offline mode works with localStorage fallback
- [ ] No visual layout changes (design locked)

