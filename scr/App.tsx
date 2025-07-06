import React, { useState } from 'react';
import { Dashboard } from './components/dashboard/Dashboard';
import { FinancialBoard } from './components/board/FinancialBoard';
import { FinancialProjects } from './components/projects/FinancialProjects';
import { TransactionsList } from './components/transactions/TransactionsList';
import { Settings } from './components/settings/Settings';
import { TransactionForm } from './components/transactions/TransactionForm';
import { BottomNavigation } from './components/navigation/BottomNavigation';
import { FloatingActionButton } from './components/navigation/FloatingActionButton';
import { mockTransactions } from './data/mockData';
import { Transaction } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);

  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      // Update existing transaction
      setTransactions(prev => prev.map(t => 
        t.id === editingTransaction.id 
          ? { ...newTransaction, id: editingTransaction.id }
          : t
      ));
      setEditingTransaction(undefined);
    } else {
      // Add new transaction
      const transaction: Transaction = {
        ...newTransaction,
        id: Date.now().toString()
      };
      setTransactions(prev => [transaction, ...prev]);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleMarkCompleted = (transactionId: string) => {
    setTransactions(prev => prev.map(t => 
      t.id === transactionId 
        ? { ...t, status: 'completed' as const }
        : t
    ));
  };

  const handleCloseModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(undefined);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
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
        return <Dashboard />;
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
    </div>
  );
}

export default App;