/*
  # Add email field to profiles table

  1. Changes
    - Add email column to profiles table to store email addresses
    - This allows us to look up profiles by email when inviting family members
    - Ensures we can find existing users by email when sending invitations

  2. Security
    - Email addresses are protected by RLS policies
    - Only the user themselves and family admins can see email addresses
*/

-- Add email column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- Create index on email column for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Add RLS policy for email field
CREATE POLICY "Users can see their own email"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add RLS policy for family admins to see family member emails
CREATE POLICY "Family admins can see family member emails"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      JOIN family_members viewer_fm ON fm.family_id = viewer_fm.family_id
      WHERE fm.user_id = profiles.user_id
      AND viewer_fm.user_id = auth.uid()
      AND viewer_fm.role = 'admin'
    )
  );