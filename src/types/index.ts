export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  currency: 'EUR' | 'USD' | 'CHF';
  status: 'completed' | 'pending' | 'overdue' | 'someday';
  description?: string;
  tags?: string[];
  family_id?: string;
  user_id?: string;
  recurring_pattern_id?: string;
  generated_from_id?: string;
}

export interface RecurringPattern {
  id: string;
  family_id: string;
  user_id: string;
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  currency: string;
  description?: string;
  tags?: string[];
  recurrence_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  recurrence_interval: number;
  start_date: string;
  end_date?: string;
  next_occurrence_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  family_id: string;
  user_id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  category: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
  assigned_to: string; // 'household' or user_id
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  family_id?: string;
  preferred_currency: string;
  preferred_language: string;
  theme: string;
  app_lock_enabled: boolean;
  biometric_enabled: boolean;
  auto_lock_minutes: number;
  security_notifications: boolean;
  login_notifications: boolean;
  suspicious_activity_alerts: boolean;
  created_at: string;
  updated_at: string;
}

export interface Family {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  profile?: Profile;
}

export interface FinancialProject {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  dueDate: string;
  status: 'active' | 'completed' | 'paused';
  category: string;
  currency: 'EUR' | 'USD' | 'CHF';
  family_id?: string;
  user_id?: string;
  assigned_to?: string;
  participants?: Participant[];
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  contribution: number;
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
    q1: number;
    q2: number;
    q3: number;
    q4: number;
  };
  total: number;
}