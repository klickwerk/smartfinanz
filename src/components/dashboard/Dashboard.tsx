import React, { useMemo } from 'react'; // Removed useState as it's not directly used for state in this snippet
import { OverdueItemsCard } from './OverdueItemsCard';
import { MonthlyOverviewCard } from './MonthlyOverviewCard';
import { YearlyProjectionCard } from './YearlyProjectionCard';
import { NextMonthlyOverviewCard } from './NextMonthlyOverviewCard';
import { getCurrentDateInfo } from '../../utils/dateUtils';
import { Transaction, FinancialProject } from '../../types';
import { transactionService } from '../../services/TransactionService';
import { FamilyMemberSelector } from '../common/FamilyMemberSelector';
import { usePermissions } from '../../context/PermissionsContext';

// Neue Imports für dynamische Daten
import { useAuth } from '../../context/AuthContext';
import { useFamilyMemberships } from '../../hooks/useFamilyMemberships'; // Dein neuer Hook

interface DashboardProps {
  allTransactions: Transaction[];
  completedGeneratedIds: Set<string>;
  selectedMemberId: string;
  onMemberChange: (memberId: string) => void;
  projects: FinancialProject[];
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  allTransactions, 
  completedGeneratedIds, 
  selectedMemberId, 
  onMemberChange,
  projects
}) => {
  const { user } = useAuth(); // Aktueller Benutzer aus dem AuthContext
  const { familyMemberships, families } = useFamilyMemberships(); // Dynamische Familien- und Mitgliedsdaten
  const { currentUser } = usePermissions(); // Annahme: currentUser ist ein Objekt mit 'name' und 'id'

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

  // Get current selected member (dynamisch)
  const selectedMember = availableMembers.find(member => member.id === selectedMemberId) || availableMembers[0];

  // Generate subtitle based on selected member (dynamisch)
  const getSubtitle = () => {
    switch (selectedMemberId) {
    
      case 'overall':
        return 'Hier ist eure finanzielle Übersicht';
      case householdFamily?.id: // Prüfe gegen die tatsächliche ID der Haushalt-Familie
        return 'Hier ist unser Haushalt';
      case user?.id: // Wenn der aktuell angemeldete Benutzer ausgewählt ist
        return 'Deine finanzielle Übersicht';
      default:
        // Für andere Familienmitglieder
        const member = availableMembers.find(m => m.id === selectedMemberId);
        if (member && member.name) {
          const possessiveName = member.name.endsWith('s') ? `${member.name}'` : `${member.name}s`;
          return `Das ist ${possessiveName} Übersicht`;
        }
        return 'Hier ist die finanzielle Übersicht';
    }
  };
  
  const overdueTransactions = allTransactions.filter(t => {
    const effectiveStatus = transactionService.getEffectiveStatus(t);
    return effectiveStatus === 'overdue';
  });
  
  // Calculate yearly data dynamically
  const { currentYear, currentMonth, nextMonth, nextMonthYear } = getCurrentDateInfo();
  const yearlyData = transactionService.calculateYearlyData(allTransactions, currentYear);
  
  // Calculate monthly data dynamically
  const currentMonthSummary = transactionService.calculateMonthlySummary(allTransactions, currentYear, currentMonth);
  const nextMonthSummary = transactionService.calculateMonthlySummary(allTransactions, nextMonthYear, nextMonth);

  // Calculate quick stats with projects data
  const quickStats = transactionService.calculateQuickStats(allTransactions, projects);

  // Create next month data with proper month name
  const nextMonthData = {
    month: new Date(nextMonthYear, nextMonth).toLocaleDateString('de-AT', { month: 'short' }) || 'Nächster Monat',
    ...nextMonthSummary
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${selectedMember.color} rounded-2xl flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-lg`}>
            {selectedMember.avatar}
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1">
              Hallo {currentUser?.name || user?.email || 'Gast'}! 👋 {/* Nutze currentUser.name oder user.email */}
            </h1>
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

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {overdueTransactions.length > 0 && (
          <div className="lg:col-span-2 xl:col-span-1">
            <OverdueItemsCard overdueTransactions={overdueTransactions} />
          </div>
        )}
        
        <div className={overdueTransactions.length > 0 ? "lg:col-span-2 xl:col-span-1" : "lg:col-span-1"}>
          <MonthlyOverviewCard monthlyData={currentMonthSummary} />
        </div>
        
        <div className={overdueTransactions.length > 0 ? "lg:col-span-2 xl:col-span-1" : "lg:col-span-1"}>
          <NextMonthlyOverviewCard nextMonthData={nextMonthData} />
        </div>
      </div>

      {/* Yearly Projection Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <YearlyProjectionCard yearlyData={yearlyData} projects={projects} />
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-white/60 text-sm mb-1">Diesen Monat</p>
            <p className="text-green-400 font-bold text-xl">+€{quickStats.thisMonthIncome.toLocaleString('de-AT')}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-white/60 text-sm mb-1">Geplante Ausgaben</p>
            <p className="text-red-400 font-bold text-xl">-€{quickStats.plannedExpenses.toLocaleString('de-AT')}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-white/60 text-sm mb-1">Überschuss</p>
            <p className="text-turquoise-400 font-bold text-xl">€{quickStats.saved.toLocaleString('de-AT')}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-white/60 text-sm mb-1">Sparziele</p>
            <p className="text-purple-400 font-bold text-xl">{quickStats.activeSavingGoals} aktiv</p>
          </div>
        </div>
      </div>
    </div>
  );
};
