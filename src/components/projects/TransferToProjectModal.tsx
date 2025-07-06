import React, { useState } from 'react';
import { X, PiggyBank, TrendingUp } from 'lucide-react';
import { FinancialProject } from '../../types';
import { PLACEHOLDERS } from '../../constants/ui';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/formatUtils';
import { usePermissions } from '../../context/PermissionsContext';

interface TransferToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (projectId: string, amount: number) => void;
  projects: FinancialProject[];
  contributorId: string;
}

export const TransferToProjectModal: React.FC<TransferToProjectModalProps> = ({
  isOpen,
  onClose,
  onTransfer,
  projects,
  contributorId
}) => {
  const { familyMembersData } = usePermissions();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [amount, setAmount] = useState('');
  const { displayCurrency } = useCurrency();

  if (!isOpen) return null;

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const contributorMember = familyMembersData.find(m => m.id === contributorId);
  const contributorName = contributorMember?.name || 'Du';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transferAmount = parseFloat(amount);
    if (transferAmount > 0 && selectedProjectId) {
      onTransfer(selectedProjectId, transferAmount);
      onClose();
      setAmount('');
      setSelectedProjectId('');
    }
  };

  const newTotal = selectedProject ? selectedProject.currentAmount + parseFloat(amount || '0') : 0;
  const progressAfterTransfer = selectedProject ? (newTotal / selectedProject.targetAmount) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 rounded-xl">
              <PiggyBank className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Geld zu Sparziel hinzufügen</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-white/80 text-sm mb-4">
            {contributorName === 'Du' ? 'Du hast' : `${contributorName} hat`} einen Überschuss? Super! Lass uns das Geld in eines der Sparziele stecken. 🎯
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Selection */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">
                Welches Sparziel möchtest du füttern?
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Sparziel auswählen...</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title} ({formatCurrency(project.currentAmount, displayCurrency.value)} / {formatCurrency(project.targetAmount, displayCurrency.value)})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">
                Wie viel möchtest du hinzufügen?
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-2xl font-bold text-center placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder={PLACEHOLDERS.AMOUNT}
                  required
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 text-xl font-bold pointer-events-none">
                  {displayCurrency.symbol}
                </span>
              </div>
            </div>

            {/* Preview */}
            {selectedProject && amount && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 font-medium text-sm">Vorschau</span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Aktuell:</span>
                    <span className="text-white">{formatCurrency(selectedProject.currentAmount, displayCurrency.value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Nach Übertragung:</span>
                    <span className="text-purple-400 font-semibold">{formatCurrency(newTotal, displayCurrency.value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Fortschritt:</span>
                    <span className="text-purple-400 font-semibold">{Math.round(progressAfterTransfer)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Einzahler:</span>
                    <span className="text-turquoise-400 font-semibold">{contributorName}</span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progressAfterTransfer, 100)}%` }}
                    />
                  </div>
                </div>

                {progressAfterTransfer >= 100 && (
                  <div className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-green-400 text-xs text-center font-medium">
                      🎉 Glückwunsch! Du würdest dein Sparziel erreichen!
                    </p>
                  </div>
                )}
              </div>
            )}

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
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-400 text-white font-semibold py-4 rounded-xl hover:from-purple-600 hover:to-purple-500 transition-all duration-200 active:scale-[0.98]"
              >
                Geld übertragen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};