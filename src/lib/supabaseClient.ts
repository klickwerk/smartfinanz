import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL and Anon Key are required. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for our Supabase Database
export type Database = {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string
          title: string
          amount: number
          category: string
          date: string | null
          type: string
          currency: string
          status: string
          description: string | null
          tags: string[] | null
          assigned_to: string | null
          created_by: string
          family_id: string | null
          recurrence: string | null
          completed_date: string | null
          generated_from: string | null
          is_budget_transaction: boolean
          budget_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          amount: number
          category: string
          date?: string | null
          type: string
          currency?: string
          status?: string
          description?: string | null
          tags?: string[] | null
          assigned_to?: string | null
          created_by: string
          family_id?: string | null
          recurrence?: string | null
          completed_date?: string | null
          generated_from?: string | null
          is_budget_transaction?: boolean
          budget_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          amount?: number
          category?: string
          date?: string | null
          type?: string
          currency?: string
          status?: string
          description?: string | null
          tags?: string[] | null
          assigned_to?: string | null
          created_by?: string
          family_id?: string | null
          recurrence?: string | null
          completed_date?: string | null
          generated_from?: string | null
          is_budget_transaction?: boolean
          budget_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string
          target_amount: number
          current_amount: number
          due_date: string
          status: string
          category: string
          currency: string
          family_id: string | null
          created_by: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          target_amount: number
          current_amount?: number
          due_date: string
          status?: string
          category: string
          currency?: string
          family_id?: string | null
          created_by: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          target_amount?: number
          current_amount?: number
          due_date?: string
          status?: string
          category?: string
          currency?: string
          family_id?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      project_participants: {
        Row: {
          id: string
          project_id: string
          user_id: string
          contribution: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          contribution?: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          contribution?: number
          created_at?: string
          updated_at?: string | null
        }
      }
      families: {
        Row: {
          id: string
          name: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      family_members: {
        Row: {
          id: string
          family_id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          user_id: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          user_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Make supabase globally available for debugging
declare global {
  interface Window {
    supabase: typeof supabase;
  }
}

if (typeof window !== 'undefined') {
  window.supabase = supabase;
}