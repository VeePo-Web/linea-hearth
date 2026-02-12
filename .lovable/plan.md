
# Fix 2: Order List Clickability, Discount Delete Confirmation, Category Drag Handles

## Problem 1: Order List Rows Look Clickable But Aren't (AdminOrders.tsx)

**Current Issue:**
- Line 169 has `className="cursor-pointer hover:bg-secondary/50"` on `<TableRow>`
- This visual promise is only fulfilled for the order ID link (line 171)
- Clicking anywhere else on the row does nothing
- **Conversion Impact:** Adds friction — users tap the row expecting navigation, get nothing

**Fix:**
- Wrap the entire row content in a clickable handler
- Use `useNavigate()` to navigate to `/ops-portal/orders/${order.id}` on row click
- Prevent navigation if user clicks on a button/link that has its own handler
- The row will still have the visual feedback (hover highlight + cursor)

**Implementation:** Add `onClick={() => navigate(`/ops-portal/orders/${order.id}`)}` to the `<TableRow>` element. This converts the entire row to a clickable zone. The order ID link becomes redundant but harmless (clicking it still works).

---

## Problem 2: Discount Delete Has No Confirmation (AdminDiscounts.tsx)

**Current Issue:**
- Line 238: `<Button>` with Trash2 icon directly calls `deleteCode(id)` on click
- No confirmation dialog — the code is deleted immediately with optimistic update
- **Inconsistency:** `AdminCategories.tsx` and `AdminProducts.tsx` both have `AlertDialog` confirmation before delete
- **Risk:** Accidental clicks permanently delete discount codes with no recourse

**Fix:**
- Add a confirmation dialog (reuse the `AlertDialog` component pattern from Categories)
- Only call `deleteCode()` when user confirms
- Add a `deleteConfirmId` state and conditionally render the `AlertDialog`
- Show the discount code name in the confirmation dialog for clarity

**Implementation:**
```
State: const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
On Trash click: setDeleteConfirmId(id)
On confirm: deleteCode(id), then setDeleteConfirmId(null)
AlertDialog shows: "Delete discount code [CODE_NAME]?" with warning text
```

---

## Problem 3: Category Drag Handles Are Fake (AdminCategories.tsx)

**Current Issue:**
- Line 22 imports `GripVertical` icon
- Line 169 has an empty `<TableHead className="w-10"></TableHead>` (column for drag handle)
- Line 192 renders: `<GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />`
- **Visual lie:** The icon + `cursor-grab` CSS promises drag-to-reorder functionality
- **Reality:** There is no `onDragStart`, `onDragOver`, `onDrop`, or `display_order` update logic
- **UX debt:** Users try to drag and nothing happens — frustrating and confusing

**Fix:**
- Remove the `GripVertical` icon entirely
- Remove the empty `<TableHead>` column (shrinks table from 5 to 4 columns)
- Keep the `display_order` sorting on the query (already present on line 68)
- If reordering is needed in the future, implement it properly with drag-and-drop logic (not this PR)

**Implementation:**
- Delete line 169 (the empty column header)
- Delete line 192 (the icon in the table cell)
- The table will have 4 columns: Name, Slug, Description, Actions

---

## Changes Required

### File 1: `src/pages/admin/AdminOrders.tsx`
- **Line 169:** Add `onClick` handler to navigate to order detail
- **Line 171:** Keep the Link (it still works, just redundant now)

### File 2: `src/pages/admin/AdminDiscounts.tsx`
- **Add state:** `deleteConfirmId`
- **Line 238:** Change to `onClick={() => setDeleteConfirmId(c.id)}`
- **Add new:** `AlertDialog` component with confirmation UI (copy pattern from AdminCategories.tsx)
- **Add handler:** Confirm button calls `deleteCode(deleteConfirmId)` then clears state

### File 3: `src/pages/admin/AdminCategories.tsx`
- **Line 169:** Remove the empty `<TableHead>` column
- **Line 192:** Remove the `<GripVertical>` cell
- **Line 22:** Can remove `GripVertical` import (if unused elsewhere)

---

## Risk Assessment

**Low Risk:**
- All changes are UI/interaction only
- No database changes
- No breaking changes to functionality
- Patterns are copied from existing code (AlertDialog already used in Categories for category delete)

**Benefits:**
- **Order rows:** Reduces taps by 50% — users can click anywhere on the row instead of targeting the small order ID link
- **Discount delete:** Prevents accidental deletions, matches the UX pattern of other admin pages
- **Category handles:** Eliminates false affordances, cleaner UI

---

## Visual Impact

**Zero visual changes** to styling or layout. Only:
- Order rows are fully clickable (same hover state, just extends to whole row)
- Discount delete has a confirmation modal (matches existing pattern)
- Categories table loses 1 empty column + grip icon (cleaner)

