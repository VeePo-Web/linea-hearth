

# Make parker@veepo.ca a Permanent Admin

## What Needs to Happen

Your account (`parker@veepo.ca`) exists in the authentication system but has no entry in the `user_roles` table. We need to:

1. **Insert your admin role** into `user_roles` with your user ID (`dee51bd2-8ad5-45f4-ac5f-b369bd2fc23b`)
2. **Create a database trigger** that automatically re-assigns your admin role if it is ever accidentally deleted -- ensuring you are always an admin

## Technical Steps

### Step 1: Insert Admin Role (Database)

Run a SQL migration to insert your role:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('dee51bd2-8ad5-45f4-ac5f-b369bd2fc23b', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

### Step 2: Create a Safety-Net Trigger (Database)

A trigger function that fires on DELETE from `user_roles`. If someone removes your admin row, it immediately re-inserts it. This guarantees permanent admin access.

```sql
CREATE OR REPLACE FUNCTION public.protect_owner_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.user_id = 'dee51bd2-8ad5-45f4-ac5f-b369bd2fc23b'
     AND OLD.role = 'admin' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (OLD.user_id, OLD.role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER protect_owner_admin_trigger
AFTER DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.protect_owner_admin();
```

### Step 3: No Code Changes

The existing `useAuth` hook already checks `user_roles` via `checkAdminRole()`. Once the database row exists, logging in with `parker@veepo.ca` at `/ops-portal/login` will automatically grant admin access. No frontend changes needed.

## Important Note on "Always Logged In"

Keeping you permanently logged in is not recommended from a security standpoint -- if someone accesses your browser, they'd have full admin access. Instead, the 30-minute session timeout stays active, but logging back in is fast (email + password at `/ops-portal/login`). Your admin role is permanent and cannot be revoked.

## Summary

| Action | Method |
|--------|--------|
| Grant admin role | SQL insert into `user_roles` |
| Protect against accidental removal | Database trigger on DELETE |
| Frontend changes | None required |

