-- Function to delete user account and all associated data
-- This function deletes the user from auth.users, which will cascade delete all related data
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id_to_delete UUID;
BEGIN
  -- Get the current user's ID
  user_id_to_delete := auth.uid();
  
  IF user_id_to_delete IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Delete the user from auth.users (this will cascade delete all related data)
  -- Note: This requires the function to be run with elevated privileges
  -- The user record in public.users will be deleted via CASCADE
  DELETE FROM auth.users WHERE id = user_id_to_delete;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;

-- Note: If the above doesn't work due to RLS, you may need to use Supabase Admin API
-- or create a database webhook/edge function to handle account deletion

