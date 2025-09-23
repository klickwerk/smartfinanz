import React from 'react';
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { MonthlyData } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/formatUtils';

interface NextMonthlyOverviewCardProps {
  nextMonthData: MonthlyData;
  currentMonthData: {
    income: number;
    expenses: number;
    balance: number;
  };
}

export const NextMonthlyOverviewCard: React.FC<NextMonthlyOverviewCardProps> = ({ 
  nextMonthData, 
  currentMonthData 
}) => {
  const { displayCurrency } = useCurrency();
  
  // Calculate actual days until next month
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  // Get the first day of next month
  const firstDayOfNextMonth = new Date(currentYear, currentMonth + 1, 1);
  
  // Calculate the difference in days
  const timeDifference = firstDayOfNextMonth.getTime() - today.getTime();
  const daysUntilNextMonth = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  // Calculate planning percentage dynamically - percentage of income that is planned for expenses
  const plannedPercentage = nextMonthData.income > 0 
    ? Math.min(Math.round((nextMonthData.expenses / nextMonthData.income) * 100), 100)
    : 0;

  // Calculate income change percentage compared to current month
  const calculateIncomeChange = () => {
    if (currentMonthData.income === 0) {
      // If current month has no income but next month has income, it's a 100% increase
      if (nextMonthData.income > 0) {
        return { percentage: 100, isPositive: true, isSignificant: true };
      }
      // If both are zero, no change
      return { percentage: 0, isPositive: true, isSignificant: false };
    }
    
    const changeAmount = nextMonthData.income - currentMonthData.income;
    const changePercentage = (changeAmount / currentMonthData.income) * 100;
    
    return {
      percentage: Math.abs(Math.round(changePercentage)),
      isPositive: changePercentage >= 0,
      isSignificant: Math.abs(changePercentage) >= 1 // Only show if change is at least 1%
    };
  };

  const incomeChange = calculateIncomeChange();

  const getChangeText = () => {
    if (!incomeChange.isSignificant) {
      return 'ähnlich wie dieser Monat';
    }
    
    if (incomeChange.isPositive) {
      return `+${incomeChange.percentage}% mehr als dieser Monat`;
    } else {
      return `-${incomeChange.percentage}% weniger als dieser Monat`;
    }
  };

  const getChangeIcon = () => {
    if (!incomeChange.isSignificant) {
      return <Minus className="w-4 h-4" />;
    }
    
    return incomeChange.isPositive ? (
      <TrendingUp className="w-4 h-4" />
    ) : (
      <TrendingDown className="w-4 h-4" />
    );
  };

  const getChangeColor = () => {
    if (!incomeChange.isSignificant) {
      return 'text-blue-400';
    }
    
    return incomeChange.isPositive ? 'text-green-400' : 'text-red-400';
  };

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
        <div className={`flex items-center gap-2 text-sm ${getChangeColor()}`}>
          {getChangeIcon()}
          <span>{getChangeText()}</span>
        </div>
      </div>
    </GlassCard>
  );
};