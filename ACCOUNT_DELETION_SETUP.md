# Account Deletion Setup

Apple requires apps to support account deletion. This guide explains how to set up complete account deletion.

## Current Implementation

The app now includes:
- ✅ Delete Account button in Profile modal
- ✅ Two-step confirmation process
- ✅ Deletes all user data from the database
- ⚠️ Requires Edge Function for complete auth.users deletion

## Setup Steps

### Option 1: Use Database Function (Simpler, but limited)

1. Go to your Supabase Dashboard → SQL Editor
2. Run the SQL from `database/delete_account_function.sql`
3. This will create a function that attempts to delete the user

**Note:** This may not fully delete from `auth.users` due to permissions. If it doesn't work, use Option 2.

### Option 2: Create Supabase Edge Function (Recommended)

1. **Create Edge Function:**
   ```bash
   supabase functions new delete-account
   ```

2. **Add this code to `supabase/functions/delete-account/index.ts`:**
   ```typescript
   import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

   const corsHeaders = {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
   }

   serve(async (req) => {
     if (req.method === 'OPTIONS') {
       return new Response('ok', { headers: corsHeaders })
     }

     try {
       const supabaseClient = createClient(
         Deno.env.get('SUPABASE_URL') ?? '',
         Deno.env.get('SUPABASE_ANON_KEY') ?? '',
         {
           global: {
             headers: { Authorization: req.headers.get('Authorization')! },
           },
         }
       )

       const {
         data: { user },
       } = await supabaseClient.auth.getUser()

       if (!user) {
         return new Response(
           JSON.stringify({ error: 'User not authenticated' }),
           { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
         )
       }

       // Use Admin API to delete user
       const supabaseAdmin = createClient(
         Deno.env.get('SUPABASE_URL') ?? '',
         Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
         {
           auth: {
             autoRefreshToken: false,
             persistSession: false
           }
         }
       )

       // Delete user from auth.users (requires admin)
       const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

       if (deleteError) {
         throw deleteError
       }

       return new Response(
         JSON.stringify({ success: true, message: 'Account deleted successfully' }),
         { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       )
     } catch (error) {
       return new Response(
         JSON.stringify({ error: error.message }),
         { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
       )
     }
   })
   ```

3. **Deploy the function:**
   ```bash
   supabase functions deploy delete-account
   ```

4. **Update `lib/database.ts` to use the Edge Function:**
   ```typescript
   export const deleteAccount = async (): Promise<void> => {
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) throw new Error('User not authenticated');

     // Call the Edge Function
     const { data, error } = await supabase.functions.invoke('delete-account', {
       method: 'POST',
     });

     if (error) throw error;
     
     // Sign out
     await supabase.auth.signOut();
   };
   ```

### Option 3: Manual Setup (If Edge Functions aren't available)

If you can't use Edge Functions, the current implementation will:
- Delete all user data from the database (via CASCADE)
- Sign out the user
- The `auth.users` record will remain but be inactive

You can then manually delete inactive users from Supabase Dashboard → Authentication → Users periodically.

## Testing

1. Create a test account
2. Add some data (groups, lists, photos)
3. Go to Profile → Delete Account
4. Confirm deletion
5. Verify:
   - User is signed out
   - All data is deleted
   - Cannot sign in with deleted account

## Apple Review Requirements

✅ **Account deletion is accessible** - Available in Profile modal
✅ **Permanent deletion** - Deletes all user data
✅ **Confirmation steps** - Two-step confirmation process
✅ **No customer service required** - Can be done in-app

## Important Notes

- Account deletion is **permanent and cannot be undone**
- All user data (groups, lists, photos, comments) will be deleted
- If the user is a group owner, the group will be deleted (cascade)
- Other group members will lose access to groups owned by deleted user

