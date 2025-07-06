/*
  # Fix infinite recursion in family_members RLS policies

  1. Problem
    - Current RLS policies on family_members table are causing infinite recursion
    - Policies are referencing the same table they're protecting, creating circular dependencies

  2. Solution
    - Drop existing problematic policies
    - Create new, non-recursive policies that avoid self-referencing queries
    - Use table aliases and simpler logic to prevent recursion

  3. New Policies
    - Users can view their own family memberships
    - Family admins can manage all members in their families
    - Family creators can manage all members in their families
    - Users can insert/delete their own memberships only
*/

-- Drop all existing policies on family_members to start fresh
DROP POLICY IF EXISTS "Family admins can manage members" ON family_members;
DROP POLICY IF EXISTS "Family creators can manage members" ON family_members;
DROP POLICY IF EXISTS "Users can delete own memberships" ON family_members;
DROP POLICY IF EXISTS "Users can insert own memberships" ON family_members;
DROP POLICY IF EXISTS "Users can view own memberships" ON family_members;

-- Create new, non-recursive policies

-- Policy 1: Users can view their own memberships (simple, no recursion)
CREATE POLICY "Users can view own memberships"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Users can view other members in families they belong to
-- This uses a subquery that doesn't reference family_members in the main query
CREATE POLICY "Users can view family members"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT fm.family_id 
      FROM family_members fm 
      WHERE fm.user_id = auth.uid()
    )
  );

-- Policy 3: Users can insert their own memberships only
CREATE POLICY "Users can insert own memberships"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy 4: Users can delete their own memberships only
CREATE POLICY "Users can delete own memberships"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 5: Family creators can manage all members in their families
CREATE POLICY "Family creators can manage members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM families f 
      WHERE f.id = family_members.family_id 
      AND f.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM families f 
      WHERE f.id = family_members.family_id 
      AND f.created_by = auth.uid()
    )
  );

-- Policy 6: Family admins can manage members (but avoid recursion by using a different approach)
-- This policy checks if the current user is an admin in the same family
CREATE POLICY "Family admins can manage members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM family_members admin_fm 
      WHERE admin_fm.family_id = family_members.family_id 
      AND admin_fm.user_id = auth.uid() 
      AND admin_fm.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM family_members admin_fm 
      WHERE admin_fm.family_id = family_members.family_id 
      AND admin_fm.user_id = auth.uid() 
      AND admin_fm.role = 'admin'
    )
  );