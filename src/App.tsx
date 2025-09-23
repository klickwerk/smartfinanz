import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/dashboard/Dashboard';
import { PlanningBoard } from './components/planung/PlanningBoard';
import { FinancialProjects } from './components/projects/FinancialProjects';
import { TransactionsList } from './components/transactions/TransactionsList';
import { Settings } from './components/settings/Settings';
import { TransactionForm } from './components/transactions/TransactionForm';
import { AuthForm } from './components/auth/AuthForm';
import { BottomNavigation } from './components/navigation/BottomNavigation';
import { AuthProvider, useAuth } from './context/AuthContext';
import { supabase } from './lib/supabaseClient';
import { Transaction } from './types';

// Main App Content (wrapped in AuthProvider)
const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  // Load transactions when user is logged in
  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;
    
    setTransactionsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading transactions:', error);
      } else {
        // Transform database data to match our Transaction type
        const transformedTransactions: Transaction[] = data?.map(t => ({
          id: t.id,
          title: t.title,
          amount: t.amount,
          category: t.category,
          date: t.date || new Date().toISOString().split('T')[0],
          type: t.type as 'income' | 'expense',
          currency: t.currency as 'EUR' | 'USD' | 'CHF',
          status: t.status as 'completed' | 'pending' | 'overdue' | 'someday',
          description: t.description || undefined,
          tags: t.tags || undefined
        })) || [];
        
        setTransactions(transformedTransactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
    setTransactionsLoading(false);
  };

  const handleAddTransaction = async (newTransaction: Omit<Transaction, 'id'>) => {
    if (!user) return;

    try {
      if (editingTransaction) {
        // Update existing transaction
        const { error } = await supabase
          .from('transactions')
          .update({
            title: newTransaction.title,
            amount: newTransaction.amount,
            category: newTransaction.category,
            date: newTransaction.date,
            type: newTransaction.type,
            currency: newTransaction.currency,
            status: newTransaction.status,
            description: newTransaction.description || null,
            tags: newTransaction.tags || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTransaction.id);

        if (error) {
          console.error('Error updating transaction:', error);
          alert('Fehler beim Aktualisieren der Transaktion');
          return;
        }

        // Update local state
        setTransactions(prev => prev.map(t => 
          t.id === editingTransaction.id 
            ? { ...newTransaction, id: editingTransaction.id }
            : t
        ));
        setEditingTransaction(undefined);
      } else {
        // Add new transaction
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            title: newTransaction.title,
            amount: newTransaction.amount,
            category: newTransaction.category,
            date: newTransaction.date,
            type: newTransaction.type,
            currency: newTransaction.currency,
            status: newTransaction.status,
            description: newTransaction.description || null,
            tags: newTransaction.tags || null,
            created_by: user.id,
            // family_id: null // TODO: Add family support later
          })
          .select()
          .single();

        if (error) {
          console.error('Error adding transaction:', error);
          alert('Fehler beim Hinzufügen der Transaktion');
          return;
        }

        // Transform and add to local state
        if (data) {
          const transformedTransaction: Transaction = {
            id: data.id,
            title: data.title,
            amount: data.amount,
            category: data.category,
            date: data.date || new Date().toISOString().split('T')[0],
            type: data.type as 'income' | 'expense',
            currency: data.currency as 'EUR' | 'USD' | 'CHF',
            status: data.status as 'completed' | 'pending' | 'overdue' | 'someday',
            description: data.description || undefined,
            tags: data.tags || undefined
          };
          
          setTransactions(prev => [transformedTransaction, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error in handleAddTransaction:', error);
      alert('Ein unerwarteter Fehler ist aufgetreten');
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleMarkCompleted = async (transactionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .update({ 
          status: 'completed',
          completed_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (error) {
        console.error('Error marking transaction as completed:', error);
        alert('Fehler beim Markieren der Transaktion');
        return;
      }

      // Update local state
      setTransactions(prev => prev.map(t => 
        t.id === transactionId 
          ? { ...t, status: 'completed' as const }
          : t
      ));
    } catch (error) {
      console.error('Error in handleMarkCompleted:', error);
    }
  };

  const handleCloseModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(undefined);
  };

  const renderContent = () => {
    if (transactionsLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-center">
            <div className="animate-spin w-8 h-8 border-4 border-turquoise-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Lade Transaktionen...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} />;
      case 'board':
        return (
          <PlanningBoard
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

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-zinc-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-4 border-turquoise-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Lade App...</p>
        </div>
      </div>
    );
  }

  // Show auth form if not logged in
  if (!user) {
    return <AuthForm />;
  }

  // Show main app if logged in
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-black to-zinc-900">
      <div className="container mx-auto px-6 py-8 max-w-md">
        {renderContent()}
      </div>

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
    </div>
  );
};

// Main App Component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;