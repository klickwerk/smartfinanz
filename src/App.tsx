import React, { useState, useMemo, useEffect } from 'react';
import { Dashboard } from './components/dashboard/Dashboard';
import { PlanningBoard } from './components/planung/PlanningBoard';
import { FinancialProjects } from './components/projects/FinancialProjects';
import { Budgets } from './components/budgets/Budgets';
import { Settings } from './components/settings/Settings';
import { TransactionForm } from './components/transactions/TransactionForm';
import { BudgetForm } from './components/budgets/BudgetForm';
import { BottomNavigation } from './components/navigation/BottomNavigation';
import { AuthForm } from './components/auth/AuthForm';
import { LoadingScreen } from './components/auth/LoadingScreen';
import { FAMILY_MEMBERS, getMemberNameById } from './constants/familyMembers';
import { useTheme } from './context/ThemeContext';
import { useDefaultView } from './context/DefaultViewContext';
import { useAuth } from './context/AuthContext';
import { usePermissions } from './context/PermissionsContext';
import { useTransactions } from './hooks/useTransactions';
import { useBudgets } from './hooks/useBudgets';
import { useProjects } from './hooks/useProjects';
import { useModals } from './hooks/useModals';
import { useModalScrollLock } from './hooks/useModalScrollLock';

interface TransactionPreset {
  type?: 'income' | 'expense';
  recurrence?: 'none' | 'monthly' | 'quarterly' | 'yearly';
}

function App() {
  // Authentication state
  const { user, loading: authLoading } = useAuth();
  
  // Get user's family context
  const { userFamilyId } = usePermissions();

  // Initialize activeTab with default view from context
  const { defaultView } = useDefaultView();
  const [activeTab, setActiveTab] = useState(defaultView);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('overall');

  // Get active theme from context
  const { activeTheme } = useTheme();

  // Use custom hooks for state management
  const { budgets, handleAddBudget, handleEditBudget, handleDeleteBudget } = useBudgets();
  
  const { 
    allTransactions, 
    completedGeneratedIds, 
    handleAddTransaction, 
    handleEditTransaction, 
    handleUpdateTransaction,
    handleDeleteTransaction, 
    handleMarkCompleted, 
    handleUnmarkCompleted 
  } = useTransactions(budgets);
  
  const { 
    projects, 
    handleAddProject, 
    handleEditProject, 
    handleDeleteProject, 
    handleTransferToProject 
  } = useProjects();

  const {
    isTransactionModalOpen,
    editingTransaction,
    transactionPreset,
    handleOpenTransactionModal,
    handleCloseTransactionModal,
    isBudgetModalOpen,
    editingBudget,
    handleOpenBudgetModal,
    handleCloseBudgetModal
  } = useModals();

  // Filter transactions based on selected family member - MOVED TO TOP LEVEL
  const filteredTransactions = useMemo(() => {
    if (selectedMemberId === 'overall') {
      return allTransactions;
    }

    if (selectedMemberId === 'house') {
      return allTransactions.filter(transaction => 
        transaction.assignedTo === 'Haus'
      );
    }

    // Get the member name from the ID using the centralized function
    const memberName = getMemberNameById(selectedMemberId);
    if (!memberName) return allTransactions;

    return allTransactions.filter(transaction => 
      transaction.assignedTo === memberName
    );
  }, [allTransactions, selectedMemberId]);

  // Determine if any modal is open to lock scrolling
  const isAnyModalOpen = isTransactionModalOpen || isBudgetModalOpen;
  
  // Use the scroll lock hook
  useModalScrollLock(isAnyModalOpen);

  // Show loading screen while authentication is being checked
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Show auth form if user is not authenticated
  if (!user) {
    return <AuthForm />;
  }

  const handleTransactionSubmit = (newTransaction: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      // Update existing transaction
      handleUpdateTransaction(editingTransaction.id, newTransaction);
    } else {
      // Add new transaction
      handleAddTransaction(newTransaction);
    }
  };

  const handleBudgetSubmit = (newBudget: Omit<Budget, 'id'>) => {
    if (editingBudget) {
      // Update existing budget
      handleEditBudget(editingBudget.id, newBudget);
    } else {
      // Add new budget
      handleAddBudget(newBudget);
    }
  };

  const handleEditTransactionClick = (transaction: Transaction) => {
    const editableTransaction = handleEditTransaction(transaction);
    if (editableTransaction) {
      handleOpenTransactionModal(undefined, editableTransaction);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            allTransactions={filteredTransactions} 
            completedGeneratedIds={completedGeneratedIds}
            selectedMemberId={selectedMemberId}
            onMemberChange={setSelectedMemberId}
            projects={projects}
          />
        );
      case 'planung':
        return (
          <PlanningBoard
            allTransactions={filteredTransactions}
            completedGeneratedIds={completedGeneratedIds}
            budgets={budgets}
            onEditTransaction={handleEditTransactionClick}
            onEditBudget={handleEditBudget}
            onMarkCompleted={handleMarkCompleted}
            onUnmarkCompleted={handleUnmarkCompleted}
            onAddTransaction={handleOpenTransactionModal}
            selectedMemberId={selectedMemberId}
            onMemberChange={setSelectedMemberId}
          />
        );
      case 'budgets':
        return (
          <Budgets 
            budgets={budgets}
            onAddBudget={handleAddBudget}
            onEditBudget={handleEditBudget}
            onDeleteBudget={handleDeleteBudget}
            onOpenBudgetModal={handleOpenBudgetModal}
          />
        );
      case 'projects':
        return (
          <FinancialProjects 
            projects={projects}
            onAddProject={handleAddProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
            onTransferToProject={handleTransferToProject}
            selectedMemberId={selectedMemberId}
            onMemberChange={setSelectedMemberId}
          />
        );
      case 'settings':
        return <Settings />;
      default:
        return (
          <Dashboard 
            allTransactions={filteredTransactions} 
            completedGeneratedIds={completedGeneratedIds}
            selectedMemberId={selectedMemberId}
            onMemberChange={setSelectedMemberId}
            projects={projects}
          />
        );
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Dynamic Parallax Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center z-0 transition-all duration-500"
        style={{
          backgroundImage: `url(${activeTheme.backgroundImage})`,
          backgroundAttachment: 'fixed'
        }}
      />
      
      {/* Dynamic Dark Overlay for Better Readability */}
      <div className={`fixed inset-0 bg-gradient-to-b ${activeTheme.gradientFrom} ${activeTheme.gradientVia} ${activeTheme.gradientTo} z-10 transition-all duration-500`} />
      
      {/* Main Content */}
      <div className="relative z-20">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {renderContent()}
        </div>

        <BottomNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {isTransactionModalOpen && (
          <TransactionForm
            onClose={handleCloseTransactionModal}
            onSubmit={handleTransactionSubmit}
            onDelete={handleDeleteTransaction}
            editTransaction={editingTransaction}
            preset={transactionPreset}
            userFamilyId={userFamilyId}
          />
        )}

        {isBudgetModalOpen && (
          <BudgetForm
            onClose={handleCloseBudgetModal}
            onSubmit={handleBudgetSubmit}
            onDelete={handleDeleteBudget}
            editBudget={editingBudget}
            selectedMemberId={selectedMemberId}
          />
        )}
      </div>
    </div>
  );
}

export default App;