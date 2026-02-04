# Supabase Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: GroupNest (or any name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to you
5. Click "Create new project"
6. Wait 2-3 minutes for the project to be ready

### Step 2: Get Your Credentials

1. In your Supabase dashboard, click on your project
2. Go to **Settings** (gear icon in sidebar)
3. Click on **API** in the settings menu
4. You'll see:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (a long string starting with `eyJ...`)

### Step 3: Configure the App

**Option A: Use Environment Variables (Recommended)**

1. Create a `.env` file in the root directory (same level as `package.json`)
2. Add these lines:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. Replace with your actual values from Step 2
4. Restart the Expo server: `npx expo start --clear`

**Option B: Edit Directly in Code**

1. Open `lib/supabase.ts`
2. Replace the empty strings with your actual values:
   ```typescript
   const supabaseUrl = 'https://your-project-id.supabase.co';
   const supabaseAnonKey = 'your-anon-key-here';
   ```

### Step 4: Set Up the Database

1. In Supabase dashboard, go to **SQL Editor**
2. Open the file `database/schema.sql` from this project
3. Copy the entire contents
4. Paste into the SQL Editor in Supabase
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

### Step 5: Test the Connection

1. Restart your app: `npx expo start --clear`
2. Try to sign up or log in
3. If it works, you're all set! 🎉

## Troubleshooting

### "Invalid supabaseUrl" Error
- Make sure your URL starts with `https://`
- Don't include a trailing slash
- Example: `https://abcdefgh.supabase.co` ✅
- Example: `https://abcdefgh.supabase.co/` ❌

### "Invalid API key" Error
- Make sure you're using the **anon public** key, not the service_role key
- The anon key should start with `eyJ`
- Copy the entire key (it's very long)

### Database Errors
- Make sure you ran the SQL schema (`database/schema.sql`)
- Check that all tables were created in the Supabase dashboard
- Go to **Table Editor** to verify tables exist

### Still Having Issues?
- Check the Supabase dashboard for error logs
- Make sure your project is active (not paused)
- Verify your internet connection
- Try restarting the Expo server with `--clear` flag

## Security Notes

- ✅ The `.env` file is already in `.gitignore` (won't be committed)
- ✅ Never commit your Supabase credentials to git
- ✅ The `anon` key is safe to use in client-side code
- ❌ Never use the `service_role` key in your app (server-side only)

## Next Steps

Once Supabase is configured:
1. The app will work with authentication
2. You can create groups, lists, and share with friends
3. Photos will be stored in Supabase Storage (set this up later)

Happy coding! 🚀








