import React from 'react';
import { OverdueItemsCard } from './OverdueItemsCard';
import { MonthlyOverviewCard } from './MonthlyOverviewCard';
import { YearlyProjectionCard } from './YearlyProjectionCard';
import { Transaction } from '../../types';

interface DashboardProps {
  transactions: Transaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const overdueTransactions = transactions.filter(t => t.status === 'overdue');
  
  // Calculate monthly data from real transactions
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const currentMonthIncome = currentMonthTransactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const currentMonthExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const monthlyData = {
    month: currentDate.toLocaleDateString('de-AT', { month: 'long' }),
    income: currentMonthIncome,
    expenses: currentMonthExpenses,
    balance: currentMonthIncome - currentMonthExpenses
  };

  // Calculate yearly projection from real data
  const currentYearTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getFullYear() === currentYear;
  });

  // Group by quarters
  const quarters = {
    q1: 0, q2: 0, q3: 0, q4: 0
  };

  currentYearTransactions.forEach(transaction => {
    if (transaction.status !== 'completed') return;
    
    const month = new Date(transaction.date).getMonth();
    const quarter = Math.floor(month / 3);
    const amount = transaction.type === 'income' ? transaction.amount : 0; // Only count income for projection
    
    switch (quarter) {
      case 0: quarters.q1 += amount; break;
      case 1: quarters.q2 += amount; break;
      case 2: quarters.q3 += amount; break;
      case 3: quarters.q4 += amount; break;
    }
  });

  const yearlyData = {
    year: currentYear,
    quarters,
    total: quarters.q1 + quarters.q2 + quarters.q3 + quarters.q4
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Guten Morgen! 👋</h1>
          <p className="text-white/60">Hier ist deine finanzielle Übersicht</p>
        </div>
      </div>

      <div className="space-y-6">
        {overdueTransactions.length > 0 && (
          <OverdueItemsCard overdueTransactions={overdueTransactions} />
        )}
        
        <MonthlyOverviewCard monthlyData={monthlyData} />
        
        <YearlyProjectionCard yearlyData={yearlyData} />
      </div>
    </div>
  );
};