

# Reset Admin Password for parker@veepo.ca

## What We Need to Do

The admin login credentials are invalid. We need to update the password for the existing admin account (parker@veepo.ca) to the one you provided.

## Approach

1. **Create a temporary backend function** (`reset-admin-password`) that uses the service role to update the password for the admin user
2. **Call the function once** to set the new password
3. **Delete the function immediately after** -- it's a one-time utility, not a permanent endpoint

## Technical Details

- The function will use the admin API to look up the user by email and update their password
- It will verify the target is actually parker@veepo.ca (hardcoded, not accepting arbitrary emails) for safety
- The password you provided will be set: `a!jaDIU(*102nK{}asdbhi1*(&A019283847599972`
- After confirming the password works, the function will be removed from the codebase

## Security Notes

- The function will be hardcoded to only work for parker@veepo.ca -- no parameters accepted
- It will be deleted immediately after use
- The password meets complexity requirements (30+ characters, mixed case, symbols, numbers)

## Steps

1. Create `supabase/functions/reset-admin-password/index.ts`
2. Deploy and call it once
3. Verify login works at `/ops-portal/login`
4. Delete the function

