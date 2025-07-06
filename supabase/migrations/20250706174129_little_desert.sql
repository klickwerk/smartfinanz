/*
  # Fix families table RLS policy

  1. Security Updates
    - Drop existing INSERT policy for families table
    - Create new INSERT policy using auth.uid() instead of uid()
    - Ensure proper RLS configuration for family creation

  2. Changes
    - Replace uid() function with auth.uid() for consistency
    - Maintain security by ensuring users can only create families where they are the creator
*/

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can create families" ON families;

-- Create new INSERT policy with proper auth function
CREATE POLICY "Users can create families"
  ON families
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Ensure RLS is enabled (should already be enabled but double-check)
ALTER TABLE families ENABLE ROW LEVEL SECURITY;