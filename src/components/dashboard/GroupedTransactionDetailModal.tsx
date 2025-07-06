import React from 'react';
import { X, Calendar, Users, Repeat, Euro, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { GroupedYearlyTransaction } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/formatUtils';

interface GroupedTransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupedTransaction: GroupedYearlyTransaction | null;
}

export const GroupedTransactionDetailModal: React.FC<GroupedTransactionDetailModalProps> = ({
  isOpen,
  onClose,
  groupedTransaction
}) => {
  const { displayCurrency } = useCurrency();

  if (!isOpen || !groupedTransaction) return null;

  const getRecurrenceText = (recurrence?: string) => {
    switch (recurrence) {
      case 'monthly': return 'Monatlich';
      case 'quarterly': return 'Quartalsweise';
      case 'yearly': return 'Jährlich';
      default: return 'Einmalig';
    }
  };

  const getMonthName = (monthIndex: number) => {
    const months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    return months[monthIndex] || '';
  };

  // Group transactions by month for better overview
  const transactionsByMonth = groupedTransaction.transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const monthName = `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        monthName,
        transactions: [],
        totalAmount: 0
      };
    }
    
    acc[monthKey].transactions.push(transaction);
    acc[monthKey].totalAmount += Math.abs(transaction.amount);
    
    return acc;
  }, {} as Record<string, { monthName: string; transactions: any[]; totalAmount: number }>);

  const monthlyGroups = Object.values(transactionsByMonth).sort((a, b) => {
    // Sort by month (newest first)
    const aDate = new Date(a.transactions[0].date);
    const bDate = new Date(b.transactions[0].date);
    return bDate.getTime() - aDate.getTime();
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              groupedTransaction.type === 'income' 
                ? 'bg-green-500/10' 
                : groupedTransaction.isBudgetGroup 
                ? 'bg-turquoise-500/10' 
                : 'bg-red-500/10'
            }`}>
              {groupedTransaction.isBudgetGroup ? (
                <PiggyBank className="w-6 h-6 text-turquoise-400" />
              ) : groupedTransaction.type === 'income' ? (
                <TrendingUp className="w-6 h-6 text-green-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-400" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{groupedTransaction.title}</h2>
              <p className="text-white/60 text-sm">{groupedTransaction.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-white/60" />
          </button>
        </div>

        {/* Summary */}
        <div className="p-6 border-b border-white/10 flex-shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-white/60 text-sm mb-1">Gesamtbetrag</p>
              <p className={`font-bold text-xl ${
                groupedTransaction.type === 'income' ? 'text-green-400' : 'text-red-400'
              }`}>
                {groupedTransaction.type === 'income' ? '+' : '-'}{formatCurrency(groupedTransaction.totalAmount, displayCurrency.value)}
              </p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-white/60 text-sm mb-1">Anzahl Posten</p>
              <p className="text-turquoise-400 font-bold text-xl">{groupedTransaction.transactionCount}</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-white/60 text-sm mb-1">Kategorie</p>
              <p className="text-white font-bold text-lg">{groupedTransaction.category}</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-white/60 text-sm mb-1">Wiederholung</p>
              <p className="text-purple-400 font-bold text-lg">
                {getRecurrenceText(groupedTransaction.recurrence)}
              </p>
            </div>
          </div>

          {groupedTransaction.assignedTo && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-turquoise-400" />
              <span className="text-white/60">Zugewiesen an:</span>
              <span className="text-turquoise-400 font-medium">{groupedTransaction.assignedTo}</span>
            </div>
          )}
        </div>

        {/* Transaction List */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-white font-semibold text-lg mb-4">Einzelne Transaktionen</h3>
          
          <div className="space-y-6">
            {monthlyGroups.map((monthGroup, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-medium">{monthGroup.monthName}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-sm">{monthGroup.transactions.length} Posten</span>
                    <span className={`font-semibold ${
                      groupedTransaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {groupedTransaction.type === 'income' ? '+' : '-'}{formatCurrency(monthGroup.totalAmount, displayCurrency.value)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {monthGroup.transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-white/40" />
                        <div>
                          <p className="text-white font-medium text-sm">{transaction.title}</p>
                          <p className="text-white/60 text-xs">
                            {new Date(transaction.date).toLocaleDateString('de-AT', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : ''}{formatCurrency(Math.abs(transaction.amount), displayCurrency.value)}
                        </p>
                        {transaction.isBudgetTransaction && (
                          <span className="bg-turquoise-500/20 text-turquoise-400 px-2 py-0.5 rounded-full text-xs font-medium">
                            Budget
                          </span>
                        )}
                        {transaction.generatedFrom && (
                          <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full text-xs font-medium">
                            Wiederkehrend
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex-shrink-0">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white font-semibold py-3 px-6 rounded-xl hover:from-turquoise-600 hover:to-turquoise-500 transition-all duration-200 active:scale-[0.98]"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};