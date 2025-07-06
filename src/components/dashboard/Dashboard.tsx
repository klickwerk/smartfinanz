import React from 'react';
import { Transaction } from '../../types';
import { useTransactions } from '../../hooks/useTransactions';
import { OverdueItemsCard } from './OverdueItemsCard';
import { MonthlyOverviewCard } from './MonthlyOverviewCard';
import { YearlyProjectionCard } from './YearlyProjectionCard';
import { yearlyData } from '../../data/mockData';

interface DashboardProps {
  transactions: Transaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const { getMonthlyData } = useTransactions();
  const overdueTransactions = transactions.filter(t => t.status === 'overdue');
  const monthlyData = getMonthlyData();

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