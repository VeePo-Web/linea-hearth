

# Set Admin Password for parker@veepo.ca

## Approach

Since passwords are managed by the authentication system, the safest way to set one is through a temporary backend function that uses admin privileges to update the password directly.

## Steps

### Step 1: Create a temporary backend function

Create a one-time-use edge function (`set-admin-password`) that:
- Accepts the new password in the request body
- Uses the service role key to call `auth.admin.updateUserById` for user ID `dee51bd2-8ad5-45f4-ac5f-b369bd2fc23b`
- Sets the provided password
- Returns success/failure

### Step 2: Call it once to set the password

Invoke the function with the password you provided to apply it immediately.

### Step 3: Delete the function

Remove the edge function entirely after use so it cannot be called again. No trace of the password remains in the codebase.

### Step 4: Verify

Log in at `/ops-portal/login` with `parker@veepo.ca` and the new password to confirm it works.

## Security Notes

- The password will only exist in the function call's request body (never saved to code or database)
- The function is deleted immediately after use
- The password meets strong complexity requirements (40+ characters, mixed case, symbols, numbers)

