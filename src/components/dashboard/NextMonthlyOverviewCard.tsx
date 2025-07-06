import React from 'react';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { MonthlyData } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/formatUtils';

interface NextMonthlyOverviewCardProps {
  nextMonthData: MonthlyData;
}

export const NextMonthlyOverviewCard: React.FC<NextMonthlyOverviewCardProps> = ({ nextMonthData }) => {
  const { displayCurrency } = useCurrency();
  const currentMonth = new Date().getMonth();
  const nextMonth = new Date(new Date().setMonth(currentMonth + 1));
  const daysUntilNextMonth = Math.ceil((nextMonth.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  // Calculate planning percentage dynamically - percentage of income that is planned for expenses
  const plannedPercentage = nextMonthData.income > 0 
    ? Math.min(Math.round((nextMonthData.expenses / nextMonthData.income) * 100), 100)
    : 0;

  return (
    <GlassCard className="border-blue-500/20 bg-blue-500/5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Nächster Monat</h3>
            <p className="text-white/60 text-sm">{nextMonthData.month} 2025</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">
            in {daysUntilNextMonth} Tagen
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-white/60 text-sm mb-1">Geplant</p>
          <p className="text-green-400 font-bold text-lg">{formatCurrency(nextMonthData.income, displayCurrency.value)}</p>
        </div>
        <div className="text-center">
          <p className="text-white/60 text-sm mb-1">Geplante Ausgaben</p>
          <p className="text-red-400 font-bold text-lg">{formatCurrency(nextMonthData.expenses, displayCurrency.value)}</p>
        </div>
        <div className="text-center">
          <p className="text-white/60 text-sm mb-1">Erwarteter Überschuss</p>
          <p className="text-blue-400 font-bold text-lg">{formatCurrency(nextMonthData.balance, displayCurrency.value)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Planungsstand</span>
          <span className="text-blue-400 font-medium">{plannedPercentage}% des Einkommens ist verplant</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${plannedPercentage}%` }}
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-sm text-blue-400">
          <TrendingUp className="w-4 h-4" />
          <span>+15% mehr als dieser Monat geplant</span>
        </div>
      </div>
    </GlassCard>
  );
};