import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, TrendingDown, Users, Repeat, Clock, AlertCircle, CheckCircle2, Plus, Wallet, PiggyBank, Search, X, Undo } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { CompleteTransactionModal } from './CompleteTransactionModal';
import { getCurrentDateInfo } from '../../utils/dateUtils';
import { Transaction, Budget, GroupedYearlyTransaction } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/formatUtils';
import { useTranslation } from '../../i18n';
import { GroupedTransactionDetailModal } from '../dashboard/GroupedTransactionDetailModal';
import { transactionService } from '../../services/TransactionService';
import { FamilyMemberSelector } from '../common/FamilyMemberSelector';

// Neue Imports für dynamische Daten
import { useAuth } from '../../context/AuthContext';
import { useFamilyMemberships } from '../../hooks/useFamilyMemberships'; // Dein neuer Hook

interface TransactionPreset {
  type?: 'income' | 'expense';
  recurrence?: 'none' | 'monthly' | 'quarterly' | 'yearly';
}

interface PlanningBoardProps {
  allTransactions: Transaction[];
  completedGeneratedIds: Set<string>;
  budgets: Budget[];
  onEditTransaction: (transaction: Transaction) => void;
  onEditBudget: (budgetId: string, budget: Omit<Budget, 'id'>) => void;
  onMarkCompleted: (transactionId: string, completedDate: string) => void;
  onUnmarkCompleted: (transactionId: string) => void;
  onAddTransaction: (preset?: TransactionPreset) => void;
  selectedMemberId: string;
  onMemberChange: (memberId: string) => void;
}

export const PlanningBoard: React.FC<PlanningBoardProps> = ({
  allTransactions,
  completedGeneratedIds,
  budgets,
  onEditTransaction,
  onEditBudget,
  onMarkCompleted,
  onUnmarkCompleted,
  onAddTransaction,
  selectedMemberId,
  onMemberChange
}) => {
  const { user } = useAuth(); // Aktueller Benutzer aus dem AuthContext
  const { familyMemberships, families } = useFamilyMemberships(); // Dynamische Familien- und Mitgliedsdaten

  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>('');
  const [selectedTransactionTitle, setSelectedTransactionTitle] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isGroupDetailModalOpen, setIsGroupDetailModalOpen] = useState(false);
  const [selectedGroupedItem, setSelectedGroupedItem] = useState<GroupedYearlyTransaction | null>(null);
  const { displayCurrency } = useCurrency();
  const { t } = useTranslation();

  const { currentYear, currentMonth, nextMonth, nextMonthYear } = getCurrentDateInfo();

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

  // Define selectedMember based on selectedMemberId (dynamisch)
  const selectedMember = useMemo(() => {
    return availableMembers.find(member => member.id === selectedMemberId) || availableMembers[0];
  }, [selectedMemberId, availableMembers]);

  // Filter transactions by selected member and search term
  const filteredTransactions = useMemo(() => {
    let filtered = allTransactions;

    // First filter by selected family member/family
    if (selectedMemberId !== 'overall') {
      const memberOrFamily = availableMembers.find(m => m.id === selectedMemberId);

      if (memberOrFamily) {
        // If 'Haushalt' family is selected (by its DB ID)
        if (memberOrFamily.id === families.find(f => f.name === 'Haushalt')?.id) {
          filtered = filtered.filter(transaction => transaction.familyId === memberOrFamily.id);
        } 
        // If a specific user (family member) is selected
        else {
          // Annahme: transaction.assignedTo speichert die user_id
          filtered = filtered.filter(transaction => transaction.assignedTo === memberOrFamily.id);
        }
      }
    }

    // Then filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(transaction => {
        // Search in title
        if (transaction.title.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Search in category
        if (transaction.category.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Search in description
        if (transaction.description && transaction.description.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Search in tags
        if (transaction.tags && transaction.tags.some(tag => 
          tag.toLowerCase().includes(searchLower)
        )) {
          return true;
        }
        
        // Search in assigned person (now by name, if assignedTo is a user_id)
        if (transaction.assignedTo) {
          const assignedMember = availableMembers.find(m => m.id === transaction.assignedTo);
          if (assignedMember && assignedMember.name.toLowerCase().includes(searchLower)) {
            return true;
          }
        }
        
        return false;
      });
    }

    return filtered;
  }, [allTransactions, selectedMemberId, searchTerm, availableMembers, families]); // Abhängigkeiten aktualisieren

  // Filter transactions by status/timeframe - exclude completed items for active columns
  const backlogTransactions = filteredTransactions
    .filter(t => {
      const effectiveStatus = transactionService.getEffectiveStatus(t);
      return effectiveStatus === 'overdue';
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const thisMonthTransactions = filteredTransactions
    .filter(t => {
      const effectiveStatus = transactionService.getEffectiveStatus(t);
      if (effectiveStatus === 'overdue' || effectiveStatus === 'someday' || effectiveStatus === 'completed') return false;
      if (!t.date) return false;
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const nextMonthTransactions = filteredTransactions
    .filter(t => {
      const effectiveStatus = transactionService.getEffectiveStatus(t);
      if (effectiveStatus === 'overdue' || effectiveStatus === 'someday' || effectiveStatus === 'completed') return false;
      if (!t.date) return false;
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === nextMonth && 
             transactionDate.getFullYear() === nextMonthYear;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // NEW: Grouped transactions for "This Year" column
  const thisYearGroupedTransactions = useMemo(() => {
    const yearTransactions = filteredTransactions.filter(t => {
      const effectiveStatus = transactionService.getEffectiveStatus(t);
      if (effectiveStatus === 'overdue' || effectiveStatus === 'someday' || effectiveStatus === 'completed') return false;
      if (!t.date) return false;
      const transactionDate = new Date(t.date);
      return transactionDate.getFullYear() === currentYear &&
             transactionDate.getMonth() !== currentMonth &&
             transactionDate.getMonth() !== nextMonth;
    });

    return transactionService.groupTransactionsForYearlyView(yearTransactions, currentYear);
  }, [filteredTransactions, currentYear, currentMonth, nextMonth]);

  const somedayTransactions = filteredTransactions
    .filter(t => {
      const effectiveStatus = transactionService.getEffectiveStatus(t);
      return effectiveStatus === 'someday';
    })
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

  // New: Filter completed transactions
  const completedTransactions = filteredTransactions
    .filter(t => {
      const effectiveStatus = transactionService.getEffectiveStatus(t);
      return effectiveStatus === 'completed';
    })
    .sort((a, b) => {
      // Sort by completion date (most recent first)
      const aDate = a.completedDate || a.date || '';
      const bDate = b.completedDate || b.date || '';
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

  // Calculate column summaries
  const calculateColumnSummary = (transactions: Transaction[]) => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return { income, expenses, net: income - expenses };
  };

  // Calculate summary for grouped transactions
  const calculateGroupedSummary = (groupedTransactions: GroupedYearlyTransaction[]) => {
    const income = groupedTransactions.filter(g => g.type === 'income').reduce((sum, g) => sum + g.totalAmount, 0);
    const expenses = groupedTransactions.filter(g => g.type === 'expense').reduce((sum, g) => sum + g.totalAmount, 0);
    return { income, expenses, net: income - expenses };
  };

  const backlogSummary = calculateColumnSummary(backlogTransactions);
  const thisMonthSummary = calculateColumnSummary(thisMonthTransactions);
  const nextMonthSummary = calculateColumnSummary(nextMonthTransactions);
  const thisYearSummary = calculateGroupedSummary(thisYearGroupedTransactions);
  const somedaySummary = calculateColumnSummary(somedayTransactions);
  const completedSummary = calculateColumnSummary(completedTransactions);

  // Generate subtitle based on selected member (dynamisch)
  const getSubtitle = () => {
    const householdFamily = families.find(f => f.name === 'Haushalt'); // Finde die Haushalt-Familie dynamisch
    switch (selectedMemberId) {
      case 'overall':
        return 'Deine zentrale Arbeitsfläche für Familienfinanzen';
      case householdFamily?.id: // Prüfe gegen die tatsächliche ID der Haushalt-Familie
        return 'Haushalts-Planung und gemeinsame Finanzen';
      case user?.id: // Wenn der aktuell angemeldete Benutzer ausgewählt ist
        return 'Deine persönliche Finanzplanung';
      default:
        // Für andere Familienmitglieder
        const member = availableMembers.find(m => m.id === selectedMemberId);
        if (member && member.name) {
          const possessiveName = member.name.endsWith('s') ? `${member.name}'` : `${member.name}s`;
          return `${possessiveName} Finanzplanung`;
        }
        return 'Finanzplanung';
    }
  };

  const getRecurrenceIcon = (recurrence?: string) => {
    if (!recurrence || recurrence === 'none') return null;
    return <Repeat className="w-3 h-3 text-purple-400" />;
  };

  const getRecurrenceText = (recurrence?: string) => {
    switch (recurrence) {
      case 'monthly': return 'Monatlich';
      case 'quarterly': return 'Quartalsweise';
      case 'yearly': return 'Jährlich';
      default: return null;
    }
  };

  const handleCompleteTransaction = (transactionId: string, transactionTitle: string) => {
    setSelectedTransactionId(transactionId);
    setSelectedTransactionTitle(transactionTitle);
    setIsCompleteModalOpen(true);
  };

  const handleConfirmComplete = (completedDate: string) => {
    onMarkCompleted(selectedTransactionId, completedDate);
    setSelectedTransactionId('');
    setSelectedTransactionTitle('');
  };

  const handleUnmarkTransaction = (transactionId: string) => {
    onUnmarkCompleted(transactionId);
  };

  const handleTransactionClick = (transaction: Transaction) => {
    // Don't allow editing generated recurring transactions
    if (transaction.generatedFrom && !transaction.isBudgetTransaction) {
      return; // Do nothing for generated recurring transactions
    }
    
    if (transaction.isBudgetTransaction && transaction.budgetId) {
      // Find the original budget and edit it
      const originalBudget = budgets.find(b => b.id === transaction.budgetId);
      if (originalBudget) {
        onEditBudget(originalBudget.id, originalBudget);
      }
    } else {
      // Edit regular transaction
      onEditTransaction(transaction);
    }
  };

  const handleGroupedItemClick = (groupedTransaction: GroupedYearlyTransaction) => {
    setSelectedGroupedItem(groupedTransaction);
    setIsGroupDetailModalOpen(true);
  };

  const renderTransactionCard = (transaction: Transaction, isCompleted: boolean = false) => {
    const effectiveStatus = transactionService.getEffectiveStatus(transaction);
    const isBudgetTransaction = transaction.isBudgetTransaction;
    const isGeneratedRecurring = transaction.generatedFrom && !isBudgetTransaction;
    
    // Dynamischer Name für assignedTo
    const assignedToName = transaction.assignedTo 
      ? availableMembers.find(m => m.id === transaction.assignedTo)?.name || transaction.assignedTo
      : 'Nicht zugewiesen';
      
    return (
      <GlassCard 
        key={transaction.id}
        className={`mb-3 cursor-pointer hover:scale-[1.02] transition-all duration-200 p-4 ${
          effectiveStatus === 'overdue' ? 'border-red-500/30 bg-red-500/5' : ''
        } ${
          isBudgetTransaction ? 'border-turquoise-500/30 bg-turquoise-500/5' : ''
        } ${
          isCompleted ? 'border-green-500/30 bg-green-500/5 opacity-80' : ''
        } ${
          isGeneratedRecurring ? 'border-purple-500/30 bg-purple-500/5' : ''
        }`}
        onClick={() => handleTransactionClick(transaction)}
      >
        <div className="space-y-3">
          {/* Header with title and amount */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {isBudgetTransaction && (
                  <div className="flex items-center gap-1">
                    <PiggyBank className="w-3 h-3 text-turquoise-400 flex-shrink-0" />
                    <span className="text-turquoise-400 text-xs font-medium">Budget</span>
                  </div>
                )}
                {isCompleted && (
                  <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                )}
                {isGeneratedRecurring && (
                  <div className="flex items-center gap-1">
                    <Repeat className="w-3 h-3 text-purple-400 flex-shrink-0" />
                    <span className="text-purple-400 text-xs font-medium">Wiederkehrend</span>
                  </div>
                )}
                <h4 className="text-white font-semibold text-sm truncate">
                  {transaction.title}
                </h4>
                {getRecurrenceIcon(transaction.recurrence)}
              </div>
              <p className="text-white/60 text-xs truncate">{transaction.category}</p>
              {transaction.assignedTo && (
                <div className="flex items-center gap-1 mt-1">
                  <Users className="w-3 h-3 text-turquoise-400 flex-shrink-0" />
                  <span className="text-turquoise-400 text-xs font-medium truncate">{assignedToName}</span> {/* Dynamischer Name */}
                </div>
              )}
            </div>
            <div className="text-right ml-2 flex-shrink-0">
              <p className={`font-bold text-sm ${
                transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
              }`}>
                {transaction.type === 'income' ? '+' : ''}{formatCurrency(Math.abs(transaction.amount), displayCurrency.value)}
              </p>
              {transaction.recurrence && transaction.recurrence !== 'none' && !isGeneratedRecurring && (
                <p className="text-purple-400 text-xs font-medium">
                  {getRecurrenceText(transaction.recurrence)}
                </p>
              )}
            </div>
          </div>

          {/* Date and status */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Calendar className="w-3 h-3 text-white/40 flex-shrink-0" />
              <span className="text-white/60 text-xs truncate">
                {transaction.date ? new Date(transaction.date).toLocaleDateString('de-AT') : 'Kein Datum'}
              </span>
              {effectiveStatus === 'overdue' && !isCompleted && (
                <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
                  Überfällig
                </span>
              )}
              {isBudgetTransaction && (
                <span className="bg-turquoise-500/20 text-turquoise-400 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
                  Budget-Zuteilung
                </span>
              )}
              {isCompleted && (
                <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
                  Erledigt
                </span>
              )}
            </div>
            
            {/* Action button - Complete/Unmark or nothing for budget transactions */}
            {!isBudgetTransaction && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isCompleted) {
                    handleUnmarkTransaction(transaction.id);
                  } else {
                    handleCompleteTransaction(transaction.id, transaction.title);
                  }
                }}
                className={`flex items-center gap-1 px-2 py-1 lg:px-3 lg:py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0 ${
                  isCompleted
                    ? 'bg-gradient-to-r from-orange-500/20 to-orange-400/20 hover:from-orange-500/30 hover:to-orange-400/30 text-orange-400'
                    : 'bg-gradient-to-r from-green-500/20 to-green-400/20 hover:from-green-500/30 hover:to-green-400/30 text-green-400'
                }`}
              >
                {isCompleted ? (
                  <>
                    <Undo className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="hidden sm:inline">{t('planning.undo')}</span>
                    <span className="sm:hidden">↶</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span className="hidden sm:inline">{t('planning.completed')}</span>
                    <span className="sm:hidden">✓</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Special information for different transaction types */}
          {isBudgetTransaction && (
            <div className="mt-2 pt-2 border-t border-turquoise-500/20">
              <p className="text-turquoise-400/80 text-xs">
                💡 Klicke hier, um das Budget zu bearbeiten
              </p>
            </div>
          )}
          
          {isGeneratedRecurring && (
            <div className="mt-2 pt-2 border-t border-purple-500/20">
              <p className="text-purple-400/80 text-xs">
                💡 Dies ist eine wiederkehrende Transaktion. Bearbeite das Original, um alle Instanzen zu ändern.
              </p>
            </div>
          )}
        </div>
      </GlassCard>
    );
  };

  const renderGroupedTransactionCard = (groupedTransaction: GroupedYearlyTransaction) => {
    // Dynamischer Name für assignedTo
    const assignedToName = groupedTransaction.assignedTo 
      ? availableMembers.find(m => m.id === groupedTransaction.assignedTo)?.name || groupedTransaction.assignedTo
      : '';

    return (
      <GlassCard 
        key={groupedTransaction.id}
        className={`mb-3 cursor-pointer hover:scale-[1.02] transition-all duration-200 p-4 ${
          groupedTransaction.isBudgetGroup ? 'border-turquoise-500/30 bg-turquoise-500/5' : ''
        }`}
        onClick={() => handleGroupedItemClick(groupedTransaction)}
      >
        <div className="space-y-3">
          {/* Header with title and amount */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {groupedTransaction.isBudgetGroup && (
                  <div className="flex items-center gap-1">
                    <PiggyBank className="w-3 h-3 text-turquoise-400 flex-shrink-0" />
                    <span className="text-turquoise-400 text-xs font-medium">Budget</span>
                  </div>
                )}
                <h4 className="text-white font-semibold text-sm truncate">
                  {groupedTransaction.title}
                </h4>
                {getRecurrenceIcon(groupedTransaction.recurrence)}
              </div>
              <p className="text-white/60 text-xs truncate">{groupedTransaction.category}</p>
              <p className="text-white/50 text-xs truncate">{groupedTransaction.description}</p>
              {groupedTransaction.assignedTo && (
                <div className="flex items-center gap-1 mt-1">
                  <Users className="w-3 h-3 text-turquoise-400 flex-shrink-0" />
                  <span className="text-turquoise-400 text-xs font-medium truncate">{assignedToName}</span> {/* Dynamischer Name */}
                </div>
              )}
            </div>
            <div className="text-right ml-2 flex-shrink-0">
              <p className={`font-bold text-sm ${
                groupedTransaction.type === 'income' ? 'text-green-400' : 'text-red-400'
              }`}>
                {groupedTransaction.type === 'income' ? '+' : ''}{formatCurrency(groupedTransaction.totalAmount, displayCurrency.value)}
              </p>
              <p className="text-white/60 text-xs">
                {groupedTransaction.transactionCount} Posten
              </p>
            </div>
          </div>

          {/* Click hint */}
          <div className="mt-2 pt-2 border-t border-white/10">
            <p className="text-turquoise-400/80 text-xs text-center">
              💡 Klicke hier für Details zu allen {groupedTransaction.transactionCount} Posten
            </p>
          </div>
        </div>
      </GlassCard>
    );
  };

  const renderColumn = (
    title: string,
    transactions: Transaction[] | GroupedYearlyTransaction[],
    summary: { income: number; expenses: number; net: number },
    icon: React.ReactNode,
    accentColor: string,
    isCompletedColumn: boolean = false,
    renderGroupedCards: boolean = false
  ) => (
    <div className="min-w-[280px] sm:min-w-[320px] flex-shrink-0 flex flex-col h-full">
      <div className="bg-zinc-800/30 backdrop-blur-md rounded-2xl p-3 sm:p-4 h-full flex flex-col min-h-[500px]">
        {/* Column header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-shrink-0">
          <div className={`p-1.5 sm:p-2 rounded-xl ${accentColor}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-base sm:text-lg truncate">{title}</h2>
            <p className="text-white/60 text-xs sm:text-sm">{transactions.length} Posten</p>
          </div>
        </div>

        {/* Column summary */}
        <div className="bg-white/5 rounded-xl p-2 sm:p-3 mb-3 sm:mb-4 flex-shrink-0">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-green-400 font-medium">+{formatCurrency(summary.income, displayCurrency.value)}</p>
              <p className="text-white/60">Einkommen</p>
            </div>
            <div>
              <p className="text-red-400 font-medium">-{formatCurrency(summary.expenses, displayCurrency.value)}</p>
              <p className="text-white/60">Ausgaben</p>
            </div>
          </div>
          <div className="border-t border-white/10 mt-2 pt-2">
            <p className={`font-bold text-sm ${summary.net >= 0 ? 'text-turquoise-400' : 'text-red-400'}`}>
              Netto: {summary.net >= 0 ? '+' : ''}{formatCurrency(summary.net, displayCurrency.value)}
            </p>
          </div>
        </div>

        {/* Transaction cards - scrollable area */}
        <div className="flex-1 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/40 text-sm">
                {searchTerm ? t('planning.noSearchResults') : t('planning.noItems')}
              </p>
              {searchTerm && (
                <p className="text-white/30 text-xs mt-1">
                  {t('planning.tryDifferentSearch')}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map(transaction => 
                renderGroupedCards 
                  ? renderGroupedTransactionCard(transaction as GroupedYearlyTransaction)
                  : renderTransactionCard(transaction as Transaction, isCompletedColumn)
              )}
            </div>
          )}
        </div>

        {/* Add Transaction Button - only for non-completed columns */}
        {!isCompletedColumn && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10 flex-shrink-0">
            <button
              onClick={() => onAddTransaction()}
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] group"
            >
              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Transaktion hinzufügen</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const householdFamily = families.find(f => f.name === 'Haushalt'); // Finde die Haushalt-Familie dynamisch

  return (
    <div className="space-y-8 pb-24">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${selectedMember.color} rounded-2xl flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-lg`}>
            {selectedMember.avatar}
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1">Planung</h1>
            <p className="text-white/70 text-sm sm:text-lg">
              {getSubtitle()}
            </p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-white/60 text-sm">Heute</p>
          <p className="text-white font-semibold text-lg">{new Date().toLocaleDateString('de-AT', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}</p>
        </div>
      </div>

      {/* Family Member Selector */}
      <FamilyMemberSelector 
        selectedMemberId={selectedMemberId}
        onMemberChange={onMemberChange}
        // Übergabe der dynamischen Mitglieder an den Selector
        members={availableMembers.map(member => ({
          id: member.id,
          name: member.name,
          avatar: member.avatar,
          color: member.color
        }))}
      />

      {/* Search Bar */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-turquoise-500 focus:border-transparent"
            placeholder={t('placeholders.search')}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-white/60">{t('planning.searchFor')}</span>
            <span className="bg-turquoise-500/20 text-turquoise-400 px-2 py-1 rounded-full font-medium">
              "{searchTerm}"
            </span>
            <span className="text-white/40">
              ({filteredTransactions.length} {t('planning.searchResults', { count: filteredTransactions.length })})
            </span>
          </div>
        )}
      </div>

      {/* Quick Add Bar */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-turquoise-400" />
            <span className="text-white font-medium">{t('planning.quickAdd')}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onAddTransaction({ type: 'income' })}
              className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              {t('planning.addIncome')}
            </button>
            <button
              onClick={() => onAddTransaction({ type: 'expense' })}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              {t('planning.addExpense')}
            </button>
            <button
              onClick={() => onAddTransaction({ recurrence: 'monthly' })}
              className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              {t('planning.addRecurring')}
            </button>
          </div>
        </div>
      </div>

      {/* Board columns - horizontal scrolling layout */}
      <div className="flex overflow-x-auto gap-3 sm:gap-6 pb-4 -webkit-overflow-scrolling-touch">
        {renderColumn(
          t('planning.columns.backlog'),
          backlogTransactions,
          backlogSummary,
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />,
          'bg-red-500/10'
        )}
        
        {renderColumn(
          t('planning.columns.thisMonth'),
          thisMonthTransactions,
          thisMonthSummary,
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-turquoise-400" />,
          'bg-turquoise-500/10'
        )}
        
        {renderColumn(
          t('planning.columns.nextMonth'),
          nextMonthTransactions,
          nextMonthSummary,
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />,
          'bg-blue-500/10'
        )}
        
        {renderColumn(
          t('planning.columns.thisYear'),
          thisYearGroupedTransactions,
          thisYearSummary,
          <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />,
          'bg-yellow-500/10',
          false,
          true // Enable grouped cards rendering
        )}
        
        {renderColumn(
          t('planning.columns.someday'),
          somedayTransactions,
          somedaySummary,
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />,
          'bg-purple-500/10'
        )}

        {renderColumn(
          t('planning.columns.completed'),
          completedTransactions,
          completedSummary,
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />,
          'bg-green-500/10',
          true
        )}
      </div>

      {/* Complete Transaction Modal */}
      <CompleteTransactionModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        onConfirm={handleConfirmComplete}
        transactionTitle={selectedTransactionTitle}
      />

      {/* Grouped Transaction Detail Modal */}
      <GroupedTransactionDetailModal
        isOpen={isGroupDetailModalOpen}
        onClose={() => setIsGroupDetailModalOpen(false)}
        groupedTransaction={selectedGroupedItem}
      />
    </div>
  );
};