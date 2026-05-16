## Goal
Give your friend admin access to the ops portal at a shareable URL.

## What I'll do

### 1. Confirm the shareable URL
The ops portal already lives at a clean subdirectory route:
```
https://line-of-judah.vercel.app/ops-portal/login
```
No code change needed for the URL — it works on any computer, just requires login.

### 2. Create the new admin account
Create a one-time edge function `create-admin-user` that uses the service role to:
- Create the auth user `1.LineOfJudah.1@gmail.com` with password `jesusislord#1` (email pre-confirmed so no verification email needed)
- Insert a `profiles` row
- Grant the `admin` role in `user_roles`

Then I'll invoke it once and delete the function so the credentials aren't sitting in deployable code.

### 3. Display the credentials in chat for you to forward
Since you chose to skip the email setup, I'll show you a clean copy-paste block at the end with:
- Portal URL
- Email
- Password
- A note reminding your friend to change the password after first login (optional — they can use the "Forgot password?" link on the portal)

## What's NOT changing
- No design/UI changes
- No changes to existing admin (`parker@veepo.ca` stays owner with permanent privileges)
- No public sign-up exposure — account is provisioned server-side only
- No email infrastructure setup

## Security note
The password `jesusislord#1` will be set exactly as given. Please rotate it after your friend signs in for the first time — sending passwords over chat/email is generally risky.
