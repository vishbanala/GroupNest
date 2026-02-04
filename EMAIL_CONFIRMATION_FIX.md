# Fix: Email Not Confirmed Error

## Quick Fix: Disable Email Confirmation (Development)

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **Settings** (in the left sidebar)
4. Scroll down to **Email Auth** section
5. Find **"Enable email confirmations"**
6. **Turn it OFF** (toggle switch)
7. Click **Save**

Now users can sign in immediately without email confirmation!

## Alternative: Check Your Email

If you want to keep email confirmation enabled:
1. Check your email inbox (and spam folder)
2. Look for an email from Supabase
3. Click the confirmation link
4. Then try signing in again

## For Production

When you're ready to deploy:
- Re-enable email confirmation for security
- Set up proper email templates
- Configure your email domain








