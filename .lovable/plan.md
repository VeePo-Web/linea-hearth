## Finding

The site is published and public, but the live catalogue is not empty because of publishing anymore. The live page is failing its product request with:

`permission denied for function has_role`

That makes the product query return `401`, so the UI falls back to “NOTHING YET”. The database still has 18 active products.

## Plan

1. **Update database permissions**
   - Grant public/authenticated execution permission on the existing `has_role` database function.
   - This function is already used inside public product/category/image policies to let active products be visible while still allowing admin access.

2. **Re-test the live catalogue**
   - Reload `https://lineofjudah.clothing/catalogue`.
   - Confirm the product request returns `200` instead of `401`.
   - Confirm the 18 active products appear.

## Technical detail

No frontend code change is needed. This is a backend permission migration only:

```sql
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;
```