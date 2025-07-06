export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          family_id: string | null;
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
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          family_id?: string | null;
          preferred_currency?: string;
          preferred_language?: string;
          theme?: string;
          app_lock_enabled?: boolean;
          biometric_enabled?: boolean;
          auto_lock_minutes?: number;
          security_notifications?: boolean;
          login_notifications?: boolean;
          suspicious_activity_alerts?: boolean;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          family_id?: string | null;
          preferred_currency?: string;
          preferred_language?: string;
          theme?: string;
          app_lock_enabled?: boolean;
          biometric_enabled?: boolean;
          auto_lock_minutes?: number;
          security_notifications?: boolean;
          login_notifications?: boolean;
          suspicious_activity_alerts?: boolean;
        };
      };
      families: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          created_by: string;
        };
        Update: {
          name?: string;
          description?: string | null;
        };
      };
      family_members: {
        Row: {
          id: string;
          family_id: string;
          user_id: string;
          role: 'admin' | 'member';
          joined_at: string;
        };
        Insert: {
          family_id: string;
          user_id: string;
          role: 'admin' | 'member';
        };
        Update: {
          role?: 'admin' | 'member';
        };
      };
      transactions: {
        Row: {
          id: string;
          family_id: string;
          user_id: string;
          title: string;
          amount: number;
          category: string;
          date: string;
          type: 'income' | 'expense';
          currency: string;
          status: 'completed' | 'pending' | 'overdue' | 'someday';
          description: string | null;
          tags: string[] | null;
          recurring_pattern_id: string | null;
          generated_from_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          family_id: string;
          user_id: string;
          title: string;
          amount: number;
          category: string;
          date: string;
          type: 'income' | 'expense';
          currency?: string;
          status?: 'completed' | 'pending' | 'overdue' | 'someday';
          description?: string | null;
          tags?: string[] | null;
          recurring_pattern_id?: string | null;
          generated_from_id?: string | null;
        };
        Update: {
          title?: string;
          amount?: number;
          category?: string;
          date?: string;
          type?: 'income' | 'expense';
          currency?: string;
          status?: 'completed' | 'pending' | 'overdue' | 'someday';
          description?: string | null;
          tags?: string[] | null;
        };
      };
      recurring_patterns: {
        Row: {
          id: string;
          family_id: string;
          user_id: string;
          title: string;
          amount: number;
          category: string;
          type: 'income' | 'expense';
          currency: string;
          description: string | null;
          tags: string[] | null;
          recurrence_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
          recurrence_interval: number;
          start_date: string;
          end_date: string | null;
          next_occurrence_date: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          family_id: string;
          user_id: string;
          title: string;
          amount: number;
          category: string;
          type: 'income' | 'expense';
          currency?: string;
          description?: string | null;
          tags?: string[] | null;
          recurrence_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
          recurrence_interval?: number;
          start_date: string;
          end_date?: string | null;
          next_occurrence_date: string;
          is_active?: boolean;
        };
        Update: {
          title?: string;
          amount?: number;
          category?: string;
          type?: 'income' | 'expense';
          currency?: string;
          description?: string | null;
          tags?: string[] | null;
          recurrence_type?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
          recurrence_interval?: number;
          start_date?: string;
          end_date?: string | null;
          next_occurrence_date?: string;
          is_active?: boolean;
        };
      };
      budgets: {
        Row: {
          id: string;
          family_id: string;
          user_id: string;
          name: string;
          description: string | null;
          amount: number;
          currency: string;
          category: string;
          period: 'monthly' | 'quarterly' | 'yearly';
          start_date: string;
          end_date: string;
          assigned_to: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          family_id: string;
          user_id: string;
          name: string;
          description?: string | null;
          amount: number;
          currency?: string;
          category: string;
          period: 'monthly' | 'quarterly' | 'yearly';
          start_date: string;
          end_date: string;
          assigned_to?: string;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          description?: string | null;
          amount?: number;
          currency?: string;
          category?: string;
          period?: 'monthly' | 'quarterly' | 'yearly';
          start_date?: string;
          end_date?: string;
          assigned_to?: string;
          is_active?: boolean;
        };
      };
      financial_projects: {
        Row: {
          id: string;
          family_id: string;
          user_id: string;
          title: string;
          description: string | null;
          target_amount: number;
          current_amount: number;
          currency: string;
          category: string;
          due_date: string | null;
          assigned_to: string;
          status: 'active' | 'completed' | 'paused';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          family_id: string;
          user_id: string;
          title: string;
          description?: string | null;
          target_amount: number;
          current_amount?: number;
          currency?: string;
          category: string;
          due_date?: string | null;
          assigned_to?: string;
          status?: 'active' | 'completed' | 'paused';
        };
        Update: {
          title?: string;
          description?: string | null;
          target_amount?: number;
          current_amount?: number;
          currency?: string;
          category?: string;
          due_date?: string | null;
          assigned_to?: string;
          status?: 'active' | 'completed' | 'paused';
        };
      };
      project_participants: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          contribution: number;
        };
        Insert: {
          project_id: string;
          user_id: string;
          contribution?: number;
        };
        Update: {
          contribution?: number;
        };
      };
    };
  };
}