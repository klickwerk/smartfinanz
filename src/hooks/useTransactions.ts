import { useState, useMemo, useEffect } from 'react';
import { Transaction, Budget } from '../types';
import { transactionService } from '../services/TransactionService';
import { useAuth } from '../context/AuthContext';

export const useTransactions = (budgets: Budget[]) => {
  const { user } = useAuth();
  
  // Local state to trigger re-renders when service state changes
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Force component re-render when service state changes
  const triggerUpdate = () => setUpdateTrigger(prev => prev + 1);

  // Fetch transactions when user changes
  useEffect(() => {
    const fetchUserTransactions = async () => {
      if (!user?.id) {
        // Clear transactions if no user
        transactionService.setTransactions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        await transactionService.fetchTransactions(user.id);
        triggerUpdate();
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserTransactions();
  }, [user?.id]);

  // Get current state from service
  const transactions = transactionService.getTransactions();
  const completedGeneratedIds = transactionService.getCompletedGeneratedIds();

  // Generate all transactions including recurring ones and budget transactions
  const allTransactions = useMemo(() => {
    return transactionService.generateAllTransactions(budgets);
  }, [budgets, updateTrigger]);

  const handleAddTransaction = async (newTransaction: Omit<Transaction, 'id'>) => {
    if (!user?.id) return;
    
    const result = await transactionService.addTransaction(newTransaction, user.id);
    if (result) {
      triggerUpdate();
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    return transactionService.getEditableTransaction(transaction);
  };

  const handleUpdateTransaction = async (transactionId: string, updatedTransaction: Omit<Transaction, 'id'>) => {
    if (!user?.id) return;
    
    const success = await transactionService.updateTransaction(transactionId, updatedTransaction, user.id);
    if (success) {
      triggerUpdate();
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user?.id) return;
    
    const success = await transactionService.deleteTransaction(transactionId, user.id);
    if (success) {
      triggerUpdate();
    }
  };

  const handleMarkCompleted = async (transactionId: string, completedDate: string) => {
    if (!user?.id) return;
    
    const transaction = allTransactions.find(t => t.id === transactionId);
    if (!transaction) return;

    if (transaction.generatedFrom) {
      // For generated recurring transactions, just mark in memory
      transactionService.markCompleted(transactionId, completedDate, allTransactions);
      triggerUpdate();
    } else {
      // For original transactions, update in database
      const updatedTransaction = {
        ...transaction,
        status: 'completed' as const,
        completedDate
      };
      await handleUpdateTransaction(transactionId, updatedTransaction);
    }
  };

  const handleUnmarkCompleted = async (transactionId: string) => {
    if (!user?.id) return;
    
    const transaction = allTransactions.find(t => t.id === transactionId);
    if (!transaction) return;

    if (transaction.generatedFrom) {
      // For generated recurring transactions, just unmark in memory
      transactionService.unmarkCompleted(transactionId, allTransactions);
      triggerUpdate();
    } else {
      // For original transactions, update in database
      // Determine new status based on date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let transactionDate = null;
      if (transaction.date) {
        transactionDate = new Date(`${transaction.date}T00:00:00`);
      }
      
      let newStatus: Transaction['status'] = 'pending';
      if (transactionDate && transactionDate < today) {
        newStatus = 'overdue';
      } else if (!transaction.date) {
        newStatus = 'someday';
      }

      const updatedTransaction = {
        ...transaction,
        status: newStatus,
        completedDate: undefined
      };
      await handleUpdateTransaction(transactionId, updatedTransaction);
    }
  };

  return {
    transactions,
    allTransactions,
    completedGeneratedIds,
    isLoading,
    handleAddTransaction,
    handleEditTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction,
    handleMarkCompleted,
    handleUnmarkCompleted
  };
};