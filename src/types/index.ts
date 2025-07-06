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
  currency: 'EUR' | 'USD' | 'CHF';
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