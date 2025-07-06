import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { Transaction } from '../../types';

interface OverdueItemsCardProps {
  overdueTransactions: Transaction[];
}

export const OverdueItemsCard: React.FC<OverdueItemsCardProps> = ({ overdueTransactions }) => {
  const totalOverdue = overdueTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <GlassCard className="border-red-500/20 bg-red-500/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-500/10 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Überfällig</h3>
            <p className="text-white/60 text-sm">{overdueTransactions.length} Posten</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-red-400 font-bold text-xl">-€{totalOverdue.toLocaleString('de-AT')}</p>
          <p className="text-white/60 text-sm">Gesamt</p>
        </div>
      </div>
      
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {overdueTransactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-red-400" />
              <div>
                <p className="text-white font-medium text-sm">{transaction.title}</p>
                <p className="text-white/60 text-xs">{transaction.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-red-400 font-semibold">€{Math.abs(transaction.amount).toLocaleString('de-AT')}</p>
              <p className="text-white/60 text-xs">{new Date(transaction.date).toLocaleDateString('de-AT')}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};