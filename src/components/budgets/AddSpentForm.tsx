import React, { useState } from 'react';
import { X, PlusCircle, Euro } from 'lucide-react';
import { PLACEHOLDERS } from '../../constants/ui';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/formatUtils';

interface AddSpentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  budgetName: string;
  currentSpent: number;
  budgetedAmount: number;
}

export const AddSpentForm: React.FC<AddSpentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  budgetName,
  currentSpent,
  budgetedAmount
}) => {
  const [amount, setAmount] = useState('');
  const { displayCurrency } = useCurrency();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const spentAmount = parseFloat(amount);
    if (spentAmount > 0) {
      onSubmit(spentAmount);
      onClose();
      setAmount('');
    }
  };

  const remaining = budgetedAmount - currentSpent;
  const newTotal = currentSpent + parseFloat(amount || '0');
  const wouldExceed = newTotal > budgetedAmount;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-turquoise-500/10 rounded-xl">
              <PlusCircle className="w-6 h-6 text-turquoise-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Ausgabe hinzufügen</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-white/5 rounded-xl p-4 mb-4">
            <h3 className="text-white font-semibold text-lg mb-2">{budgetName}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/60">Bereits ausgegeben</p>
                <p className="text-white font-semibold">{formatCurrency(currentSpent, displayCurrency.value)}</p>
              </div>
              <div>
                <p className="text-white/60">Noch verfügbar</p>
                <p className={`font-semibold ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(remaining, displayCurrency.value)}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">
                Wie viel hast du ausgegeben?
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-2xl font-bold text-center placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
                  placeholder={PLACEHOLDERS.AMOUNT}
                  required
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 text-xl font-bold pointer-events-none">
                  {displayCurrency.symbol}
                </span>
              </div>
              
              {amount && (
                <div className="mt-3 p-3 bg-white/5 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-sm">Neuer Gesamtbetrag:</span>
                    <span className={`font-semibold ${wouldExceed ? 'text-red-400' : 'text-white'}`}>
                      {formatCurrency(newTotal, displayCurrency.value)}
                    </span>
                  </div>
                  {wouldExceed && (
                    <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-xs text-center">
                        ⚠️ Das würde dein Budget um {formatCurrency(newTotal - budgetedAmount, displayCurrency.value)} überschreiten
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-4 rounded-xl transition-all duration-200"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white font-semibold py-4 rounded-xl hover:from-turquoise-600 hover:to-turquoise-500 transition-all duration-200 active:scale-[0.98]"
              >
                Hinzufügen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};