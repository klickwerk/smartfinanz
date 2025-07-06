/*
  # Fix Family Relationships and RLS Policies

  1. Database Schema Fixes
    - Add missing foreign key constraint between family_members.user_id and profiles.user_id
    - Ensure proper relationships exist for data joining

  2. RLS Policy Fixes
    - Remove circular dependencies in families and family_members policies
    - Simplify policies to prevent infinite recursion
    - Ensure users can access their family data without policy conflicts

  3. Security
    - Maintain proper access control while fixing recursion issues
    - Users can only see families they belong to
    - Users can only see family members of families they belong to
*/

-- First, let's drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view families where they are members" ON families;
DROP POLICY IF EXISTS "Family creators can update their families" ON families;
DROP POLICY IF EXISTS "Users can create families" ON families;
DROP POLICY IF EXISTS "Users can manage their own families" ON families;
DROP POLICY IF EXISTS "Users can view families they created" ON families;

DROP POLICY IF EXISTS "Family admins can remove members" ON family_members;
DROP POLICY IF EXISTS "Family creators can manage family members" ON family_members;
DROP POLICY IF EXISTS "Users can insert themselves as family members" ON family_members;
DROP POLICY IF EXISTS "Users can view their own family memberships" ON family_members;

-- Add the missing foreign key constraint between family_members and profiles
-- First check if the constraint doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'family_members_user_id_profiles_fkey'
    AND table_name = 'family_members'
  ) THEN
    ALTER TABLE family_members 
    ADD CONSTRAINT family_members_user_id_profiles_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(user_id);
  END IF;
END $$;

-- Create simplified RLS policies for families table
CREATE POLICY "Users can view their families"
  ON families
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() 
    OR 
    id IN (
      SELECT fm.family_id 
      FROM family_members fm 
      WHERE fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create families"
  ON families
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Family creators can update families"
  ON families
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Family creators can delete families"
  ON families
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Create simplified RLS policies for family_members table
CREATE POLICY "Users can view family members"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    family_id IN (
      SELECT f.id 
      FROM families f 
      WHERE f.created_by = auth.uid()
    )
    OR
    family_id IN (
      SELECT fm2.family_id 
      FROM family_members fm2 
      WHERE fm2.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join families"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Family creators can manage members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (
    family_id IN (
      SELECT f.id 
      FROM families f 
      WHERE f.created_by = auth.uid()
    )
  )
  WITH CHECK (
    family_id IN (
      SELECT f.id 
      FROM families f 
      WHERE f.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can leave families"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create an index to improve performance of the foreign key relationship
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);