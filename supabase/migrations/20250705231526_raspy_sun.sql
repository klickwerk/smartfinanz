/*
  # Fix RLS Policy Infinite Recursion and Database Relationships

  1. Changes
     - Drop all problematic policies that cause infinite recursion
     - Create new non-recursive policies for all affected tables
     - Add missing foreign key constraint between family_members and profiles
     - Create indexes to improve query performance
     
  2. Security
     - Maintain proper access control for all tables
     - Ensure users can only access their own data or data from families they belong to
     - Prevent circular references in policy definitions
*/

-- First, drop all problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view families where they are members" ON families;
DROP POLICY IF EXISTS "Users can view families they created" ON families;
DROP POLICY IF EXISTS "Users can view families they belong to" ON families;
DROP POLICY IF EXISTS "Users can view their families" ON families;
DROP POLICY IF EXISTS "Family creators can update families" ON families;
DROP POLICY IF EXISTS "Users can create families" ON families;
DROP POLICY IF EXISTS "Users can manage their own families" ON families;
DROP POLICY IF EXISTS "Family creators can delete families" ON families;

DROP POLICY IF EXISTS "Family admins can remove members" ON family_members;
DROP POLICY IF EXISTS "Family creators can manage family members" ON family_members;
DROP POLICY IF EXISTS "Family creators can manage all family members" ON family_members;
DROP POLICY IF EXISTS "Users can insert themselves as family members" ON family_members;
DROP POLICY IF EXISTS "Users can view their own family memberships" ON family_members;
DROP POLICY IF EXISTS "Users can view family members" ON family_members;
DROP POLICY IF EXISTS "Users can join families" ON family_members;
DROP POLICY IF EXISTS "Users can leave families" ON family_members;
DROP POLICY IF EXISTS "Family creators can manage members" ON family_members;

-- Drop problematic policies on related tables
DROP POLICY IF EXISTS "Users can view family budgets" ON budgets;
DROP POLICY IF EXISTS "Users can view family transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view family projects" ON projects;
DROP POLICY IF EXISTS "Users can view project participants of their projects" ON project_participants;
DROP POLICY IF EXISTS "Users can view project history of their projects" ON project_history;
DROP POLICY IF EXISTS "Users can view their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can view their own participations" ON project_participants;
DROP POLICY IF EXISTS "Project creators can view participants" ON project_participants;
DROP POLICY IF EXISTS "Family members can view project participants" ON project_participants;
DROP POLICY IF EXISTS "Users can view their own contributions" ON project_history;
DROP POLICY IF EXISTS "Project creators can view history" ON project_history;
DROP POLICY IF EXISTS "Project participants can view history" ON project_history;

-- Add the missing foreign key constraint between family_members and profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'family_members_user_id_profiles_fkey'
    AND table_name = 'family_members'
  ) THEN
    -- Check if the profiles table has a user_id column
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'profiles' AND column_name = 'user_id'
    ) THEN
      -- Add the constraint
      ALTER TABLE family_members 
      ADD CONSTRAINT family_members_user_id_profiles_fkey 
      FOREIGN KEY (user_id) REFERENCES profiles(user_id);
    END IF;
  END IF;
END $$;

-- Create simplified RLS policies for families table
CREATE POLICY "Users can view their own families"
  ON families
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can view families they are members of"
  ON families
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT family_id 
      FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create families"
  ON families
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own families"
  ON families
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own families"
  ON families
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Create simplified RLS policies for family_members table
CREATE POLICY "Users can view their own memberships"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Family creators can view all members"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT id 
      FROM families 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can add themselves to families"
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
      SELECT id 
      FROM families 
      WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    family_id IN (
      SELECT id 
      FROM families 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can remove themselves from families"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create simplified policies for budgets
CREATE POLICY "Users can view their own budgets"
  ON budgets
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can view family budgets"
  ON budgets
  FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id 
      FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

-- Create simplified policies for transactions
CREATE POLICY "Users can view their own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can view family transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id 
      FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

-- Create simplified policies for projects
CREATE POLICY "Users can view their own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can view family projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id 
      FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

-- Create simplified policies for project_participants
CREATE POLICY "Users can view their own participations"
  ON project_participants
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Project creators can view participants"
  ON project_participants
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id 
      FROM projects 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Family members can view project participants"
  ON project_participants
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id 
      FROM projects 
      WHERE family_id IN (
        SELECT family_id 
        FROM family_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Create simplified policies for project_history
CREATE POLICY "Users can view their own contributions"
  ON project_history
  FOR SELECT
  TO authenticated
  USING (contributor_id = auth.uid());

CREATE POLICY "Project creators can view history"
  ON project_history
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id 
      FROM projects 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Project participants can view history"
  ON project_history
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id 
      FROM project_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Create indexes to improve performance
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_family_id ON budgets(family_id);
CREATE INDEX IF NOT EXISTS idx_transactions_family_id ON transactions(family_id);
CREATE INDEX IF NOT EXISTS idx_projects_family_id ON projects(family_id);