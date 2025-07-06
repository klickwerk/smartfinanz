import { Budget } from '../types';
import { supabase } from '../lib/supabaseClient';

/**
 * Service class for managing budget-related business logic
 * Encapsulates all budget operations and state management with Supabase integration
 */
export class BudgetService {
  private budgets: Budget[] = [];

  constructor() {
    // No longer initialize with mock data
  }

  // Getters
  getBudgets(): Budget[] {
    return [...this.budgets];
  }

  // Supabase data fetching
  async fetchBudgets(userId: string): Promise<Budget[]> {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching budgets:', error);
        return [];
      }

      // Transform Supabase data to our Budget type
      const budgets: Budget[] = (data || []).map(row => ({
        id: row.id,
        name: row.name,
        category: row.category,
        budgetedAmount: row.budgeted_amount,
        spentAmount: row.spent_amount || 0,
        startDate: row.start_date,
        endDate: row.end_date,
        recurrence: row.recurrence,
        assignedTo: row.assigned_to,
        familyId: row.family_id,
        createdBy: row.created_by,
        color: row.color,
        description: row.description,
        isActive: row.is_active !== false // Default to true if null
      }));

      this.budgets = budgets;
      return budgets;
    } catch (error) {
      console.error('Error in fetchBudgets:', error);
      return [];
    }
  }

  // Core budget operations with Supabase
  async addBudget(newBudget: Omit<Budget, 'id'>, userId: string): Promise<Budget | null> {
    try {
      const budgetData = {
        name: newBudget.name?.trim(),
        category: newBudget.category?.trim(),
        budgeted_amount: Number(newBudget.budgetedAmount),
        spent_amount: Number(newBudget.spentAmount || 0),
        start_date: newBudget.startDate || null,
        end_date: newBudget.endDate || null,
        recurrence: newBudget.recurrence || 'monthly',
        assigned_to: newBudget.assignedTo || null,
        family_id: newBudget.familyId || null,
        created_by: userId,
        color: newBudget.color || 'from-blue-500 to-blue-400',
        description: newBudget.description?.trim() || null,
        is_active: newBudget.isActive !== false // Default to true
      };

      const { data, error } = await supabase
        .from('budgets')
        .insert([budgetData])
        .select()
        .single();

      if (error) {
        console.error('Error adding budget:', error);
        return null;
      }

      const budget: Budget = {
        id: data.id,
        name: data.name,
        category: data.category,
        budgetedAmount: data.budgeted_amount,
        spentAmount: data.spent_amount || 0,
        startDate: data.start_date,
        endDate: data.end_date,
        recurrence: data.recurrence,
        assignedTo: data.assigned_to,
        familyId: data.family_id,
        createdBy: data.created_by,
        color: data.color,
        description: data.description,
        isActive: data.is_active !== false
      };

      this.budgets = [budget, ...this.budgets];
      return budget;
    } catch (error) {
      console.error('Error in addBudget:', error);
      return null;
    }
  }

  async updateBudget(budgetId: string, updatedBudget: Omit<Budget, 'id'>, userId: string): Promise<boolean> {
    try {
      const updateData = {
        name: updatedBudget.name?.trim(),
        category: updatedBudget.category?.trim(),
        budgeted_amount: Number(updatedBudget.budgetedAmount),
        spent_amount: Number(updatedBudget.spentAmount || 0),
        start_date: updatedBudget.startDate || null,
        end_date: updatedBudget.endDate || null,
        recurrence: updatedBudget.recurrence || 'monthly',
        assigned_to: updatedBudget.assignedTo || null,
        family_id: updatedBudget.familyId || null,
        color: updatedBudget.color || 'from-blue-500 to-blue-400',
        description: updatedBudget.description?.trim() || null,
        is_active: updatedBudget.isActive
      };

      const { error } = await supabase
        .from('budgets')
        .update(updateData)
        .eq('id', budgetId)
        .eq('created_by', userId); // Ensure user can only update their own budgets

      if (error) {
        console.error('Error updating budget:', error);
        return false;
      }

      // Update local state
      const index = this.budgets.findIndex(b => b.id === budgetId);
      if (index !== -1) {
        this.budgets[index] = { ...updatedBudget, id: budgetId };
      }

      return true;
    } catch (error) {
      console.error('Error in updateBudget:', error);
      return false;
    }
  }

  async deleteBudget(budgetId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId)
        .eq('created_by', userId); // Ensure user can only delete their own budgets

      if (error) {
        console.error('Error deleting budget:', error);
        return false;
      }

      // Update local state
      this.budgets = this.budgets.filter(b => b.id !== budgetId);
      return true;
    } catch (error) {
      console.error('Error in deleteBudget:', error);
      return false;
    }
  }

  // Budget-specific operations
  async addSpentToBudget(budgetId: string, amount: number, userId: string): Promise<boolean> {
    const budget = this.budgets.find(b => b.id === budgetId);
    if (!budget) return false;

    const updatedBudget = {
      ...budget,
      spentAmount: budget.spentAmount + amount
    };

    return await this.updateBudget(budgetId, updatedBudget, userId);
  }

  async toggleBudgetActive(budgetId: string, userId: string): Promise<boolean> {
    const budget = this.budgets.find(b => b.id === budgetId);
    if (!budget) return false;

    const updatedBudget = {
      ...budget,
      isActive: !budget.isActive
    };

    return await this.updateBudget(budgetId, updatedBudget, userId);
  }

  // Bulk operations
  setBudgets(budgets: Budget[]): void {
    this.budgets = [...budgets];
  }

  // Reset service state
  reset(): void {
    this.budgets = [];
  }
}

// Create and export a singleton instance
export const budgetService = new BudgetService();