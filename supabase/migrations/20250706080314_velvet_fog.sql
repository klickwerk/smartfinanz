/*
  # Add Profile Update Trigger

  1. Changes
    - Create a trigger to update user_metadata when profile is updated
    - Ensure profile name changes are reflected in auth.users
    - Add function to handle profile updates

  2. Benefits
    - Keeps user data in sync between profiles and auth.users
    - Ensures name changes are reflected throughout the application
    - Improves data consistency
*/

-- Create a function to update user metadata when profile is updated
CREATE OR REPLACE FUNCTION handle_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update auth.users metadata when full_name is changed
  IF NEW.full_name IS DISTINCT FROM OLD.full_name THEN
    UPDATE auth.users
    SET raw_user_meta_data = 
      CASE 
        WHEN raw_user_meta_data IS NULL THEN 
          jsonb_build_object('full_name', NEW.full_name)
        ELSE
          raw_user_meta_data || jsonb_build_object('full_name', NEW.full_name)
      END
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger on profiles table
DROP TRIGGER IF EXISTS trigger_profile_update ON profiles;
CREATE TRIGGER trigger_profile_update
AFTER UPDATE ON profiles
FOR EACH ROW
WHEN (OLD.full_name IS DISTINCT FROM NEW.full_name)
EXECUTE FUNCTION handle_profile_update();

-- Ensure profiles have email field populated from auth.users
UPDATE profiles
SET email = (
  SELECT email FROM auth.users WHERE id = profiles.user_id
)
WHERE email IS NULL AND user_id IS NOT NULL;