import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/formatUtils';

interface MonthlyOverviewCardProps {
  monthlyData: {
    income: number;
    expenses: number;
    balance: number;
  };
}

export const MonthlyOverviewCard: React.FC<MonthlyOverviewCardProps> = ({ monthlyData }) => {
  const { displayCurrency } = useCurrency();
  const currentMonth = new Date().toLocaleDateString('de-AT', { month: 'short' });
  const isPositive = monthlyData.balance >= 0;

  // Calculate progress through the month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const totalDaysInMonth = endOfMonth.getDate();
  const daysPassed = now.getDate();
  const daysRemaining = totalDaysInMonth - daysPassed;
  const monthProgress = (daysPassed / totalDaysInMonth) * 100;

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-turquoise-500/10 rounded-xl">
            <DollarSign className="w-5 h-5 text-turquoise-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Dieser Monat</h3>
            <p className="text-white/60 text-sm">{currentMonth} 2025</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
          <span className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{formatCurrency(monthlyData.balance, displayCurrency.value)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-white/60 text-sm mb-1">Einkommen</p>
          <p className="text-green-400 font-bold text-lg">{formatCurrency(monthlyData.income, displayCurrency.value)}</p>
        </div>
        <div className="text-center">
          <p className="text-white/60 text-sm mb-1">Ausgaben</p>
          <p className="text-red-400 font-bold text-lg">{formatCurrency(monthlyData.expenses, displayCurrency.value)}</p>
        </div>
        <div className="text-center">
          <p className="text-white/60 text-sm mb-1">Überschuss</p>
          <p className="text-turquoise-400 font-bold text-lg">{formatCurrency(monthlyData.balance, displayCurrency.value)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Monatsfortschritt</span>
          <span className="text-turquoise-400 font-medium">
            noch {daysRemaining} Tage
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-turquoise-500 to-turquoise-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(monthProgress, 100)}%` }}
          />
        </div>
      </div>
    </GlassCard>
  );
};