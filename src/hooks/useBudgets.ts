import { useState, useEffect } from 'react';
import { Budget } from '../types';
import { budgetService } from '../services/BudgetService';
import { useAuth } from '../context/AuthContext';

export const useBudgets = () => {
  const { user } = useAuth();
  
  // Local state to trigger re-renders when service state changes
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Force component re-render when service state changes
  const triggerUpdate = () => setUpdateTrigger(prev => prev + 1);

  // Fetch budgets when user changes
  useEffect(() => {
    const fetchUserBudgets = async () => {
      if (!user?.id) {
        // Clear budgets if no user
        budgetService.setBudgets([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        await budgetService.fetchBudgets(user.id);
        triggerUpdate();
      } catch (error) {
        console.error('Error fetching budgets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserBudgets();
  }, [user?.id]);

  // Get current state from service
  const budgets = budgetService.getBudgets();

  const handleAddBudget = async (newBudget: Omit<Budget, 'id'>) => {
    if (!user?.id) return;
    
    const result = await budgetService.addBudget(newBudget, user.id);
    if (result) {
      triggerUpdate();
    }
  };

  const handleEditBudget = async (budgetId: string, updatedBudget: Omit<Budget, 'id'>) => {
    if (!user?.id) return;
    
    const success = await budgetService.updateBudget(budgetId, updatedBudget, user.id);
    if (success) {
      triggerUpdate();
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!user?.id) return;
    
    const success = await budgetService.deleteBudget(budgetId, user.id);
    if (success) {
      triggerUpdate();
    }
  };

  const handleAddSpentToBudget = async (budgetId: string, amount: number) => {
    if (!user?.id) return;
    
    const success = await budgetService.addSpentToBudget(budgetId, amount, user.id);
    if (success) {
      triggerUpdate();
    }
  };

  const handleToggleBudgetActive = async (budgetId: string) => {
    if (!user?.id) return;
    
    const success = await budgetService.toggleBudgetActive(budgetId, user.id);
    if (success) {
      triggerUpdate();
    }
  };

  return {
    budgets,
    isLoading,
    handleAddBudget,
    handleEditBudget,
    handleDeleteBudget,
    handleAddSpentToBudget,
    handleToggleBudgetActive
  };
};