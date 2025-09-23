import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mnleoicmyvyjmhuoxthi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ubGVvaWNteXZ5am1odW94dGhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MjgwOTQsImV4cCI6MjA2NzQwNDA5NH0.-gtNDXqvDLlzEYttFY3ehbCvqAFjqqLkT8ZanLs7fIk' // Du musst deinen echten anon key hier einfügen

export const supabase = createClient(supabaseUrl, supabaseKey)

// Type für die Database
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

declare global {
  interface Window {
    supabase: typeof supabase;
  }
}

// Mach supabase global verfügbar für debugging
if (typeof window !== 'undefined') {
  window.supabase = supabase;
}