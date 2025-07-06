import React, { useState } from 'react';
import { X, Plus, Minus, Calendar, Tag, MessageSquare, Clock, Repeat } from 'lucide-react';
import { Transaction } from '../../types';
import { useRecurringPatterns } from '../../hooks/useRecurringPatterns';

interface TransactionFormProps {
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  editTransaction?: Transaction;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ 
  onClose, 
  onSubmit, 
  editTransaction 
}) => {
  const { addPattern, calculateNextOccurrence } = useRecurringPatterns();
  
  const [formData, setFormData] = useState({
    title: editTransaction?.title || '',
    amount: editTransaction ? Math.abs(editTransaction.amount).toString() : '',
    category: editTransaction?.category || '',
    date: editTransaction?.date || new Date().toISOString().split('T')[0],
    type: editTransaction?.type || 'expense' as 'income' | 'expense',
    currency: editTransaction?.currency || 'EUR' as 'EUR' | 'USD' | 'CHF',
    description: editTransaction?.description || '',
    tags: editTransaction?.tags || [] as string[],
    status: editTransaction?.status || 'pending' as 'pending' | 'someday'
  });
  
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringData, setRecurringData] = useState({
    recurrence_type: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    recurrence_interval: 1,
    end_date: '',
  });

  const [tagInput, setTagInput] = useState('');

  const categories = {
    expense: ['Wohnen', 'Transport', 'Lebensmittel', 'Entertainment', 'Gesundheit', 'Bildung', 'Sonstiges'],
    income: ['Gehalt', 'Freelance', 'Investitionen', 'Bonus', 'Sonstiges']
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRecurring && !editTransaction) {
      // Create recurring pattern
      handleCreateRecurringPattern();
    } else {
      // Create/update single transaction
      const transaction: Omit<Transaction, 'id'> = {
        ...formData,
        amount: formData.type === 'expense' ? -Math.abs(Number(formData.amount)) : Math.abs(Number(formData.amount)),
      };

      onSubmit(transaction);
      onClose();
    }
  };

  const handleCreateRecurringPattern = async () => {
    try {
      const nextOccurrence = calculateNextOccurrence(
        formData.date,
        recurringData.recurrence_type,
        recurringData.recurrence_interval
      );

      await addPattern({
        title: formData.title,
        amount: Math.abs(Number(formData.amount)),
        category: formData.category,
        type: formData.type,
        currency: formData.currency,
        description: formData.description,
        tags: formData.tags,
        recurrence_type: recurringData.recurrence_type,
        recurrence_interval: recurringData.recurrence_interval,
        start_date: formData.date,
        end_date: recurringData.end_date || undefined,
        next_occurrence_date: nextOccurrence,
        is_active: true,
      });

      onClose();
    } catch (error) {
      console.error('Error creating recurring pattern:', error);
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full bg-zinc-900/95 backdrop-blur-xl rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {editTransaction ? 'Transaktion bearbeiten' : 'Neue Transaktion'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction Type Toggle */}
          <div className="flex bg-white/5 rounded-2xl p-1">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category: '' }))}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                formData.type === 'expense'
                  ? 'bg-red-500/20 text-red-400'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <Minus className="w-5 h-5" />
              Ausgabe
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'income', category: '' }))}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                formData.type === 'income'
                  ? 'bg-green-500/20 text-green-400'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <Plus className="w-5 h-5" />
              Einkommen
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Titel</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
              placeholder="z.B. Miete, Gehalt, Einkaufen..."
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Betrag</label>
            <div className="flex">
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value as any }))}
                className="bg-white/5 border border-white/10 rounded-l-xl px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-turquoise-500"
              >
                <option value="EUR">€</option>
                <option value="USD">$</option>
                <option value="CHF">CHF</option>
              </select>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="flex-1 bg-white/5 border border-white/10 border-l-0 rounded-r-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Kategorie</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-turquoise-500"
              required
            >
              <option value="">Kategorie wählen</option>
              {categories[formData.type].map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Planning Status */}
          {!isRecurring && (
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Planung</label>
            <div className="flex bg-white/5 rounded-2xl p-1">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'pending' }))}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                  formData.status === 'pending'
                    ? 'bg-turquoise-500/20 text-turquoise-400'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Geplant
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'someday' }))}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                  formData.status === 'someday'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                <Clock className="w-4 h-4" />
                Irgendwann
              </button>
            </div>
          </div>
          )}

          {/* Date - only required if not "someday" */}
          {(!isRecurring || formData.status !== 'someday') && (
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              {isRecurring ? 'Startdatum' : `Datum ${formData.status === 'someday' ? '(optional)' : ''}`}
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-turquoise-500"
                required={formData.status !== 'someday'}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
            </div>
          </div>
          )}

          {/* Recurring Options */}
          {!editTransaction && (
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Wiederholung</label>
              <div className="flex bg-white/5 rounded-2xl p-1">
                <button
                  type="button"
                  onClick={() => setIsRecurring(false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                    !isRecurring
                      ? 'bg-turquoise-500/20 text-turquoise-400'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Einmalig
                </button>
                <button
                  type="button"
                  onClick={() => setIsRecurring(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
                    isRecurring
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  <Repeat className="w-4 h-4" />
                  Wiederkehrend
                </button>
              </div>
            </div>
          )}

          {/* Recurring Pattern Details */}
          {isRecurring && (
            <>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Wiederholungstyp</label>
                <select
                  value={recurringData.recurrence_type}
                  onChange={(e) => setRecurringData(prev => ({ 
                    ...prev, 
                    recurrence_type: e.target.value as any 
                  }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-turquoise-500"
                >
                  <option value="daily">Täglich</option>
                  <option value="weekly">Wöchentlich</option>
                  <option value="monthly">Monatlich</option>
                  <option value="quarterly">Vierteljährlich</option>
                  <option value="yearly">Jährlich</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Intervall</label>
                <input
                  type="number"
                  min="1"
                  value={recurringData.recurrence_interval}
                  onChange={(e) => setRecurringData(prev => ({ 
                    ...prev, 
                    recurrence_interval: parseInt(e.target.value) || 1 
                  }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500"
                  placeholder="1"
                />
                <p className="text-white/60 text-xs mt-1">
                  Alle {recurringData.recurrence_interval} {
                    recurringData.recurrence_type === 'daily' ? 'Tag(e)' :
                    recurringData.recurrence_type === 'weekly' ? 'Woche(n)' :
                    recurringData.recurrence_type === 'monthly' ? 'Monat(e)' :
                    recurringData.recurrence_type === 'quarterly' ? 'Quartal(e)' :
                    'Jahr(e)'
                  }
                </p>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Enddatum (optional)</label>
                <input
                  type="date"
                  value={recurringData.end_date}
                  onChange={(e) => setRecurringData(prev => ({ 
                    ...prev, 
                    end_date: e.target.value 
                  }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-turquoise-500"
                />
              </div>
            </>
          )}

          {/* Tags */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Tags</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500"
                placeholder="Tag hinzufügen..."
              />
              <button
                type="button"
                onClick={addTag}
                className="bg-turquoise-500/20 hover:bg-turquoise-500/30 text-turquoise-400 px-4 py-3 rounded-xl transition-colors"
              >
                <Tag className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-white/10 text-white/80 px-3 py-1 rounded-full text-sm flex items-center gap-2"
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

          {/* Description */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Beschreibung (optional)</label>
            <div className="relative">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500 resize-none"
                rows={3}
                placeholder="Zusätzliche Notizen..."
              />
              <MessageSquare className="absolute right-3 top-3 w-5 h-5 text-white/40 pointer-events-none" />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white font-semibold py-4 rounded-xl hover:from-turquoise-600 hover:to-turquoise-500 transition-all duration-200 active:scale-[0.98]"
          >
            {editTransaction ? 'Änderungen speichern' : 
             isRecurring ? 'Wiederholung erstellen' : 'Transaktion speichern'}
          </button>
        </form>
      </div>
    </div>
  );
};