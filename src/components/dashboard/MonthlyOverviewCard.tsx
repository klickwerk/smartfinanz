import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

interface MonthlyOverviewCardProps {
  monthlyData: MonthlyData;
}

export const MonthlyOverviewCard: React.FC<MonthlyOverviewCardProps> = ({ monthlyData }) => {
  // Mock previous month data for comparison (in a real app, you'd calculate this from transactions)
  const previousBalance = 1000; // This would come from previous month's transactions
  const balanceChange = monthlyData.balance - previousBalance;
  const isPositive = balanceChange >= 0;

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-turquoise-500/10 rounded-xl">
            <DollarSign className="w-5 h-5 text-turquoise-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Dieser Monat</h3>
            <p className="text-white/60 text-sm">{monthlyData.month} 2025</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
          <span className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}€{balanceChange.toLocaleString('de-AT')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-white/60 text-sm mb-1">Einkommen</p>
          <p className="text-green-400 font-bold text-lg">€{monthlyData.income.toLocaleString('de-AT')}</p>
        </div>
        <div className="text-center">
          <p className="text-white/60 text-sm mb-1">Ausgaben</p>
          <p className="text-red-400 font-bold text-lg">€{monthlyData.expenses.toLocaleString('de-AT')}</p>
        </div>
        <div className="text-center">
          <p className="text-white/60 text-sm mb-1">Saldo</p>
          <p className="text-turquoise-400 font-bold text-lg">€{monthlyData.balance.toLocaleString('de-AT')}</p>
        </div>
      </div>

      {monthlyData.income > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Fortschritt</span>
            <span className="text-turquoise-400 font-medium">
              {Math.round((monthlyData.balance / monthlyData.income) * 100)}% gespart
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-turquoise-500 to-turquoise-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(Math.max((monthlyData.balance / monthlyData.income) * 100, 0), 100)}%` }}
            />
          </div>
        </div>
      )}
    </GlassCard>
  );
};