import React from 'react';
import { OverdueItemsCard } from './OverdueItemsCard';
import { MonthlyOverviewCard } from './MonthlyOverviewCard';
import { YearlyProjectionCard } from './YearlyProjectionCard';
import { Transaction } from '../../types';
import { yearlyData } from '../../data/mockData'; // Keep mock yearly data for now

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