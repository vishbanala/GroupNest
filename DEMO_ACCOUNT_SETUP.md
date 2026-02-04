# Demo Account Setup for App Store Review

## Issue
Apple reviewers cannot sign in with the provided demo account credentials:
- **Username:** VishBanala
- **Password:** Expo$101

## Solution

You need to create a demo account in your Supabase project that reviewers can use. Follow these steps:

### Step 1: Create Demo Account in Supabase

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **Users**
4. Click **"Add user"** or **"Create new user"**
5. Fill in:
   - **Email:** `vishbanala@demo.groupnest.app` (or any valid email format)
   - **Password:** `Expo$101`
   - **Auto Confirm User:** ✅ **CHECK THIS BOX** (Important! This bypasses email confirmation)
6. Click **"Create user"**

### Step 2: Verify Email Confirmation Settings

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Under **"Email Auth"**, check:
   - **"Enable email confirmations"** - For production, this should be ON
   - **BUT** for the demo account, make sure it's either:
     - **OFF** (not recommended for production), OR
     - The demo account is **auto-confirmed** (from Step 1)

### Step 3: Create User Record in Database

After creating the auth user, you need to create a corresponding record in the `users` table:

1. Go to **SQL Editor** in Supabase
2. Run this SQL (replace the email and user_id with the actual values from Step 1):

```sql
-- First, get the user_id from the auth.users table
-- Go to Authentication → Users and find the user you just created
-- Copy the UUID (user ID)

-- Then insert into users table (replace USER_ID_HERE with actual UUID)
INSERT INTO users (id, email, name, created_at)
VALUES (
  'USER_ID_HERE',  -- Replace with actual user ID from auth.users
  'vishbanala@demo.groupnest.app',  -- Or the email you used
  'VishBanala',
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email, name = EXCLUDED.name;
```

### Step 4: Alternative - Use Email as Username

If you prefer to use email format (which is more standard):

1. Create user with:
   - **Email:** `vishbanala@demo.groupnest.app`
   - **Password:** `Expo$101`
   - **Auto Confirm User:** ✅ CHECKED

2. Update App Store Connect with:
   - **Username/Email:** `vishbanala@demo.groupnest.app`
   - **Password:** `Expo$101`

### Step 5: Test the Account

1. Open your app
2. Try to sign in with:
   - Email: `vishbanala@demo.groupnest.app` (or the email you used)
   - Password: `Expo$101`
3. If it works, you're good to go!

### Step 6: Update App Store Connect

1. Go to App Store Connect
2. Navigate to your app → **App Store** tab
3. Scroll to **"App Review Information"**
4. Update the demo account credentials:
   - **Username:** `vishbanala@demo.groupnest.app` (or the email you created)
   - **Password:** `Expo$101`
5. Add notes:
   ```
   Demo Account Credentials:
   Email: vishbanala@demo.groupnest.app
   Password: Expo$101
   
   This account has been pre-configured and auto-confirmed for testing purposes.
   Reviewers can use this account to access all features of the app.
   ```

## Troubleshooting

### "Invalid login credentials"
- Make sure the account exists in Supabase Authentication → Users
- Verify the password is exactly `Expo$101` (case-sensitive)
- Check that "Auto Confirm User" was checked when creating the account

### "Email not confirmed"
- The account needs to be auto-confirmed OR email confirmation must be disabled
- Go to Authentication → Users → Find the user → Click "..." → "Confirm email"

### "User not found" after login
- The user record might not exist in the `users` table
- Run the SQL from Step 3 to create the user record

### Account works but has no data
- This is normal - the demo account starts empty
- Reviewers can create groups, lists, etc. to test functionality
- Consider pre-populating with sample data if needed

## Quick SQL to Create Demo Account

Run this in Supabase SQL Editor (replace with your actual values):

```sql
-- This assumes you've already created the auth user
-- Get the user_id from Authentication → Users first

-- Insert user record (replace USER_ID_HERE)
INSERT INTO users (id, email, name, created_at)
SELECT 
  id,
  email,
  'VishBanala',
  NOW()
FROM auth.users
WHERE email = 'vishbanala@demo.groupnest.app'
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name;
```

## Important Notes

- **Never use a real user's account** as the demo account
- **Use a dedicated email** for the demo account (not your personal email)
- **Keep the password simple** but secure enough for reviewers
- **Document the credentials** clearly in App Store Connect
- **Test the account** before submitting for review

