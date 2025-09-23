import React, { useState } from 'react';
import { X, Plus, Minus, Calendar, Tag, MessageSquare, Clock, Users, Repeat, Trash2 } from 'lucide-react';
import { Transaction } from '../../types';
import { PLACEHOLDERS } from '../../constants/ui';
import { CATEGORIES, RECURRENCE_OPTIONS } from '../../constants/options';
import { useCurrency } from '../../context/CurrencyContext';
import { validateTransactionForm } from '../../utils/transactionValidation';
import { usePermissions } from '../../context/PermissionsContext';
import { useAuth } from '../../context/AuthContext';

interface TransactionPreset {
  type?: 'income' | 'expense';
  recurrence?: 'none' | 'monthly' | 'quarterly' | 'yearly';
}

interface TransactionFormProps {
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  onDelete?: (transactionId: string) => void;
  editTransaction?: Transaction;
  preset?: TransactionPreset;
  userFamilyId?: string | null;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ 
  onClose, 
  onSubmit, 
  onDelete,
  editTransaction,
  preset,
  userFamilyId
}) => {
  const { displayCurrency } = useCurrency();
  const { familyMembersData } = usePermissions();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: editTransaction?.title || '',
    amount: editTransaction ? Math.abs(editTransaction.amount).toString() : '',
    category: editTransaction?.category || '',
    date: editTransaction?.date || new Date().toISOString().split('T')[0],
    type: editTransaction?.type || preset?.type || 'expense' as 'income' | 'expense',
    currency: editTransaction?.currency || displayCurrency.value, // Use current display currency
    description: editTransaction?.description || '',
    tags: editTransaction?.tags || [] as string[],
    status: editTransaction?.status || 'pending' as 'pending' | 'someday',
    assignedTo: editTransaction?.assignedTo || '',
    recurrence: editTransaction?.recurrence || preset?.recurrence || 'none' as 'none' | 'monthly' | 'quarterly' | 'yearly'
  });

  const [tagInput, setTagInput] = useState('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Filter out system entries (overall, house) for the dropdown
  const availableMembers = familyMembersData.filter(member => 
    member.id !== 'overall' && member.id !== 'house'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validiere das Formular mit der ausgelagerten Validierungsfunktion
    const errors = validateTransactionForm(formData);
    
    if (errors.length > 0) {
      // Zeige Validierungsfehler an
      setValidationErrors(errors);
      // Fehler nach einigen Sekunden ausblenden
      setTimeout(() => {
        setValidationErrors([]);
      }, 5000);
      return;
    }
    
    const transaction: Omit<Transaction, 'id'> = {
      ...formData,
      amount: formData.type === 'expense' ? -Math.abs(Number(formData.amount)) : Math.abs(Number(formData.amount)),
      created_by: user?.id || '',
      family_id: userFamilyId || null,
    };

    onSubmit(transaction);
    onClose();
  };

  const handleDelete = () => {
    if (editTransaction && onDelete) {
      onDelete(editTransaction.id);
      onClose();
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-4xl bg-zinc-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
          <h2 className="text-lg sm:text-2xl font-bold text-white">
            {editTransaction ? 'Bearbeiten' : 'Neue Transaktion'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" />
          </button>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mx-4 sm:mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-red-500/20 rounded-lg">
                <X className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-red-400 font-medium text-sm mb-1">Bitte korrigiere folgende Fehler:</p>
                <ul className="text-red-300/80 text-sm space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Transaction Type Toggle */}
            <div className="flex bg-white/5 rounded-2xl p-1">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category: '' }))}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl transition-all text-sm sm:text-base ${
                  formData.type === 'expense'
                    ? 'bg-red-500/20 text-red-400'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                Ausgabe
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'income', category: '' }))}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl transition-all text-sm sm:text-base ${
                  formData.type === 'income'
                    ? 'bg-green-500/20 text-green-400'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Einkommen
              </button>
            </div>

            {/* Main Form Grid - Stack on mobile, side-by-side on larger screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column */}
              <div className="space-y-4 sm:space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Titel <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full bg-white/5 border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent text-sm sm:text-base ${
                      validationErrors.some(error => error.includes('Titel')) 
                        ? 'border-red-500/50' 
                        : 'border-white/10'
                    }`}
                    placeholder="z.B. Miete, Gehalt, Einkaufen..."
                    required
                  />
                </div>

                {/* Amount - Simplified without currency selection */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Betrag <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className={`w-full bg-white/5 border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500 text-sm sm:text-base pr-12 ${
                        validationErrors.some(error => error.includes('Betrag')) 
                          ? 'border-red-500/50' 
                          : 'border-white/10'
                      }`}
                      placeholder={PLACEHOLDERS.AMOUNT}
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 text-sm sm:text-base font-medium">
                      {displayCurrency.symbol}
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Kategorie <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className={`w-full bg-white/5 border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white focus:outline-none focus:ring-2 focus:ring-turquoise-500 text-sm sm:text-base ${
                      validationErrors.some(error => error.includes('Kategorie')) 
                        ? 'border-red-500/50' 
                        : 'border-white/10'
                    }`}
                    required
                  >
                    <option value="">Kategorie wählen</option>
                    {CATEGORIES[formData.type].map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Datum <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className={`w-full bg-white/5 border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white focus:outline-none focus:ring-2 focus:ring-turquoise-500 text-sm sm:text-base ${
                        validationErrors.some(error => error.includes('Datum')) 
                          ? 'border-red-500/50' 
                          : 'border-white/10'
                      }`}
                      required
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/40 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4 sm:space-y-6">
                {/* Assigned To - NOW MANDATORY */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Zugewiesen an <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className={`w-full bg-white/5 border rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white focus:outline-none focus:ring-2 focus:ring-turquoise-500 text-sm sm:text-base ${
                      validationErrors.some(error => error.includes('Zuweisung')) 
                        ? 'border-red-500/50' 
                        : 'border-white/10'
                    }`}
                    required
                  >
                    <option value="">Familienmitglied wählen</option>
                    {availableMembers.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                  <p className="text-turquoise-400/80 text-xs mt-2">
                    💡 Jede Transaktion muss einer Person zugewiesen werden
                  </p>
                </div>

                {/* Recurrence */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    <Repeat className="w-4 h-4 inline mr-2" />
                    Wiederholung
                  </label>
                  <div className="grid grid-cols-2 gap-1 sm:gap-2 bg-white/5 rounded-2xl p-1">
                    {RECURRENCE_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, recurrence: option.value as any }))}
                        className={`py-2 sm:py-3 px-2 sm:px-4 rounded-xl transition-all text-xs sm:text-sm font-medium ${
                          formData.recurrence === option.value
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Planning Status */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Planung</label>
                  <div className="flex bg-white/5 rounded-2xl p-1">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, status: 'pending' }))}
                      className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 rounded-xl transition-all text-xs sm:text-sm ${
                        formData.status === 'pending'
                          ? 'bg-turquoise-500/20 text-turquoise-400'
                          : 'text-white/60 hover:text-white/80'
                      }`}
                    >
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      Geplant
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, status: 'someday' }))}
                      className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 rounded-xl transition-all text-xs sm:text-sm ${
                        formData.status === 'someday'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'text-white/60 hover:text-white/80'
                      }`}
                    >
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      Irgendwann
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Beschreibung (optional)</label>
                  <div className="relative">
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500 resize-none text-sm sm:text-base"
                      rows={3}
                      placeholder={PLACEHOLDERS.DESCRIPTION}
                    />
                    <MessageSquare className="absolute right-3 top-3 w-4 h-4 sm:w-5 sm:h-5 text-white/40 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tags - Full Width */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Tags (optional)</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500 text-sm sm:text-base"
                  placeholder={PLACEHOLDERS.TAG}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="bg-turquoise-500/20 hover:bg-turquoise-500/30 text-turquoise-400 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-colors"
                >
                  <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-white/10 text-white/80 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
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
              className="w-full bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white font-semibold py-3 sm:py-4 rounded-xl hover:from-turquoise-600 hover:to-turquoise-500 transition-all duration-200 active:scale-[0.98] text-sm sm:text-base"
            >
              {editTransaction ? 'Änderungen speichern' : 'Transaktion speichern'}
            </button>

            {/* Delete Button - only show when editing */}
            {editTransaction && onDelete && (
              <div>
                {!showDeleteConfirmation ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirmation(true)}
                    className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold py-3 sm:py-4 rounded-xl transition-all duration-200 active:scale-[0.98] border border-red-500/20 text-sm sm:text-base"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    Transaktion löschen
                  </button>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 sm:p-4">
                    <p className="text-red-400 text-xs sm:text-sm mb-3 text-center">
                      Möchtest du diese Transaktion wirklich löschen?
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