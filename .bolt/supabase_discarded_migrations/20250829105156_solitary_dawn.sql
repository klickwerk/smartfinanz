/*
  # Fix RLS Recursion Issues

  This migration resolves infinite recursion problems in RLS policies by implementing
  SECURITY DEFINER helper functions and simplified, non-recursive policies.

  ## Changes Made

  1. **Helper Functions**
     - `is_user_in_family(user_id, family_id)` - Checks if user is member of family
     - `is_family_admin(user_id, family_id)` - Checks if user is admin of family
     - Both functions run with SECURITY DEFINER to bypass RLS on internal queries

  2. **Cleaned RLS Policies**
     - Removed all existing policies on families and family_members tables
     - Implemented new non-recursive policies using helper functions
     - Added policies for budgets, transactions, and projects tables

  3. **Security**
     - All tables have RLS enabled
     - Helper functions have proper permissions for anon and authenticated roles
     - Policies ensure proper access control without recursion

  ## Tables Affected
  - families
  - family_members
  - budgets
  - transactions
  - projects
*/

-- =====================================================
-- 1. DROP ALL EXISTING RLS POLICIES TO START CLEAN
-- =====================================================

-- Drop existing policies on families table
DROP POLICY IF EXISTS "Families: creators can manage" ON families;
DROP POLICY IF EXISTS "Families: members can view" ON families;

-- Drop existing policies on family_members table
DROP POLICY IF EXISTS "Family members: creators can delete" ON family_members;
DROP POLICY IF EXISTS "Family members: creators can insert" ON family_members;
DROP POLICY IF EXISTS "Family members: creators can update" ON family_members;
DROP POLICY IF EXISTS "Family members: creators can view all" ON family_members;
DROP POLICY IF EXISTS "Family members: view own memberships" ON family_members;

-- Drop any existing policies on other tables that might cause issues
DROP POLICY IF EXISTS "Users can read budgets" ON budgets;
DROP POLICY IF EXISTS "Users can manage budgets" ON budgets;
DROP POLICY IF EXISTS "Users can read transactions" ON transactions;
DROP POLICY IF EXISTS "Users can manage transactions" ON transactions;
DROP POLICY IF EXISTS "Users can read projects" ON projects;
DROP POLICY IF EXISTS "Users can manage projects" ON projects;

-- =====================================================
-- 2. CREATE SECURITY DEFINER HELPER FUNCTIONS
-- =====================================================

-- Function to check if a user is a member of a specific family
CREATE OR REPLACE FUNCTION is_user_in_family(check_user_id uuid, check_family_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is a member of the specified family
  RETURN EXISTS (
    SELECT 1 
    FROM family_members 
    WHERE user_id = check_user_id 
    AND family_id = check_family_id
  );
END;
$$;

-- Function to check if a user is an admin of a specific family
CREATE OR REPLACE FUNCTION is_family_admin(check_user_id uuid, check_family_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is the creator of the family OR has admin role in family_members
  RETURN EXISTS (
    SELECT 1 
    FROM families 
    WHERE id = check_family_id 
    AND created_by = check_user_id
  ) OR EXISTS (
    SELECT 1 
    FROM family_members 
    WHERE user_id = check_user_id 
    AND family_id = check_family_id 
    AND role = 'admin'
  );
END;
$$;

-- Grant execute permissions to the roles that need them
GRANT EXECUTE ON FUNCTION is_user_in_family(uuid, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_family_admin(uuid, uuid) TO anon, authenticated;

-- =====================================================
-- 3. CREATE MISSING TABLES IF THEY DON'T EXIST
-- =====================================================

-- Create budgets table if it doesn't exist
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  budgeted_amount numeric NOT NULL DEFAULT 0,
  spent_amount numeric NOT NULL DEFAULT 0,
  start_date date,
  end_date date,
  recurrence text NOT NULL DEFAULT 'monthly' CHECK (recurrence IN ('monthly', 'quarterly', 'yearly')),
  assigned_to text,
  family_id uuid REFERENCES families(id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  color text NOT NULL DEFAULT 'from-blue-500 to-blue-400',
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  amount numeric NOT NULL,
  category text NOT NULL,
  date date,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  currency text NOT NULL DEFAULT 'EUR',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('completed', 'pending', 'overdue', 'someday')),
  description text,
  tags text[] DEFAULT '{}',
  assigned_to text,
  recurrence text NOT NULL DEFAULT 'none' CHECK (recurrence IN ('none', 'monthly', 'quarterly', 'yearly')),
  completed_date date,
  generated_from uuid REFERENCES transactions(id) ON DELETE CASCADE,
  is_budget_transaction boolean NOT NULL DEFAULT false,
  budget_id uuid REFERENCES budgets(id) ON DELETE CASCADE,
  family_id uuid REFERENCES families(id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  target_amount numeric NOT NULL DEFAULT 0,
  current_amount numeric NOT NULL DEFAULT 0,
  due_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  category text NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  family_id uuid REFERENCES families(id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create project_participants table if it doesn't exist
CREATE TABLE IF NOT EXISTS project_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  contribution numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create project_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS project_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  amount numeric NOT NULL,
  contributor_id text NOT NULL,
  contributor_name text NOT NULL,
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'milestone')),
  description text,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 4. ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_history ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE NON-RECURSIVE RLS POLICIES
-- =====================================================

-- FAMILIES TABLE POLICIES
-- Users can read families they created OR are members of
CREATE POLICY "Families: read access"
  ON families
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR 
    is_user_in_family(auth.uid(), id)
  );

-- Only creators can insert families
CREATE POLICY "Families: creators can insert"
  ON families
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Only creators can update families
CREATE POLICY "Families: creators can update"
  ON families
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Only creators can delete families
CREATE POLICY "Families: creators can delete"
  ON families
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- FAMILY_MEMBERS TABLE POLICIES
-- Users can read their own memberships
CREATE POLICY "Family members: read own memberships"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Family admins can read all members of their families
CREATE POLICY "Family members: admins can read all"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (is_family_admin(auth.uid(), family_id));

-- Only family admins can insert members
CREATE POLICY "Family members: admins can insert"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (is_family_admin(auth.uid(), family_id));

-- Only family admins can update members
CREATE POLICY "Family members: admins can update"
  ON family_members
  FOR UPDATE
  TO authenticated
  USING (is_family_admin(auth.uid(), family_id))
  WITH CHECK (is_family_admin(auth.uid(), family_id));

-- Only family admins can delete members
CREATE POLICY "Family members: admins can delete"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (is_family_admin(auth.uid(), family_id));

-- BUDGETS TABLE POLICIES
-- Users can read budgets they created OR family members can read family budgets
CREATE POLICY "Budgets: read access"
  ON budgets
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    (family_id IS NOT NULL AND is_user_in_family(auth.uid(), family_id))
  );

-- Users can insert budgets they create OR family admins can insert family budgets
CREATE POLICY "Budgets: insert access"
  ON budgets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND (
      family_id IS NULL OR 
      is_family_admin(auth.uid(), family_id)
    )
  );

-- Users can update budgets they created OR family admins can update family budgets
CREATE POLICY "Budgets: update access"
  ON budgets
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    (family_id IS NOT NULL AND is_family_admin(auth.uid(), family_id))
  )
  WITH CHECK (
    created_by = auth.uid() OR
    (family_id IS NOT NULL AND is_family_admin(auth.uid(), family_id))
  );

-- Users can delete budgets they created OR family admins can delete family budgets
CREATE POLICY "Budgets: delete access"
  ON budgets
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    (family_id IS NOT NULL AND is_family_admin(auth.uid(), family_id))
  );

-- TRANSACTIONS TABLE POLICIES
-- Users can read transactions they created OR family members can read family transactions
CREATE POLICY "Transactions: read access"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    (family_id IS NOT NULL AND is_user_in_family(auth.uid(), family_id))
  );

-- Users can insert transactions they create OR family admins can insert family transactions
CREATE POLICY "Transactions: insert access"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND (
      family_id IS NULL OR 
      is_family_admin(auth.uid(), family_id)
    )
  );

-- Users can update transactions they created OR family admins can update family transactions
CREATE POLICY "Transactions: update access"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    (family_id IS NOT NULL AND is_family_admin(auth.uid(), family_id))
  )
  WITH CHECK (
    created_by = auth.uid() OR
    (family_id IS NOT NULL AND is_family_admin(auth.uid(), family_id))
  );

-- Users can delete transactions they created OR family admins can delete family transactions
CREATE POLICY "Transactions: delete access"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    (family_id IS NOT NULL AND is_family_admin(auth.uid(), family_id))
  );

-- PROJECTS TABLE POLICIES
-- Users can read projects they created OR family members can read family projects
CREATE POLICY "Projects: read access"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    (family_id IS NOT NULL AND is_user_in_family(auth.uid(), family_id))
  );

-- Users can insert projects they create OR family admins can insert family projects
CREATE POLICY "Projects: insert access"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND (
      family_id IS NULL OR 
      is_family_admin(auth.uid(), family_id)
    )
  );

-- Users can update projects they created OR family admins can update family projects
CREATE POLICY "Projects: update access"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    (family_id IS NOT NULL AND is_family_admin(auth.uid(), family_id))
  )
  WITH CHECK (
    created_by = auth.uid() OR
    (family_id IS NOT NULL AND is_family_admin(auth.uid(), family_id))
  );

-- Users can delete projects they created OR family admins can delete family projects
CREATE POLICY "Projects: delete access"
  ON projects
  FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    (family_id IS NOT NULL AND is_family_admin(auth.uid(), family_id))
  );

-- PROJECT_PARTICIPANTS TABLE POLICIES
-- Users can read participants of projects they have access to
CREATE POLICY "Project participants: read access"
  ON project_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id = project_id 
      AND (
        created_by = auth.uid() OR
        (family_id IS NOT NULL AND is_user_in_family(auth.uid(), family_id))
      )
    )
  );

-- Only project creators or family admins can manage participants
CREATE POLICY "Project participants: manage access"
  ON project_participants
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id = project_id 
      AND (
        created_by = auth.uid() OR
        (family_id IS NOT NULL AND is_family_admin(auth.uid(), family_id))
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id = project_id 
      AND (
        created_by = auth.uid() OR
        (family_id IS NOT NULL AND is_family_admin(auth.uid(), family_id))
      )
    )
  );

-- PROJECT_HISTORY TABLE POLICIES
-- Users can read history of projects they have access to
CREATE POLICY "Project history: read access"
  ON project_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id = project_id 
      AND (
        created_by = auth.uid() OR
        (family_id IS NOT NULL AND is_user_in_family(auth.uid(), family_id))
      )
    )
  );

-- Only project creators or family admins can manage history
CREATE POLICY "Project history: manage access"
  ON project_history
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id = project_id 
      AND (
        created_by = auth.uid() OR
        (family_id IS NOT NULL AND is_family_admin(auth.uid(), family_id))
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id = project_id 
      AND (
        created_by = auth.uid() OR
        (family_id IS NOT NULL AND is_family_admin(auth.uid(), family_id))
      )
    )
  );

-- =====================================================
-- 6. CREATE UPDATED_AT TRIGGERS FOR NEW TABLES
-- =====================================================

-- Create triggers for updated_at columns if they don't exist
DO $$
BEGIN
  -- Budgets trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_budgets_updated_at'
  ) THEN
    CREATE TRIGGER update_budgets_updated_at
      BEFORE UPDATE ON budgets
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Transactions trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_transactions_updated_at'
  ) THEN
    CREATE TRIGGER update_transactions_updated_at
      BEFORE UPDATE ON transactions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Projects trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_projects_updated_at'
  ) THEN
    CREATE TRIGGER update_projects_updated_at
      BEFORE UPDATE ON projects
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =====================================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_budgets_created_by ON budgets(created_by);
CREATE INDEX IF NOT EXISTS idx_budgets_family_id ON budgets(family_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_by ON transactions(created_by);
CREATE INDEX IF NOT EXISTS idx_transactions_family_id ON transactions(family_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_family_id ON projects(family_id);
CREATE INDEX IF NOT EXISTS idx_project_participants_project_id ON project_participants(project_id);
CREATE INDEX IF NOT EXISTS idx_project_participants_user_id ON project_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_project_history_project_id ON project_history(project_id);

-- =====================================================
-- 8. VERIFICATION QUERIES (COMMENTED OUT)
-- =====================================================

/*
-- Test the helper functions (uncomment to test)
-- SELECT is_user_in_family(auth.uid(), 'some-family-id');
-- SELECT is_family_admin(auth.uid(), 'some-family-id');

-- Test RLS policies by trying to select from tables
-- SELECT * FROM families;
-- SELECT * FROM family_members;
-- SELECT * FROM budgets;
-- SELECT * FROM transactions;
-- SELECT * FROM projects;
*/