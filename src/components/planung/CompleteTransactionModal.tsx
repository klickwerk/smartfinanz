import React, { useState } from 'react';
import { X, Calendar, CheckCircle } from 'lucide-react';

interface CompleteTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (completedDate: string) => void;
  transactionTitle: string;
}

export const CompleteTransactionModal: React.FC<CompleteTransactionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transactionTitle
}) => {
  const [completedDate, setCompletedDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(completedDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-500/10 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Transaktion abschließen</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-white/80 mb-2">Du möchtest diese Transaktion als erledigt markieren:</p>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white font-semibold">{transactionTitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-3">
              Wann hast du diese Transaktion durchgeführt?
            </label>
            <div className="relative">
              <input
                type="date"
                value={completedDate}
                onChange={(e) => setCompletedDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl transition-all duration-200"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-green-400 text-white font-semibold py-3 rounded-xl hover:from-green-600 hover:to-green-500 transition-all duration-200 active:scale-[0.98]"
            >
              Als erledigt markieren
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};