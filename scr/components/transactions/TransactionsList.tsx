import React from 'react';
import { TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { Transaction } from '../../types';

interface TransactionsListProps {
  transactions: Transaction[];
}

export const TransactionsList: React.FC<TransactionsListProps> = ({ transactions }) => {
  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'overdue':
        return <Clock className="w-4 h-4 text-red-400" />;
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
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Transaktionen</h1>
          <p className="text-white/60">Alle deine finanziellen Bewegungen</p>
        </div>
      </div>

      <div className="space-y-3">
        {transactions.map((transaction) => (
          <GlassCard key={transaction.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  transaction.type === 'income' 
                    ? 'bg-green-500/10' 
                    : 'bg-red-500/10'
                }`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">{transaction.title}</h3>
                    {getStatusIcon(transaction.status)}
                  </div>
                  <p className="text-white/60 text-sm">{transaction.category}</p>
                  <p className="text-white/40 text-xs">{new Date(transaction.date).toLocaleDateString('de-AT')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-lg ${
                  transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.type === 'income' ? '+' : ''}€{Math.abs(transaction.amount).toLocaleString('de-AT')}
                </p>
                <p className={`text-xs ${getStatusColor(transaction.status)}`}>
                  {transaction.status === 'completed' && 'Abgeschlossen'}
                  {transaction.status === 'pending' && 'Ausstehend'}
                  {transaction.status === 'overdue' && 'Überfällig'}
                </p>
              </div>
            </div>
            
            {transaction.tags && transaction.tags.length > 0 && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                {transaction.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-white/10 text-white/60 px-2 py-1 rounded-md text-xs"
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