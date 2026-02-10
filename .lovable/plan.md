

# Forensic Audit + Search Fix: Stress Test Findings

## Issues Discovered

### Critical: Search Does Not Work

The `SearchOverlay` component has a fully styled search input that accepts user typing, but **no search query is ever executed**. The `searchValue` state updates but never triggers any database query. The component only shows:
- Static hardcoded "Popular Searches" (Stay Holy, Heavenly Crewneck, etc.)
- Trending products fetched from the `products` table filtered by `is_featured = true`

When a user types "hoodie" and hits enter, nothing happens. No results. No filtering. No feedback. This is a broken core feature.

### Secondary Issues Found

1. **`fetchPriority` React warning** -- `EditorialHero.tsx` line 62 uses `fetchPriority="high"` on an `<img>` tag. React doesn't recognize this as a standard prop and throws a console warning. Should be `fetchpriority` (lowercase) or handled differently.

2. **Navigation auto-adds cart items on every mount** -- `Navigation.tsx` lines 34-53 auto-add "Stay Holy Hoodie" and "Heavenly Crewneck" to the cart every time the component mounts and items are empty. This is demo/dev code that will confuse real users.

3. **Search overlay query missing `slug` in categories join** -- The SearchOverlay trending products query fetches `categories:category_id(name, slug)` but the `TrendingProduct` component maps `category_slug: product.categories?.slug`. However, the response shows the category object only has `name` since the query alias uses `categories` not the FK hint. This means `category_slug` is always undefined for trending products, breaking size memory category resolution.

---

## Fix Plan

### Fix 1: Implement Actual Product Search (Primary)

**File: `src/components/header/SearchOverlay.tsx`**

Add a debounced search query that fires when `searchValue` has 2+ characters:

1. Add a new `useQuery` that searches products by name using Supabase's `ilike` filter
2. Debounce the search input by 300ms to avoid hammering the database
3. Show search results when typing, show trending products when search is empty
4. Include product variants in search results for quick-add functionality
5. Add "No results found" state with suggestion to browse collections
6. Add loading skeleton while search is in progress

**Search query structure:**
```
supabase
  .from('products')
  .select(`id, name, slug, price, sale_price, is_on_sale,
    categories:category_id(name, slug),
    product_images(image_url, is_primary),
    product_variants(size, color, stock_quantity)`)
  .eq('status', 'active')
  .ilike('name', `%${searchValue}%`)
  .limit(6)
```

**UI behavior:**
- Empty input: show Popular Searches + Trending Now (current behavior)
- 1 character: still show default state (too broad)
- 2+ characters: show search results with quick-add buttons
- No results: "No products found for [query]" + "Browse all" link
- Loading: skeleton placeholders

### Fix 2: Fix `fetchPriority` Warning

**File: `src/components/homepage/EditorialHero.tsx` (line 62)**

Change `fetchPriority="high"` to use the correct lowercase attribute. Since this is an HTML attribute not a React prop, we can suppress the warning or use a different approach.

### Fix 3: Remove Demo Cart Auto-Add

**File: `src/components/header/Navigation.tsx` (lines 34-53)**

Remove the `useEffect` that auto-adds products to cart. This is development scaffolding that should not be in production.

### Fix 4: Fix Category Slug Resolution in Search

Ensure the trending products query properly passes `category_slug` through the FK hint so size memory works correctly for quick-add in search results.

---

## Technical Implementation Details

### Debounce Hook for Search

Create a simple `useDebouncedValue` inline (no new file needed -- just a `useEffect` + `setTimeout` pattern within SearchOverlay):

```text
const [debouncedSearch, setDebouncedSearch] = useState('')

useEffect(() => {
  const timer = setTimeout(() => setDebouncedSearch(searchValue), 300)
  return () => clearTimeout(timer)
}, [searchValue])
```

### Search Results Query

Add alongside the existing trending products query:

```text
const { data: searchResults, isLoading: isSearching } = useQuery({
  queryKey: ['product-search', debouncedSearch],
  queryFn: async () => { /* ilike query */ },
  enabled: isOpen && debouncedSearch.length >= 2,
  staleTime: 30 * 1000,
})
```

### Conditional Rendering Logic

```text
if searchValue.length >= 2:
  if isSearching: show skeleton
  if searchResults.length > 0: show results with SearchQuickAdd
  if searchResults.length === 0: show "No results" + browse link
else:
  show Popular Searches + Trending Now (existing)
```

### Files Changed

| File | Change | Risk |
|------|--------|------|
| `src/components/header/SearchOverlay.tsx` | Add search query, debounce, results UI, no-results state | Medium -- new feature, well-contained |
| `src/components/homepage/EditorialHero.tsx` | Fix `fetchPriority` casing | Trivial |
| `src/components/header/Navigation.tsx` | Remove auto-add cart items effect | Low -- removes dev code |

