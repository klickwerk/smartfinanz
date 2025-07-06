import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useFamily } from './hooks/useFamily';
import { useTransactions } from './hooks/useTransactions';
import { AuthModal } from './components/auth/AuthModal';
import { FamilySetupModal } from './components/family/FamilySetupModal';
import { Dashboard } from './components/dashboard/Dashboard';
import { FinancialBoard } from './components/board/FinancialBoard';
import { FinancialProjects } from './components/projects/FinancialProjects';
import { TransactionsList } from './components/transactions/TransactionsList';
import { Settings } from './components/settings/Settings';
import { TransactionForm } from './components/transactions/TransactionForm';
import { BottomNavigation } from './components/navigation/BottomNavigation';
import { FloatingActionButton } from './components/navigation/FloatingActionButton';
import { Transaction } from './types';

function App() {
  const { user, profile, loading: authLoading } = useAuth();
  const { family, loading: familyLoading } = useFamily();
  const { 
    transactions, 
    addTransaction, 
    updateTransaction, 
    markCompleted 
  } = useTransactions();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFamilySetupModalOpen, setIsFamilySetupModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();

  // Show loading screen while checking auth
  if (authLoading || familyLoading) {
    console.log('App loading state:', { authLoading, familyLoading, user: !!user, profile: !!profile });
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-turquoise-500/20 border-t-turquoise-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">
            Wird geladen... 
            {authLoading && ' (Authentifizierung)'}
            {familyLoading && ' (Familie)'}
          </p>
          <p className="text-white/40 text-xs mt-2">
            User: {user ? '✓' : '✗'} | Profile: {profile ? '✓' : '✗'}
          </p>
        </div>
      </div>
    );
  }

  // Show auth modal if not authenticated
  if (!user) {
    console.log('No user found, showing auth modal');
    return (
      <>
        <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-zinc-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">FinanzApp</h1>
            <p className="text-white/60 mb-8">Intelligente Finanzplanung für Familien</p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white font-semibold py-4 px-8 rounded-xl hover:from-turquoise-600 hover:to-turquoise-500 transition-all duration-200"
            >
              Jetzt starten
            </button>
          </div>
        </div>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </>
    );
  }

  // Show family setup if user has no family
  if (!profile?.family_id) {
    console.log('User has no family, showing family setup:', { profile });
    return (
      <>
        <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-zinc-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Willkommen, {profile?.full_name || 'Nutzer'}!</h1>
            <p className="text-white/60 mb-8">Erstelle oder tritt einer Familie bei, um zu beginnen.</p>
            <button
              onClick={() => setIsFamilySetupModalOpen(true)}
              className="bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white font-semibold py-4 px-8 rounded-xl hover:from-turquoise-600 hover:to-turquoise-500 transition-all duration-200"
            >
              Familie erstellen
            </button>
          </div>
        </div>
        <FamilySetupModal 
          isOpen={isFamilySetupModalOpen} 
          onClose={() => setIsFamilySetupModalOpen(false)} 
        />
      </>
    );
  }

  const handleAddTransaction = async (newTransaction: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      // Update existing transaction
      await updateTransaction(editingTransaction.id, newTransaction);
      setEditingTransaction(undefined);
    } else {
      // Add new transaction
      await addTransaction(newTransaction);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleMarkCompleted = async (transactionId: string) => {
    await markCompleted(transactionId);
  };

  const handleCloseModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(undefined);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} />;
      case 'board':
        return (
          <FinancialBoard
            transactions={transactions}
            onEditTransaction={handleEditTransaction}
            onMarkCompleted={handleMarkCompleted}
            onAddTransaction={() => setIsTransactionModalOpen(true)}
          />
        );
      case 'projects':
        return <FinancialProjects />;
      case 'transactions':
        return <TransactionsList transactions={transactions} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard transactions={transactions} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-zinc-900">
      <div className="container mx-auto px-6 py-8 max-w-md">
        {renderContent()}
      </div>

      <FloatingActionButton onClick={() => setIsTransactionModalOpen(true)} />
      
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {isTransactionModalOpen && (
        <TransactionForm
          onClose={handleCloseModal}
          onSubmit={handleAddTransaction}
          editTransaction={editingTransaction}
        />
      )}
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <FamilySetupModal 
        isOpen={isFamilySetupModalOpen} 
        onClose={() => setIsFamilySetupModalOpen(false)} 
      />
    </div>
  );
}

export default App;