import React from 'react';
import { TrendingUp, TrendingDown, Clock, CheckCircle, Filter } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { Transaction } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/formatUtils';

interface TransactionsListProps {
  transactions: Transaction[];
}

export const TransactionsList: React.FC<TransactionsListProps> = ({ transactions }) => {
  const { displayCurrency } = useCurrency();

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'overdue':
        return <Clock className="w-4 h-4 text-red-400" />;
      case 'someday':
        return <Clock className="w-4 h-4 text-purple-400" />;
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'overdue':
        return 'text-red-400';
      case 'someday':
        return 'text-purple-400';
    }
  };

  const getStatusText = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'Abgeschlossen';
      case 'pending':
        return 'Ausstehend';
      case 'overdue':
        return 'Überfällig';
      case 'someday':
        return 'Irgendwann';
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Transaktionen</h1>
          <p className="text-white/70 text-lg">Alle deine finanziellen Bewegungen</p>
        </div>
        <button className="bg-white/5 backdrop-blur-xl border border-white/10 text-white p-4 rounded-2xl hover:bg-white/10 transition-all duration-200 active:scale-95">
          <Filter className="w-6 h-6" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
          <p className="text-white/60 text-sm mb-1">Gesamt</p>
          <p className="text-white font-bold text-xl">{transactions.length}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
          <p className="text-white/60 text-sm mb-1">Abgeschlossen</p>
          <p className="text-green-400 font-bold text-xl">{transactions.filter(t => t.status === 'completed').length}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
          <p className="text-white/60 text-sm mb-1">Ausstehend</p>
          <p className="text-yellow-400 font-bold text-xl">{transactions.filter(t => t.status === 'pending').length}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
          <p className="text-white/60 text-sm mb-1">Überfällig</p>
          <p className="text-red-400 font-bold text-xl">{transactions.filter(t => t.status === 'overdue').length}</p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <GlassCard key={transaction.id} className="hover:bg-white/10 transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${
                  transaction.type === 'income' 
                    ? 'bg-green-500/10' 
                    : 'bg-red-500/10'
                }`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-red-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-semibold text-lg">{transaction.title}</h3>
                    {getStatusIcon(transaction.status)}
                  </div>
                  <p className="text-white/60 text-sm">{transaction.category}</p>
                  <p className="text-white/40 text-xs">
                    {transaction.date ? new Date(transaction.date).toLocaleDateString('de-AT') : 'Kein Datum'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-xl ${
                  transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.type === 'income' ? '+' : ''}{formatCurrency(Math.abs(transaction.amount), displayCurrency.value)}
                </p>
                <p className={`text-sm font-medium ${getStatusColor(transaction.status)}`}>
                  {getStatusText(transaction.status)}
                </p>
              </div>
            </div>
            
            {transaction.tags && transaction.tags.length > 0 && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                {transaction.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-white/10 text-white/60 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
};