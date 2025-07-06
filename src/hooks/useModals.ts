import { useState } from 'react';
import { Transaction, Budget } from '../types';

interface TransactionPreset {
  type?: 'income' | 'expense';
  recurrence?: 'none' | 'monthly' | 'quarterly' | 'yearly';
}

export const useModals = () => {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>();
  const [transactionPreset, setTransactionPreset] = useState<TransactionPreset | undefined>();

  const handleOpenTransactionModal = (preset?: TransactionPreset, transaction?: Transaction) => {
    setTransactionPreset(preset);
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleCloseTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(undefined);
    setTransactionPreset(undefined);
  };

  const handleOpenBudgetModal = (budget?: Budget) => {
    setEditingBudget(budget);
    setIsBudgetModalOpen(true);
  };

  const handleCloseBudgetModal = () => {
    setIsBudgetModalOpen(false);
    setEditingBudget(undefined);
  };

  return {
    // Transaction modal state
    isTransactionModalOpen,
    editingTransaction,
    transactionPreset,
    handleOpenTransactionModal,
    handleCloseTransactionModal,
    
    // Budget modal state
    isBudgetModalOpen,
    editingBudget,
    handleOpenBudgetModal,
    handleCloseBudgetModal
  };
};