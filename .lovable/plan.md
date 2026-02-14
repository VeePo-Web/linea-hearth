

# Add Helper Text Below Ministry Statement Textarea

## Change

Add a single line of helper text below the Ministry Statement textarea in `src/pages/admin/AdminProductForm.tsx` at line 317.

## Exact Edit

In `src/pages/admin/AdminProductForm.tsx`, after line 316 (the `<Textarea>` element), insert:

```tsx
<p className="text-xs text-muted-foreground">
  Leave blank to use the default faith statement. Your custom text will appear in "The Purpose" section on the product page.
</p>
```

This sits inside the existing `<div className="space-y-2">` wrapper (lines 314-317), so the `space-y-2` class automatically provides consistent 8px spacing between the label, textarea, and helper text.

## Scope

- **1 file** changed: `src/pages/admin/AdminProductForm.tsx`
- **1 line** inserted (after line 316)
- Zero layout, logic, or styling changes elsewhere

