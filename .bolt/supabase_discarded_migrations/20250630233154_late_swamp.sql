/*
  # Fix RLS recursion in family_members and families tables
  
  1. Changes
     - Drop existing problematic policies on family_members that cause infinite recursion
     - Create new policies using IN clauses instead of EXISTS to avoid recursion
     - Fix the "Users can view families they belong to" policy to use IN instead of EXISTS
  
  2. Security
     - Maintains the same security model but eliminates recursion
     - Users can still only access their own data or data from families they belong to
     - Family creators retain full control over family members
*/

-- 1. Drop all existing policies on family_members to ensure a clean slate
DROP POLICY IF EXISTS "Users can view their own family memberships" ON family_members;
DROP POLICY IF EXISTS "Users can insert themselves as family members" ON family_members;
DROP POLICY IF EXISTS "Family creators can manage all family members" ON family_members;
DROP POLICY IF EXISTS "Family creators can view all family members" ON family_members;
DROP POLICY IF EXISTS "Users can view family members" ON family_members;

-- 2. Re-create family_members policies using IN clause for creator access

-- Policy 1: Users can view their own family memberships
CREATE POLICY "Users can view their own family memberships"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Users can insert themselves as family members
CREATE POLICY "Users can insert themselves as family members"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy 3: Family creators can manage (select, insert, update, delete) all family members for families they created
-- This policy uses the IN clause to avoid recursion
CREATE POLICY "Family creators can manage all family members"
  ON family_members
  FOR ALL -- Covers SELECT, INSERT, UPDATE, DELETE
  TO authenticated
  USING (
    family_id IN (
      SELECT id FROM families WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    family_id IN (
      SELECT id FROM families WHERE created_by = auth.uid()
    )
  );

-- 3. Drop existing problematic policy on families
DROP POLICY IF EXISTS "Users can view families they belong to" ON families;

-- 4. Re-create the policy for viewing families using IN clause to avoid recursion
CREATE POLICY "Users can view families they belong to"
  ON families
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );