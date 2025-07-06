export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  currency: string; // Changed from fixed union to string to support all currencies
  status: 'completed' | 'pending' | 'overdue' | 'someday';
  description?: string;
  tags?: string[];
  assignedTo?: string; // User who created/is responsible for this transaction
  createdBy?: string; // User ID who created this transaction
  familyId?: string; // Family/group this transaction belongs to
  recurrence?: 'none' | 'monthly' | 'quarterly' | 'yearly'; // New: Recurrence pattern
  completedDate?: string; // New: Date when transaction was marked as completed
  generatedFrom?: string; // New: ID of the original transaction if this is a generated recurring transaction
  isBudgetTransaction?: boolean; // New: Flag to identify transactions created from budgets
  budgetId?: string; // New: Reference to the original budget ID for budget transactions
}

export interface Budget {
  id: string;
  name: string;
  category: string;
  budgetedAmount: number;
  spentAmount: number;
  startDate: string;
  endDate: string;
  recurrence: 'monthly' | 'quarterly' | 'yearly';
  assignedTo?: string;
  familyId?: string;
  createdBy?: string;
  color: string;
  description?: string;
  isActive: boolean;
}

export interface ProjectHistoryEntry {
  id: string;
  date: string;
  amount: number;
  contributorId: string;
  contributorName: string;
  type: 'deposit' | 'withdrawal' | 'milestone';
  description?: string;
}

export interface FinancialProject {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  dueDate: string;
  participants: Participant[];
  status: 'active' | 'completed' | 'paused';
  category: string;
  currency: string; // Changed from fixed union to string to support all currencies
  familyId?: string; // Family/group this project belongs to
  createdBy?: string; // User ID who created this project
  history: ProjectHistoryEntry[]; // New: History of all contributions and changes
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  contribution: number;
}

// New: Grouped transaction for yearly overview
export interface GroupedYearlyTransaction {
  id: string; // Unique identifier for the group
  title: string; // Display title for the group
  category: string;
  type: 'income' | 'expense';
  totalAmount: number; // Sum of all transactions in this group
  transactionCount: number; // Number of transactions in this group
  recurrence?: string; // Recurrence pattern if applicable
  assignedTo?: string;
  isBudgetGroup?: boolean; // True if this is a budget-based group
  budgetId?: string; // Reference to budget if applicable
  transactions: Transaction[]; // All individual transactions in this group
  description?: string; // Group description
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface YearlyData {
  year: number;
  quarters: {
    q1: { income: number; expenses: number };
    q2: { income: number; expenses: number };
    q3: { income: number; expenses: number };
    q4: { income: number; expenses: number };
  };
  total: number;
  totalIncome: number;
  totalExpenses: number;
  groupedTransactions: GroupedYearlyTransaction[]; // New: Grouped transactions for detailed view
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  familyId?: string;
  role: UserRole; // New: User role for permissions
}

export interface Family {
  id: string;
  name: string;
  members: User[];
  createdBy: string;
  createdAt: string;
}

// New: User roles for permission system
export type UserRole = 'admin' | 'member' | 'viewer';

// New: Permission types
export interface Permission {
  resource: 'transactions' | 'budgets' | 'projects' | 'family' | 'settings';
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

// New: Role permissions mapping
export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}