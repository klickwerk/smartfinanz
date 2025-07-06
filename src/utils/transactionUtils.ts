import { Transaction, YearlyData, Budget, FinancialProject, GroupedYearlyTransaction } from '../types';
import { transactionService } from '../services/TransactionService';

/**
 * Safely converts a value to a number, returning 0 if invalid
 */
function safeNumber(value: any): number {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? 0 : num;
}

/**
 * Groups transactions for yearly overview to reduce clutter
 */
export function groupTransactionsForYearlyView(
  transactions: Transaction[],
  year: number,
  completedGeneratedIds?: Set<string>
): GroupedYearlyTransaction[] {
  // Filter transactions for the specified year, excluding completed and someday transactions
  const yearTransactions = transactions.filter(transaction => {
    if (!transaction.date) return false;
    
    const effectiveStatus = transactionService.getEffectiveStatus(transaction);
    if (effectiveStatus === 'completed' || effectiveStatus === 'someday') return false;
    
    const transactionDate = new Date(transaction.date);
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
    transactionList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const firstTransaction = transactionList[0];
    const totalAmount = transactionList.reduce((sum, t) => sum + Math.abs(safeNumber(t.amount)), 0);

    let groupTitle: string;
    let groupDescription: string;

    if (firstTransaction.isBudgetTransaction) {
      // Budget group
      groupTitle = firstTransaction.title.replace('Budget: ', '');
      groupDescription = `${transactionList.length}x Budget-Zuteilungen für ${groupTitle}`;
    } else if (firstTransaction.recurrence && firstTransaction.recurrence !== 'none') {
      // Recurring transaction group
      const recurrenceText = getRecurrenceDisplayText(firstTransaction.recurrence);
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

/**
 * Helper function to get display text for recurrence
 */
function getRecurrenceDisplayText(recurrence: string): string {
  switch (recurrence) {
    case 'monthly': return 'Monatlich';
    case 'quarterly': return 'Quartalsweise';
    case 'yearly': return 'Jährlich';
    default: return 'Einmalig';
  }
}

/**
 * Calculates yearly financial data based on transactions with separate income and expenses
 * Now includes grouped transactions for detailed view
 */
export function calculateYearlyData(
  transactions: Transaction[], 
  year: number, 
  completedGeneratedIds?: Set<string>
): YearlyData {
  // Filter transactions for the specified year, excluding completed and someday transactions
  const yearTransactions = transactions.filter(transaction => {
    if (!transaction.date) return false;
    
    const effectiveStatus = transactionService.getEffectiveStatus(transaction);
    if (effectiveStatus === 'completed' || effectiveStatus === 'someday') return false;
    
    const transactionDate = new Date(transaction.date);
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
    // Safely handle date parsing
    const transactionDate = new Date(transaction.date);
    if (isNaN(transactionDate.getTime())) return; // Skip invalid dates
    
    const month = transactionDate.getMonth(); // 0-11
    
    // Safely handle amount conversion
    const amount = safeNumber(transaction.amount);
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
  const totalIncome = safeNumber(
    Object.values(quarters).reduce((sum, q) => sum + safeNumber(q.income), 0)
  );
  const totalExpenses = safeNumber(
    Object.values(quarters).reduce((sum, q) => sum + safeNumber(q.expenses), 0)
  );

  // Generate grouped transactions for detailed view
  const groupedTransactions = groupTransactionsForYearlyView(transactions, year, completedGeneratedIds);

  return {
    year,
    quarters,
    total: totalIncome - totalExpenses,
    totalIncome,
    totalExpenses,
    groupedTransactions
  };
}

/**
 * Calculates monthly summary for a specific month and year
 */
export function calculateMonthlySummary(
  transactions: Transaction[], 
  year: number, 
  month: number, 
  completedGeneratedIds?: Set<string>
): { income: number; expenses: number; balance: number } {
  // Filter transactions for the specified month and year
  const monthTransactions = transactions.filter(transaction => {
    if (!transaction.date) return false;
    
    const effectiveStatus = transactionService.getEffectiveStatus(transaction);
    if (effectiveStatus === 'completed' || effectiveStatus === 'someday') return false;
    
    const transactionDate = new Date(transaction.date);
    return transactionDate.getFullYear() === year && transactionDate.getMonth() === month;
  });

  let income = 0;
  let expenses = 0;

  monthTransactions.forEach(transaction => {
    const amount = safeNumber(transaction.amount);
    
    if (transaction.type === 'income') {
      income += Math.abs(amount);
    } else {
      expenses += Math.abs(amount);
    }
  });

  return {
    income: safeNumber(income),
    expenses: safeNumber(expenses),
    balance: safeNumber(income - expenses)
  };
}

/**
 * Calculates quick stats for the dashboard
 */
export function calculateQuickStats(
  transactions: Transaction[], 
  completedGeneratedIds?: Set<string>,
  projects?: FinancialProject[]
): { thisMonthIncome: number; plannedExpenses: number; saved: number; activeSavingGoals: number } {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthSummary = calculateMonthlySummary(transactions, currentYear, currentMonth, completedGeneratedIds);

  // Calculate active saving goals from projects
  const activeSavingGoals = projects ? projects.filter(p => p.status === 'active').length : 3;

  return {
    thisMonthIncome: safeNumber(currentMonthSummary.income),
    plannedExpenses: safeNumber(currentMonthSummary.expenses),
    saved: safeNumber(currentMonthSummary.balance),
    activeSavingGoals: safeNumber(activeSavingGoals)
  };
}