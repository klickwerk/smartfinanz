import { Transaction, Budget, FinancialProject, GroupedYearlyTransaction } from '../types';
import { supabase } from '../lib/supabaseClient';

/**
 * Service class for managing transaction-related business logic
 * Encapsulates all transaction operations and state management with Supabase integration
 */
export class TransactionService {
  private transactions: Transaction[] = [];
  private completedGeneratedIds: Set<string> = new Set();

  constructor() {
    // No longer initialize with mock data
  }

  // Getters
  getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  getCompletedGeneratedIds(): Set<string> {
    return new Set(this.completedGeneratedIds);
  }

  // Supabase data fetching
  async fetchTransactions(userId: string): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }

      // Transform Supabase data to our Transaction type
      const transactions: Transaction[] = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        amount: row.amount,
        category: row.category,
        date: row.date,
        type: row.type,
        currency: row.currency || 'EUR',
        status: row.status || 'pending',
        description: row.description,
        tags: row.tags || [],
        assignedTo: row.assigned_to,
        recurrence: row.recurrence || 'none',
        completedDate: row.completed_date,
        generatedFrom: row.generated_from,
        isBudgetTransaction: row.is_budget_transaction || false,
        budgetId: row.budget_id,
        createdBy: row.created_by,
        familyId: row.family_id
      }));

      this.transactions = transactions;
      return transactions;
    } catch (error) {
      console.error('Error in fetchTransactions:', error);
      return [];
    }
  }

  // Core transaction operations with Supabase
  async addTransaction(newTransaction: Omit<Transaction, 'id'>, userId: string): Promise<Transaction | null> {
    try {
      const transactionData = {
        title: newTransaction.title?.trim(),
        amount: Number(newTransaction.amount),
        category: newTransaction.category?.trim(),
        date: newTransaction.date || null,
        type: newTransaction.type || 'expense',
        currency: newTransaction.currency?.trim() || 'EUR',
        status: newTransaction.status || 'pending',
        description: newTransaction.description?.trim() || null,
        tags: Array.isArray(newTransaction.tags) ? newTransaction.tags : [],
        assigned_to: newTransaction.assignedTo || null,
        recurrence: newTransaction.recurrence || 'none',
        completed_date: newTransaction.completedDate || null,
        generated_from: newTransaction.generatedFrom || null,
        is_budget_transaction: Boolean(newTransaction.isBudgetTransaction),
        budget_id: newTransaction.budgetId || null,
        created_by: userId,
        family_id: newTransaction.familyId || null
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) {
        console.error('Error adding transaction:', error);
        return null;
      }

      const transaction: Transaction = {
        id: data.id,
        title: data.title,
        amount: data.amount,
        category: data.category,
        date: data.date,
        type: data.type,
        currency: data.currency,
        status: data.status,
        description: data.description,
        tags: data.tags || [],
        assignedTo: data.assigned_to,
        recurrence: data.recurrence,
        completedDate: data.completed_date,
        generatedFrom: data.generated_from,
        isBudgetTransaction: data.is_budget_transaction,
        budgetId: data.budget_id,
        createdBy: data.created_by,
        familyId: data.family_id
      };

      this.transactions = [transaction, ...this.transactions];
      return transaction;
    } catch (error) {
      console.error('Error in addTransaction:', error);
      return null;
    }
  }

  async updateTransaction(transactionId: string, updatedTransaction: Omit<Transaction, 'id'>, userId: string): Promise<boolean> {
    try {
      const updateData = {
        title: updatedTransaction.title,
        amount: updatedTransaction.amount,
        category: updatedTransaction.category,
        date: updatedTransaction.date,
        type: updatedTransaction.type,
        currency: updatedTransaction.currency,
        status: updatedTransaction.status,
        description: updatedTransaction.description,
        tags: updatedTransaction.tags || [],
        assigned_to: updatedTransaction.assignedTo,
        recurrence: updatedTransaction.recurrence,
        completed_date: updatedTransaction.completedDate,
        generated_from: updatedTransaction.generatedFrom,
        is_budget_transaction: updatedTransaction.isBudgetTransaction,
        budget_id: updatedTransaction.budgetId
      };

      const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transactionId)
        .eq('created_by', userId); // Ensure user can only update their own transactions

      if (error) {
        console.error('Error updating transaction:', error);
        return false;
      }

      // Update local state
      const index = this.transactions.findIndex(t => t.id === transactionId);
      if (index !== -1) {
        this.transactions[index] = { ...updatedTransaction, id: transactionId };
      }

      return true;
    } catch (error) {
      console.error('Error in updateTransaction:', error);
      return false;
    }
  }

  async deleteTransaction(transactionId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('created_by', userId); // Ensure user can only delete their own transactions

      if (error) {
        console.error('Error deleting transaction:', error);
        return false;
      }

      // Update local state
      this.transactions = this.transactions.filter(t => t.id !== transactionId);
      return true;
    } catch (error) {
      console.error('Error in deleteTransaction:', error);
      return false;
    }
  }

  // Transaction editing logic
  getEditableTransaction(transaction: Transaction): Transaction | null {
    // Only allow editing of original transactions, not generated ones or budget transactions
    if (transaction.isBudgetTransaction) {
      // Don't edit budget transactions directly
      return null;
    }
    
    if (transaction.generatedFrom) {
      // Find the original transaction
      const originalTransaction = this.transactions.find(t => t.id === transaction.generatedFrom);
      return originalTransaction || null;
    } else {
      return transaction;
    }
  }

  // Completion status management
  markCompleted(transactionId: string, completedDate: string, allTransactions: Transaction[]): boolean {
    const transaction = allTransactions.find(t => t.id === transactionId);
    
    if (!transaction) return false;
    
    if (transaction.generatedFrom) {
      // For generated recurring transactions, add to completed set
      this.completedGeneratedIds.add(transactionId);
      return true;
    } else {
      // For original transactions, update the transaction status
      // Note: This will be handled by updateTransaction method for database sync
      return true;
    }
  }

  unmarkCompleted(transactionId: string, allTransactions: Transaction[]): boolean {
    const transaction = allTransactions.find(t => t.id === transactionId);
    
    if (!transaction) return false;
    
    if (transaction.generatedFrom) {
      // For generated recurring transactions, remove from completed set
      this.completedGeneratedIds.delete(transactionId);
      return true;
    } else {
      // For original transactions, update the transaction status back to pending/overdue
      // Note: This will be handled by updateTransaction method for database sync
      return true;
    }
  }

  // Status determination
  getEffectiveStatus(transaction: Transaction): Transaction['status'] {
    // Budget transactions should never be marked as completed individually
    if (transaction.isBudgetTransaction) {
      return 'pending';
    }

    // Check if this generated transaction is marked as completed
    if (transaction.generatedFrom && this.completedGeneratedIds.has(transaction.id)) {
      return 'completed';
    }

    // If already completed or someday, return as is
    if (transaction.status === 'completed' || transaction.status === 'someday') {
      return transaction.status;
    }

    // If no date is set, treat as someday
    if (!transaction.date) {
      return 'someday';
    }

    // Ensure consistent date handling by using local time
    const transactionDate = new Date(`${transaction.date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    // If the transaction date is in the past and it's pending, mark as overdue
    if (transactionDate < today && transaction.status === 'pending') {
      return 'overdue';
    }

    return transaction.status;
  }

  // Budget to transaction conversion
  convertBudgetToTransaction(budget: Budget): Transaction {
    return {
      id: `${budget.id}_budget_tx`,
      title: `Budget: ${budget.name}`,
      amount: -Math.abs(budget.budgetedAmount), // Always negative for expenses
      category: budget.category,
      date: budget.startDate,
      type: 'expense',
      currency: 'EUR',
      status: 'pending',
      assignedTo: budget.assignedTo,
      recurrence: budget.recurrence,
      isBudgetTransaction: true,
      budgetId: budget.id,
      tags: ['Budget'],
      description: budget.description ? `Budget-Zuteilung: ${budget.description}` : `Monatliche Budget-Zuteilung für ${budget.name}`
    };
  }

  // Future transaction generation
  generateFutureTransactions(
    originalTransactions: Transaction[],
    currentYear: number,
    numYearsAhead: number = 2
  ): Transaction[] {
    const generatedTransactions: Transaction[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    originalTransactions.forEach(transaction => {
      // Skip if no recurrence or if it's a generated transaction itself
      if (!transaction.recurrence || transaction.recurrence === 'none' || transaction.generatedFrom) {
        return;
      }

      // Skip if no date is set
      if (!transaction.date) {
        return;
      }

      // Ensure consistent date handling by using local time
      const originalDate = new Date(`${transaction.date}T00:00:00`);
      const endYear = currentYear + numYearsAhead;

      // Generate recurring instances
      for (let year = currentYear; year <= endYear; year++) {
        let instances: Date[] = [];

        switch (transaction.recurrence) {
          case 'monthly':
            // Generate monthly instances for each year
            for (let month = 0; month < 12; month++) {
              // For current year, only generate instances for current month and future months
              if (year === currentYear && month < today.getMonth()) {
                continue;
              }

              const day = originalDate.getDate();
              // Handle edge cases like 31st in months with fewer days
              const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
              const adjustedDay = Math.min(day, lastDayOfMonth);
              const instanceDate = new Date(year, month, adjustedDay);
              
              // Only add if it's not the original date and it's in the future
              if (instanceDate.getTime() > originalDate.getTime() && instanceDate >= today) {
                instances.push(instanceDate);
              }
            }
            break;

          case 'quarterly':
            // Determine the quarter month pattern based on original date
            const originalMonth = originalDate.getMonth();
            const quarterOffset = originalMonth % 3; // 0, 1, or 2
            
            // Generate quarterly instances
            for (let quarter = 0; quarter < 4; quarter++) {
              const month = quarter * 3 + quarterOffset;
              
              // For current year, only generate instances for current quarter and future quarters
              if (year === currentYear && month < today.getMonth()) {
                continue;
              }

              const day = originalDate.getDate();
              // Handle edge cases like 31st in months with fewer days
              const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
              const adjustedDay = Math.min(day, lastDayOfMonth);
              const instanceDate = new Date(year, month, adjustedDay);
              
              // Only add if it's not the original date and it's in the future
              if (instanceDate.getTime() > originalDate.getTime() && instanceDate >= today) {
                instances.push(instanceDate);
              }
            }
            break;

          case 'yearly':
            // Generate yearly instances
            const yearlyDate = new Date(year, originalDate.getMonth(), originalDate.getDate());
            
            // Only add if it's not the original date and it's in the future
            if (yearlyDate.getTime() > originalDate.getTime() && yearlyDate >= today) {
              instances.push(yearlyDate);
            }
            break;
        }

        // Create transaction objects for each instance
        instances.forEach((instanceDate) => {
          const generatedTransaction: Transaction = {
            ...transaction,
            id: `${transaction.id}_${transaction.recurrence}_${instanceDate.getFullYear()}_${instanceDate.getMonth()}_${instanceDate.getDate()}`,
            date: instanceDate.toISOString().split('T')[0],
            status: 'pending',
            generatedFrom: transaction.id,
            completedDate: undefined // Reset completed date for generated transactions
          };

          generatedTransactions.push(generatedTransaction);
        });
      }
    });

    return generatedTransactions;
  }

  // Generate all transactions including recurring ones and budget transactions
  generateAllTransactions(budgets: Budget[]): Transaction[] {
    const currentYear = new Date().getFullYear();
    
    // Convert active budgets to transactions
    const budgetTransactions = budgets
      .filter(budget => budget.isActive)
      .map(budget => this.convertBudgetToTransaction(budget));
    
    // Combine regular transactions with budget transactions
    const combinedTransactions = [...this.transactions, ...budgetTransactions];
    
    // Generate future recurring transactions for all combined transactions
    const futureTransactions = this.generateFutureTransactions(combinedTransactions, currentYear, 2);
    
    return [...combinedTransactions, ...futureTransactions];
  }

  // Utility functions
  safeNumber(value: any): number {
    const num = Number(value);
    return isNaN(num) || !isFinite(num) ? 0 : num;
  }

  // Calculate yearly data
  calculateYearlyData(
    transactions: Transaction[], 
    year: number
  ): any {
    // Filter transactions for the specified year, excluding completed and someday transactions
    const yearTransactions = transactions.filter(transaction => {
      if (!transaction.date) return false;
      
      const effectiveStatus = this.getEffectiveStatus(transaction);
      if (effectiveStatus === 'completed' || effectiveStatus === 'someday') return false;
      
      // Ensure consistent date handling by using local time
      const transactionDate = new Date(`${transaction.date}T00:00:00`);
      return transactionDate.getFullYear() === year;
    });

    // Initialize quarterly data with separate income and expenses
    const quarters = { 
      q1: { income: 0, expenses: 0 }, 
      q2: { income: 0, expenses: 0 }, 
      q3: { income: 0, expenses: 0 }, 
      q4: { income: 0, expenses: 0 } 
    };

    // Calculate income and expenses for each quarter
    yearTransactions.forEach(transaction => {
      // Ensure consistent date handling by using local time
      const transactionDate = new Date(`${transaction.date}T00:00:00`);
      if (isNaN(transactionDate.getTime())) return; // Skip invalid dates
      
      const month = transactionDate.getMonth(); // 0-11
      
      // Safely handle amount conversion
      const amount = this.safeNumber(transaction.amount);
      const absoluteAmount = Math.abs(amount);
      
      // Skip if amount is 0 or invalid
      if (absoluteAmount === 0) return;

      let quarter: 'q1' | 'q2' | 'q3' | 'q4';
      if (month >= 0 && month <= 2) {
        quarter = 'q1';
      } else if (month >= 3 && month <= 5) {
        quarter = 'q2';
      } else if (month >= 6 && month <= 8) {
        quarter = 'q3';
      } else {
        quarter = 'q4';
      }

      if (transaction.type === 'income') {
        quarters[quarter].income += absoluteAmount;
      } else {
        quarters[quarter].expenses += absoluteAmount;
      }
    });

    // Calculate totals with safe number handling
    const totalIncome = this.safeNumber(
      Object.values(quarters).reduce((sum, q) => sum + this.safeNumber(q.income), 0)
    );
    const totalExpenses = this.safeNumber(
      Object.values(quarters).reduce((sum, q) => sum + this.safeNumber(q.expenses), 0)
    );

    // Generate grouped transactions for detailed view
    const groupedTransactions = this.groupTransactionsForYearlyView(transactions, year);

    return {
      year,
      quarters,
      total: totalIncome - totalExpenses,
      totalIncome,
      totalExpenses,
      groupedTransactions
    };
  }

  // Calculate monthly summary
  calculateMonthlySummary(
    transactions: Transaction[], 
    year: number, 
    month: number
  ): { income: number; expenses: number; balance: number } {
    // Filter transactions for the specified month and year
    const monthTransactions = transactions.filter(transaction => {
      if (!transaction.date) return false;
      
      const effectiveStatus = this.getEffectiveStatus(transaction);
      if (effectiveStatus === 'completed' || effectiveStatus === 'someday') return false;
      
      // Ensure consistent date handling by using local time
      const transactionDate = new Date(`${transaction.date}T00:00:00`);
      return transactionDate.getFullYear() === year && transactionDate.getMonth() === month;
    });

    let income = 0;
    let expenses = 0;

    monthTransactions.forEach(transaction => {
      const amount = this.safeNumber(transaction.amount);
      
      if (transaction.type === 'income') {
        income += Math.abs(amount);
      } else {
        expenses += Math.abs(amount);
      }
    });

    return {
      income: this.safeNumber(income),
      expenses: this.safeNumber(expenses),
      balance: this.safeNumber(income - expenses)
    };
  }

  // Calculate quick stats
  calculateQuickStats(
    transactions: Transaction[],
    projects?: FinancialProject[]
  ): { thisMonthIncome: number; plannedExpenses: number; saved: number; activeSavingGoals: number } {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthSummary = this.calculateMonthlySummary(transactions, currentYear, currentMonth);

    // Calculate active saving goals from projects
    const activeSavingGoals = projects ? projects.filter(p => p.status === 'active').length : 0;

    return {
      thisMonthIncome: this.safeNumber(currentMonthSummary.income),
      plannedExpenses: this.safeNumber(currentMonthSummary.expenses),
      saved: this.safeNumber(currentMonthSummary.balance),
      activeSavingGoals: this.safeNumber(activeSavingGoals)
    };
  }

  // Group transactions for yearly view
  groupTransactionsForYearlyView(
    transactions: Transaction[],
    year: number
  ): GroupedYearlyTransaction[] {
    // Filter transactions for the specified year, excluding completed and someday transactions
    const yearTransactions = transactions.filter(transaction => {
      if (!transaction.date) return false;
      
      const effectiveStatus = this.getEffectiveStatus(transaction);
      if (effectiveStatus === 'completed' || effectiveStatus === 'someday') return false;
      
      // Ensure consistent date handling by using local time
      const transactionDate = new Date(`${transaction.date}T00:00:00`);
      return transactionDate.getFullYear() === year;
    });

    // Group transactions by various criteria
    const groups = new Map<string, Transaction[]>();

    yearTransactions.forEach(transaction => {
      let groupKey: string;

      if (transaction.isBudgetTransaction && transaction.budgetId) {
        // Group budget transactions by budget ID
        groupKey = `budget_${transaction.budgetId}`;
      } else if (transaction.recurrence && transaction.recurrence !== 'none') {
        // Group recurring transactions by original transaction or generated from
        const originalId = transaction.generatedFrom || transaction.id;
        groupKey = `recurring_${originalId}_${transaction.title}_${transaction.category}_${transaction.assignedTo}`;
      } else {
        // Individual transactions get their own group
        groupKey = `individual_${transaction.id}`;
      }

      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(transaction);
    });

    // Convert groups to GroupedYearlyTransaction objects
    const groupedTransactions: GroupedYearlyTransaction[] = [];

    groups.forEach((transactionList, groupKey) => {
      if (transactionList.length === 0) return;

      // Sort transactions by date
      transactionList.sort((a, b) => {
        // Ensure consistent date handling by using local time
        const dateA = new Date(`${a.date}T00:00:00`);
        const dateB = new Date(`${b.date}T00:00:00`);
        return dateA.getTime() - dateB.getTime();
      });

      const firstTransaction = transactionList[0];
      const totalAmount = transactionList.reduce((sum, t) => sum + Math.abs(this.safeNumber(t.amount)), 0);

      let groupTitle: string;
      let groupDescription: string;

      if (firstTransaction.isBudgetTransaction) {
        // Budget group
        groupTitle = firstTransaction.title.replace('Budget: ', '');
        groupDescription = `${transactionList.length}x Budget-Zuteilungen für ${groupTitle}`;
      } else if (firstTransaction.recurrence && firstTransaction.recurrence !== 'none') {
        // Recurring transaction group
        const recurrenceText = this.getRecurrenceDisplayText(firstTransaction.recurrence);
        groupTitle = firstTransaction.title;
        groupDescription = `${transactionList.length}x ${recurrenceText} - ${firstTransaction.category}`;
      } else {
        // Individual transaction
        groupTitle = firstTransaction.title;
        groupDescription = firstTransaction.description || `Einzeltransaktion - ${firstTransaction.category}`;
      }

      const groupedTransaction: GroupedYearlyTransaction = {
        id: groupKey,
        title: groupTitle,
        category: firstTransaction.category,
        type: firstTransaction.type,
        totalAmount: firstTransaction.type === 'expense' ? totalAmount : totalAmount,
        transactionCount: transactionList.length,
        recurrence: firstTransaction.recurrence,
        assignedTo: firstTransaction.assignedTo,
        isBudgetGroup: firstTransaction.isBudgetTransaction,
        budgetId: firstTransaction.budgetId,
        transactions: transactionList,
        description: groupDescription
      };

      groupedTransactions.push(groupedTransaction);
    });

    // Sort groups by total amount (descending) and then by title
    groupedTransactions.sort((a, b) => {
      const amountDiff = b.totalAmount - a.totalAmount;
      if (amountDiff !== 0) return amountDiff;
      return a.title.localeCompare(b.title);
    });

    return groupedTransactions;
  }

  // Helper function to get display text for recurrence
  getRecurrenceDisplayText(recurrence: string): string {
    switch (recurrence) {
      case 'monthly': return 'Monatlich';
      case 'quarterly': return 'Quartalsweise';
      case 'yearly': return 'Jährlich';
      default: return 'Einmalig';
    }
  }

  // Bulk operations
  setTransactions(transactions: Transaction[]): void {
    this.transactions = [...transactions];
  }

  setCompletedGeneratedIds(completedIds: Set<string>): void {
    this.completedGeneratedIds = new Set(completedIds);
  }

  // Reset service state
  reset(): void {
    this.transactions = [];
    this.completedGeneratedIds.clear();
  }
}

// Create and export a singleton instance
export const transactionService = new TransactionService();