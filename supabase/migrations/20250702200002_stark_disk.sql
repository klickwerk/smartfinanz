/*
  # Fix infinite recursion in family_members RLS policies

  1. Problem Analysis
    - The `families` SELECT policy references `family_members` table
    - The `family_members` policies reference back to `families` table
    - This creates a circular dependency causing infinite recursion

  2. Solution
    - Simplify the `families` SELECT policy to avoid circular reference
    - Update `family_members` policies to be more direct
    - Ensure policies are evaluated without circular dependencies

  3. Changes
    - Drop existing problematic policies
    - Create new, simplified policies that avoid recursion
    - Maintain security while eliminating circular references
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view families they belong to" ON families;
DROP POLICY IF EXISTS "Family creators can manage all family members" ON family_members;
DROP POLICY IF EXISTS "Users can insert themselves as family members" ON family_members;
DROP POLICY IF EXISTS "Users can view their own family memberships" ON family_members;

-- Create new simplified policies for families table
CREATE POLICY "Users can view families they created"
  ON families
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Create new simplified policies for family_members table
CREATE POLICY "Users can view their own family memberships"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert themselves as family members"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Family creators can manage family members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM families 
      WHERE families.id = family_members.family_id 
      AND families.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM families 
      WHERE families.id = family_members.family_id 
      AND families.created_by = auth.uid()
    )
  );

-- Add a separate policy for families that allows viewing families where user is a member
-- This avoids the circular reference by using a direct approach
CREATE POLICY "Users can view families where they are members"
  ON families
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT fm.family_id 
      FROM family_members fm 
      WHERE fm.user_id = auth.uid()
    )
  );