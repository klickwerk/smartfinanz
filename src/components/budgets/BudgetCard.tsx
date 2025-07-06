import React from 'react';
import { Edit, Calendar, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { Budget } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/formatUtils';

interface BudgetCardProps {
  budget: Budget;
  onAddSpent: (budget: Budget) => void;
  onEdit: (budget: Budget) => void;
  onDelete: (budgetId: string) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onAddSpent, onEdit, onDelete }) => {
  const { displayCurrency } = useCurrency();
  const progress = (budget.spentAmount / budget.budgetedAmount) * 100;
  const isOverBudget = budget.spentAmount > budget.budgetedAmount;
  const remaining = budget.budgetedAmount - budget.spentAmount;
  
  const getProgressColor = () => {
    if (isOverBudget) return 'from-red-500 to-red-400';
    if (progress > 80) return 'from-yellow-500 to-yellow-400';
    return 'from-green-500 to-green-400';
  };

  const getStatusIcon = () => {
    if (isOverBudget) {
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    }
    if (progress > 80) {
      return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-400" />;
  };

  return (
    <GlassCard className="hover:bg-white/10 transition-all duration-200 cursor-pointer relative group" onClick={() => onAddSpent(budget)}>
      {/* Edit Button - Top Right Corner */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(budget);
        }}
        className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100 z-10"
        title="Budget bearbeiten"
      >
        <Edit className="w-4 h-4 text-white/60 hover:text-white" />
      </button>

      <div className="flex items-start justify-between mb-4 pr-12">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${budget.color}`} />
            <h3 className="text-white font-semibold text-lg">{budget.name}</h3>
            {getStatusIcon()}
          </div>
          <p className="text-white/60 text-sm">{budget.category}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/60 text-sm">Ausgegeben</span>
          <span className={`text-sm font-medium ${isOverBudget ? 'text-red-400' : 'text-white'}`}>
            {formatCurrency(budget.spentAmount, displayCurrency.value)} / {formatCurrency(budget.budgetedAmount, displayCurrency.value)}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2.5">
          <div 
            className={`bg-gradient-to-r ${getProgressColor()} h-2.5 rounded-full transition-all duration-700`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-white/60 text-xs">{Math.round(progress)}% verwendet</span>
          <span className={`text-xs font-medium ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {remaining >= 0 ? '+' : ''}{formatCurrency(remaining, displayCurrency.value)} verbleibend
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-white/60" />
          <span className="text-white/60 capitalize">{budget.recurrence}</span>
        </div>
        {budget.assignedTo && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-white/60" />
            <span className="text-white/60">
              {budget.assignedTo === 'Haus' ? '🏠 Haushalt' : budget.assignedTo}
            </span>
          </div>
        )}
      </div>

      {budget.description && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-white/60 text-xs">{budget.description}</p>
        </div>
      )}

      {/* Click hint */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <p className="text-turquoise-400/80 text-xs text-center">
          💡 Klicke hier, um eine Ausgabe hinzuzufügen
        </p>
      </div>
    </GlassCard>
  );
};