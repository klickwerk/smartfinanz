// src/components/budgets/BudgetForm.tsx
import React, { useState, useEffect } from 'react'; // Added useEffect
import { X, Wallet, Calendar, Users, Palette, Trash2 } from 'lucide-react';
import { Budget } from '../../types';
import { PLACEHOLDERS } from '../../constants/ui';
import { BUDGET_CATEGORIES, BUDGET_RECURRENCE_OPTIONS, COLOR_OPTIONS } from '../../constants/options';
import { getDefaultDate, getDefaultEndDate } from '../../utils/dateUtils';

// Importiere useAuth und useFamilies/useFamilyMembers (müssen wir noch erstellen oder anpassen)
import { useAuth } from '../../context/AuthContext';
import { useFamilyMemberships } from '../../hooks/useFamilyMemberships'; // <-- Diesen Hook werden wir verwenden

interface BudgetFormProps {
  onClose: () => void;
  onSubmit: (budget: Omit<Budget, 'id'>) => void;
  onDelete?: (budgetId: string) => void;
  editBudget?: Budget;
  selectedMemberId?: string; // Dies könnte die ID des ausgewählten Familienmitglieds sein
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ 
  onClose, 
  onSubmit, 
  onDelete,
  editBudget,
  selectedMemberId // Wird verwendet, um das Formular vorab auszufüllen
}) => {
  const { user } = useAuth(); // Den angemeldeten Benutzer aus dem AuthContext holen
  const { familyMemberships, families } = useFamilyMemberships(); // Dynamische Familienmitgliedschaften und Familien laden

  // Erstelle eine Liste der verfügbaren Familienmitglieder für das Dropdown
  // Dies sollte die Namen der Familienmitglieder aus der Datenbank enthalten
  const availableFamilyMembers = familyMemberships.map(fm => ({
    id: fm.user_id,
    name: fm.profile?.full_name || 'Unbekannt'
  }));

  // Füge die "Haushalt"-Option hinzu, wenn sie als spezielle Familie in der DB existiert
  // Finde die ID der "Haushalt"-Familie, falls sie existiert
  const householdFamily = families.find(f => f.name === 'Haushalt'); // Annahme: Es gibt eine Familie namens 'Haushalt' in der DB

  // Pre-fill assignedTo based on selectedMemberId or editBudget
  const getDefaultAssignedTo = () => {
    if (editBudget?.assignedTo) return editBudget.assignedTo; // Wenn Budget bearbeitet wird, den bestehenden Wert nehmen
    
    // Wenn ein selectedMemberId übergeben wurde und es sich um einen tatsächlichen user_id handelt
    if (selectedMemberId && selectedMemberId !== 'overall' && selectedMemberId !== 'house') {
        const foundMember = availableFamilyMembers.find(member => member.id === selectedMemberId);
        if (foundMember) return foundMember.id; // Rückgabe der user_id
    }
    
    // Wenn selectedMemberId 'house' ist und eine 'Haushalt'-Familie existiert
    if (selectedMemberId === 'house' && householdFamily) {
        return householdFamily.id; // Rückgabe der family_id für Haushalt
    }

    // Standardwert, wenn nichts passt (z.B. der aktuelle Benutzer)
    return user?.id || ''; 
  };

  const [formData, setFormData] = useState({
    name: editBudget?.name || '',
    category: editBudget?.category || '',
    budgetedAmount: editBudget ? editBudget.budgetedAmount.toString() : '',
    spentAmount: editBudget ? editBudget.spentAmount.toString() : '0',
    startDate: editBudget?.startDate || getDefaultDate(),
    endDate: editBudget?.endDate || getDefaultEndDate(),
    recurrence: editBudget?.recurrence || 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    assignedTo: getDefaultAssignedTo(), // Dies wird jetzt eine user_id oder family_id sein
    color: editBudget?.color || 'from-blue-500 to-blue-400',
    description: editBudget?.description || '',
    isActive: editBudget?.isActive ?? true
  });

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Aktualisiere assignedTo, wenn sich der user oder die familyMemberships ändern
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      assignedTo: getDefaultAssignedTo()
    }));
  }, [user, familyMemberships, selectedMemberId, editBudget]); // Abhängigkeiten hinzufügen

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Bestimme die familyId und createdBy dynamisch
    let targetFamilyId: string | null = null;
    let targetCreatedBy: string | null = user?.id || null; // Der Ersteller ist der aktuelle Benutzer

    // Wenn assignedTo eine Familien-ID ist (z.B. 'Haushalt'-Familie)
    if (formData.assignedTo === householdFamily?.id) { // Prüfen, ob es die ID der Haushalt-Familie ist
        targetFamilyId = householdFamily.id;
        // createdBy bleibt der aktuelle Benutzer
    } else {
        // Wenn assignedTo eine user_id ist, dann gehört das Budget zu diesem Benutzer
        // Hier musst du entscheiden, ob ein Budget entweder einer Familie ODER einem Benutzer zugeordnet ist.
        // Wenn es nur einem Benutzer zugeordnet ist, dann ist familyId null.
        targetFamilyId = null; // Oder die ID der Standardfamilie des Benutzers
    }

    // WICHTIG: Du musst hier entscheiden, wie deine Budget-Tabelle strukturiert ist:
    // Hat sie eine `family_id` ODER eine `user_id` (z.B. `assigned_to_user_id`)?
    // Oder beides? Das ist entscheidend für die RLS.

    const budget: Omit<Budget, 'id'> = {
      ...formData,
      budgetedAmount: Number(formData.budgetedAmount),
      spentAmount: Number(formData.spentAmount),
      // Diese Werte MÜSSEN dynamisch sein!
      familyId: targetFamilyId, // Muss aus dem Kontext oder der Auswahl kommen
      createdBy: targetCreatedBy // Muss aus dem AuthContext kommen
    };

    onSubmit(budget);
    onClose();
  };

  const handleDelete = () => {
    if (editBudget && onDelete) {
      onDelete(editBudget.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-4xl bg-zinc-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-turquoise-500/10 rounded-xl">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-turquoise-400" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-white">
              {editBudget ? 'Budget bearbeiten' : 'Neues Budget'}
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
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Budget Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="z.B. Lebensmittel, Transport..."
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Kategorie</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white focus:outline-none focus:ring-2 focus:ring-turquoise-500 text-sm sm:text-base"
                  required
                >
                  <option value="">Kategorie wählen</option>
                  {BUDGET_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Budget Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Budget Betrag</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.budgetedAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, budgetedAmount: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500 text-sm sm:text-base"
                    placeholder={PLACEHOLDERS.AMOUNT}
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 text-sm sm:text-base">€</span>
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Bereits ausgegeben</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.spentAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, spentAmount: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500 text-sm sm:text-base"
                    placeholder={PLACEHOLDERS.AMOUNT}
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 text-sm sm:text-base">€</span>
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Startdatum</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white focus:outline-none focus:ring-2 focus:ring-turquoise-500 text-sm sm:text-base"
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/40 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Enddatum</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white focus:outline-none focus:ring-2 focus:ring-turquoise-500 text-sm sm:text-base"
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/40 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Recurrence and Assignment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Wiederholung</label>
                <div className="grid grid-cols-1 gap-1 sm:gap-2 bg-white/5 rounded-2xl p-1">
                  {BUDGET_RECURRENCE_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, recurrence: option.value as any }))}
                      className={`py-2 sm:py-3 px-3 sm:px-4 rounded-xl transition-all text-xs sm:text-sm font-medium ${
                        formData.recurrence === option.value
                          ? 'bg-turquoise-500/20 text-turquoise-400'
                          : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Zugewiesen an
                </label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white focus:outline-none focus:ring-2 focus:ring-turquoise-500 text-sm sm:text-base"
                  required
                >
                  <option value="">Zuweisen an...</option>
                  {availableFamilyMembers.map(member => ( // Verwende dynamische Mitglieder
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                  {householdFamily && ( // Zeige 'Haushalt' nur, wenn es in der DB existiert
                    <option key={householdFamily.id} value={householdFamily.id}>
                      🏠 Haushalt (gemeinsam)
                    </option>
                  )}
                </select>
                {formData.assignedTo === householdFamily?.id && ( // Prüfe gegen die tatsächliche ID
                  <p className="text-turquoise-400/80 text-xs mt-2">
                    💡 Haushalts-Budgets sind für gemeinsame Ausgaben wie Lebensmittel, Miete, etc.
                  </p>
                )}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">
                <Palette className="w-4 h-4 inline mr-2" />
                Farbe
              </label>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2 sm:gap-3">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${color.preview} transition-all duration-200 ${
                      formData.color === color.value 
                        ? 'ring-2 ring-white/50 scale-110' 
                        : 'hover:scale-105'
                    }`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Beschreibung (optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500 resize-none text-sm sm:text-base"
                rows={3}
                placeholder={PLACEHOLDERS.DESCRIPTION}
              />
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
              {editBudget ? 'Änderungen speichern' : 'Budget erstellen'}
            </button>

            {/* Delete Button - only show when editing */}
            {editBudget && onDelete && (
              <div>
                {!showDeleteConfirmation ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirmation(true)}
                    className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold py-3 sm:py-4 rounded-xl transition-all duration-200 active:scale-[0.98] border border-red-500/20 text-sm sm:text-base"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    Budget löschen
                  </button>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 sm:p-4">
                    <p className="text-red-400 text-xs sm:text-sm mb-3 text-center">
                      Möchtest du dieses Budget wirklich löschen?
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