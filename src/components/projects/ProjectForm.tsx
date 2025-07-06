import React, { useState } from 'react';
import { X, Target, Calendar, Users, Palette, Trash2, Euro } from 'lucide-react';
import { FinancialProject } from '../../types';
import { PLACEHOLDERS } from '../../constants/ui';
import { PROJECT_CATEGORIES, PROJECT_STATUS_OPTIONS, CURRENCY_OPTIONS } from '../../constants/options';
import { getDefaultProjectDueDate } from '../../utils/dateUtils';

interface ProjectFormProps {
  onClose: () => void;
  onSubmit: (project: Omit<FinancialProject, 'id'>) => void;
  onDelete?: (projectId: string) => void;
  editProject?: FinancialProject;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ 
  onClose, 
  onSubmit, 
  onDelete,
  editProject
}) => {
  const [formData, setFormData] = useState({
    title: editProject?.title || '',
    description: editProject?.description || '',
    targetAmount: editProject ? editProject.targetAmount.toString() : '',
    currentAmount: editProject ? editProject.currentAmount.toString() : '0',
    dueDate: editProject?.dueDate || getDefaultProjectDueDate(),
    category: editProject?.category || '',
    status: editProject?.status || 'active' as 'active' | 'completed' | 'paused',
    currency: editProject?.currency || 'EUR' as 'EUR' | 'USD' | 'CHF'
  });

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const project: Omit<FinancialProject, 'id'> = {
      ...formData,
      targetAmount: Number(formData.targetAmount),
      currentAmount: Number(formData.currentAmount),
      participants: editProject?.participants || [
        { id: '1', name: 'Max', avatar: 'MM', contribution: 0 }
      ],
      familyId: 'family-1',
      createdBy: 'user-1'
    };

    onSubmit(project);
    onClose();
  };

  const handleDelete = () => {
    if (editProject && onDelete) {
      onDelete(editProject.id);
      onClose();
    }
  };

  const progress = Number(formData.targetAmount) > 0 
    ? (Number(formData.currentAmount) / Number(formData.targetAmount)) * 100 
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-4xl bg-zinc-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 rounded-xl">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-white">
              {editProject ? 'Sparziel bearbeiten' : 'Neues Sparziel'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="md:col-span-2">
                <label className="block text-white/80 text-sm font-medium mb-2">Sparziel Name</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="z.B. Urlaub nach Italien, Neue Küche..."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-white/80 text-sm font-medium mb-2">Beschreibung</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm sm:text-base"
                  rows={3}
                  placeholder={PLACEHOLDERS.DESCRIPTION}
                  required
                />
              </div>
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Zielbetrag</label>
                <div className="flex">
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value as any }))}
                    className="bg-white/5 border border-white/10 rounded-l-xl px-2 sm:px-3 py-2.5 sm:py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                  >
                    {CURRENCY_OPTIONS.map(currency => (
                      <option key={currency.value} value={currency.value}>{currency.symbol}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                    className="flex-1 bg-white/5 border border-white/10 border-l-0 rounded-r-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                    placeholder={PLACEHOLDERS.AMOUNT}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Bereits gespart</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                    placeholder={PLACEHOLDERS.AMOUNT}
                  />
                  <Euro className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/40 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Progress Preview */}
            {formData.targetAmount && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 sm:p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/80 text-sm">Fortschritt</span>
                  <span className="text-purple-400 font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-400 h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-xs sm:text-sm">
                  <span className="text-white/60">
                    €{Number(formData.currentAmount || 0).toLocaleString('de-AT')} gespart
                  </span>
                  <span className="text-white/60">
                    €{(Number(formData.targetAmount) - Number(formData.currentAmount || 0)).toLocaleString('de-AT')} fehlen noch
                  </span>
                </div>
              </div>
            )}

            {/* Date and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Zieldatum</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/40 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Kategorie</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                  required
                >
                  <option value="">Kategorie wählen</option>
                  {PROJECT_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">Status</label>
              <div className="grid grid-cols-3 gap-1 sm:gap-2 bg-white/5 rounded-2xl p-1">
                {PROJECT_STATUS_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: option.value as any }))}
                    className={`py-2 sm:py-3 px-3 sm:px-4 rounded-xl transition-all text-xs sm:text-sm font-medium ${
                      formData.status === option.value
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer with Action Buttons */}
        <div className="p-4 sm:p-6 border-t border-white/10 flex-shrink-0">
          <div className="space-y-3">
            {/* Submit Button */}
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-400 text-white font-semibold py-3 sm:py-4 rounded-xl hover:from-purple-600 hover:to-purple-500 transition-all duration-200 active:scale-[0.98] text-sm sm:text-base"
            >
              {editProject ? 'Änderungen speichern' : 'Sparziel erstellen'}
            </button>

            {/* Delete Button - only show when editing */}
            {editProject && onDelete && (
              <div>
                {!showDeleteConfirmation ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirmation(true)}
                    className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold py-3 sm:py-4 rounded-xl transition-all duration-200 active:scale-[0.98] border border-red-500/20 text-sm sm:text-base"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    Sparziel löschen
                  </button>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 sm:p-4">
                    <p className="text-red-400 text-xs sm:text-sm mb-3 text-center">
                      Möchtest du dieses Sparziel wirklich löschen?
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirmation(false)}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all duration-200 text-sm sm:text-base"
                      >
                        Abbrechen
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all duration-200 active:scale-[0.98] text-sm sm:text-base"
                      >
                        Ja, löschen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};