import React, { useState } from 'react';
import { X, Plus, Minus, Calendar, Tag, MessageSquare, Clock } from 'lucide-react';
import { Transaction } from '../../types';

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

  const [tagInput, setTagInput] = useState('');

  const categories = {
    expense: ['Wohnen', 'Transport', 'Lebensmittel', 'Entertainment', 'Gesundheit', 'Bildung', 'Sonstiges'],
    income: ['Gehalt', 'Freelance', 'Investitionen', 'Bonus', 'Sonstiges']
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transaction: Omit<Transaction, 'id'> = {
      ...formData,
      amount: formData.type === 'expense' ? -Math.abs(Number(formData.amount)) : Math.abs(Number(formData.amount)),
    };

    onSubmit(transaction);
    onClose();
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

          {/* Date - only required if not "someday" */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Datum {formData.status === 'someday' && '(optional)'}
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
            {editTransaction ? 'Änderungen speichern' : 'Transaktion speichern'}
          </button>
        </form>
      </div>
    </div>
  );
};