import React, { useState, useMemo } from 'react';
import { Plus, Wallet, TrendingUp, TrendingDown, AlertCircle, Target } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { BudgetCard } from './BudgetCard';
import { AddSpentForm } from './AddSpentForm';
// import { FAMILY_MEMBERS, getMemberNameById } from '../../constants/familyMembers'; // <-- Diese Zeilen entfernen
import { Budget } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/formatUtils';
import { FamilyMemberSelector } from '../common/FamilyMemberSelector';

// Neue Imports für dynamische Daten
import { useAuth } from '../../context/AuthContext';
import { useFamilyMemberships } from '../../hooks/useFamilyMemberships'; // Dein neuer Hook

interface BudgetsProps {
  budgets: Budget[];
  onAddBudget: (budget: Omit<Budget, 'id'>) => void;
  onEditBudget: (budgetId: string, budget: Omit<Budget, 'id'>) => void;
  onDeleteBudget: (budgetId: string) => void;
  onOpenBudgetModal: (budget?: Budget) => void;
}

export const Budgets: React.FC<BudgetsProps> = ({
  budgets,
  onAddBudget,
  onEditBudget,
  onDeleteBudget,
  onOpenBudgetModal
}) => {
  const { user } = useAuth(); // Aktueller Benutzer
  const { familyMemberships, families } = useFamilyMemberships(); // Dynamische Familien- und Mitgliedsdaten

  const [isAddSpentModalOpen, setIsAddSpentModalOpen] = useState(false);
  const [selectedBudgetForSpending, setSelectedBudgetForSpending] = useState<Budget | undefined>();
  const [selectedMemberId, setSelectedMemberId] = useState<string>('overall'); // Start with overall view
  const { displayCurrency } = useCurrency();

  // Erstelle eine Liste der verfügbaren Mitglieder für den Selector
  const availableMembers = useMemo(() => {
    const dynamicMembers = familyMemberships.map(fm => ({
      id: fm.user_id,
      name: fm.profile?.full_name || 'Unbekannt',
      avatar: '👤', // Platzhalter, falls kein Avatar in Profilen
      color: 'from-gray-500 to-gray-400', // Platzhalter Farbe
      role: fm.role,
      userRole: fm.role // Oder eine Mapping-Funktion
    }));

    // Füge 'overall' und 'house' (falls in DB vorhanden) hinzu
    const specialMembers = [];

    // 'Gesamt' Ansicht
    specialMembers.push({
      id: 'overall',
      name: 'Gesamt',
      avatar: '👨‍👩‍👧‍👦',
      color: 'from-turquoise-500 to-turquoise-400',
      role: 'Gesamtansicht',
      userRole: 'admin'
    });

    // 'Haushalt' Ansicht - nur wenn es eine entsprechende Familie in der DB gibt
    const householdFamily = families.find(f => f.name === 'Haushalt');
    if (householdFamily) {
      specialMembers.push({
        id: householdFamily.id, // WICHTIG: Die tatsächliche ID der "Haushalt"-Familie aus der DB
        name: 'Haushalt',
        avatar: '🏠',
        color: 'from-orange-500 to-orange-400',
        role: 'Unser Haushalt',
        userRole: 'admin'
      });
    }

    return [...specialMembers, ...dynamicMembers];
  }, [familyMemberships, families]);

  // Filter budgets based on selected family member/family
  const filteredBudgets = useMemo(() => {
    if (selectedMemberId === 'overall') {
      return budgets;
    }

    // Finde das ausgewählte Mitglied/die ausgewählte Familie in den dynamischen Daten
    const memberOrFamily = availableMembers.find(member => member.id === selectedMemberId);

    if (!memberOrFamily) return budgets; // Fallback, sollte nicht passieren

    // Wenn es sich um die "Haushalt"-Familie handelt (anhand ihrer DB-ID)
    if (memberOrFamily.id === householdFamily?.id) {
      return budgets.filter(budget => budget.familyId === householdFamily?.id); // Annahme: Budgets haben familyId
    }

    // Wenn es sich um ein spezifisches Familienmitglied (user_id) handelt
    // Annahme: Budgets haben eine Spalte, die dem zugewiesenen Benutzer entspricht (z.B. assignedToUserId)
    // Hier musst du dein Budget-Datenmodell anpassen: Ist assignedTo eine user_id oder ein Name?
    // Wenn es eine user_id ist:
    return budgets.filter(budget => budget.assignedTo === selectedMemberId); // Annahme: budget.assignedTo speichert die user_id
    // Wenn assignedTo ein Name ist, müsstest du den Namen des Benutzers aus den Profilen holen:
    // return budgets.filter(budget => budget.assignedTo === (memberOrFamily as any).name);
  }, [budgets, selectedMemberId, availableMembers, families]); // Abhängigkeiten aktualisieren

  // Helper function to get member name by ID (dynamisch)
  const getDynamicMemberNameById = (id: string): string => {
    const member = availableMembers.find(m => m.id === id);
    return member?.name || '';
  };

  const handleEditBudget = (budget: Budget) => {
    onOpenBudgetModal(budget);
  };

  const handleAddSpentToBudget = (budget: Budget) => {
    setSelectedBudgetForSpending(budget);
    setIsAddSpentModalOpen(true);
  };

  const handleSpentSubmit = (amount: number) => {
    if (selectedBudgetForSpending) {
      const updatedBudget = {
        ...selectedBudgetForSpending,
        spentAmount: selectedBudgetForSpending.spentAmount + amount
      };
      
      const { id, ...budgetWithoutId } = updatedBudget;
      onEditBudget(selectedBudgetForSpending.id, budgetWithoutId);
      
      setSelectedBudgetForSpending(undefined);
    }
  };

  const handleCloseSpentModal = () => {
    setIsAddSpentModalOpen(false);
    setSelectedBudgetForSpending(undefined);
  };

  // Calculate overview stats based on filtered budgets
  const totalBudgeted = filteredBudgets.reduce((sum, budget) => sum + budget.budgetedAmount, 0);
  const totalSpent = filteredBudgets.reduce((sum, budget) => sum + budget.spentAmount, 0);
  const remainingBudget = totalBudgeted - totalSpent;
  const overBudgetCount = filteredBudgets.filter(budget => budget.spentAmount > budget.budgetedAmount).length;

  // Get current selected member (dynamisch)
  const selectedMember = availableMembers.find(member => member.id === selectedMemberId) || availableMembers[0];
  
  // Find the logged-in user (dynamisch)
  const loggedInUser = availableMembers.find(member => member.id === user?.id); // Annahme: user.id ist die user_id in availableMembers

  // Generate subtitle based on selected member (dynamisch)
  const getSubtitle = () => {
    switch (selectedMemberId) {
      case 'overall':
        return 'Alle Familien-Budgets verwalten';
      case householdFamily?.id: // Prüfe gegen die tatsächliche ID
        return 'Gemeinsame Haushalts-Budgets';
      case user?.id: // Wenn der aktuell angemeldete Benutzer ausgewählt ist
        return 'Deine persönlichen Budgettöpfe';
      default:
        // Für andere Familienmitglieder
        const member = availableMembers.find(m => m.id === selectedMemberId);
        if (member && member.name) {
          const possessiveName = member.name.endsWith('s') ? `${member.name}'` : `${member.name}s`;
          return `${possessiveName} Budgettöpfe`;
        }
        return 'Budgettöpfe verwalten';
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 bg-gradient-to-br ${selectedMember.color} rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
            {selectedMember.avatar}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-1">
              Budgets
            </h1>
            <p className="text-white/70 text-lg">
              {getSubtitle()}
            </p>
          </div>
        </div>
        <button 
          onClick={() => onOpenBudgetModal()}
          className="bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white p-4 rounded-2xl hover:from-turquoise-600 hover:to-turquoise-500 transition-all duration-200 active:scale-95 shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Family Member Selector */}
      <FamilyMemberSelector 
        selectedMemberId={selectedMemberId}
        onMemberChange={setSelectedMemberId}
        // Übergabe der dynamischen Mitglieder an den Selector
        members={availableMembers.map(member => ({
          id: member.id,
          name: member.name,
          avatar: member.avatar,
          color: member.color
        }))}
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="text-center">
          <div className="p-2 bg-turquoise-500/10 rounded-xl w-fit mx-auto mb-3">
            <Wallet className="w-6 h-6 text-turquoise-400" />
          </div>
          <p className="text-white/60 text-sm mb-1">Gesamt Budget</p>
          <p className="text-turquoise-400 font-bold text-xl">{formatCurrency(totalBudgeted, displayCurrency.value)}</p>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="p-2 bg-red-500/10 rounded-xl w-fit mx-auto mb-3">
            <TrendingDown className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-white/60 text-sm mb-1">Ausgegeben</p>
          <p className="text-red-400 font-bold text-xl">{formatCurrency(totalSpent, displayCurrency.value)}</p>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="p-2 bg-green-500/10 rounded-xl w-fit mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <p className="text-white/60 text-sm mb-1">Verfügbar</p>
          <p className="text-green-400 font-bold text-xl">{formatCurrency(remainingBudget, displayCurrency.value)}</p>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="p-2 bg-yellow-500/10 rounded-xl w-fit mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
          </div>
          <p className="text-white/60 text-sm mb-1">Überschritten</p>
          <p className="text-yellow-400 font-bold text-xl">{overBudgetCount}</p>
        </GlassCard>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-turquoise-400" />
            <span className="text-white font-medium">Schnell erstellen:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => onOpenBudgetModal()}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              + Lebensmittel
            </button>
            <button
              onClick={() => onOpenBudgetModal()}
              className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              + Privat
            </button>
            <button
              onClick={() => onOpenBudgetModal()}
              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              + Transport
            </button>
            <button
              onClick={() => onOpenBudgetModal()}
              className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              + Entertainment
            </button>
          </div>
        </div>
      </div>

      {/* Budget Cards Grid */}
      {filteredBudgets.length === 0 ? (
        <GlassCard className="text-center py-12">
          <div className="p-4 bg-white/5 rounded-2xl w-fit mx-auto mb-4">
            <Wallet className="w-12 h-12 text-white/40" />
          </div>
          <h3 className="text-white font-semibold text-xl mb-2">
            {selectedMemberId === 'overall' ? 'Noch keine Budgets' : 
             selectedMemberId === householdFamily?.id ? 'Keine Haushalts-Budgets' : // Prüfe gegen die tatsächliche ID
             `Keine Budgets für ${getDynamicMemberNameById(selectedMemberId)}`}
          </h3>
          <p className="text-white/60 mb-6">
            {selectedMemberId === 'overall' 
              ? 'Erstelle das erste Budget um Ausgaben zu verfolgen'
              : selectedMemberId === householdFamily?.id // Prüfe gegen die tatsächliche ID
              ? 'Erstelle das erste Haushalts-Budget für gemeinsame Ausgaben'
              : `Erstelle das erste Budget für ${getDynamicMemberNameById(selectedMemberId)}`
            }
          </p>
          <button
            onClick={() => onOpenBudgetModal()}
            className="bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white px-6 py-3 rounded-xl hover:from-turquoise-600 hover:to-turquoise-500 transition-all duration-200 active:scale-95"
          >
            {selectedMemberId === 'overall' ? 'Erstes Budget erstellen' : 
             selectedMemberId === householdFamily?.id ? 'Haushalts-Budget erstellen' : // Prüfe gegen die tatsächliche ID
             `Budget für ${getDynamicMemberNameById(selectedMemberId)} erstellen`}
          </button>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBudgets.map((budget) => (
            <BudgetCard 
              key={budget.id} 
              budget={budget} 
              onAddSpent={handleAddSpentToBudget}
              onEdit={handleEditBudget}
              onDelete={onDeleteBudget}
            />
          ))}
        </div>
      )}

      {/* Add Spent Form Modal */}
      {isAddSpentModalOpen && selectedBudgetForSpending && (
        <AddSpentForm
          isOpen={isAddSpentModalOpen}
          onClose={handleCloseSpentModal}
          onSubmit={handleSpentSubmit}
          budgetName={selectedBudgetForSpending.name}
          currentSpent={selectedBudgetForSpending.spentAmount}
          budgetedAmount={selectedBudgetForSpending.budgetedAmount}
        />
      )}
    </div>
  );
};
