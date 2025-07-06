import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Transaction } from '../types';
import { useAuth } from './useAuth';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.family_id) {
      fetchTransactions();
      subscribeToTransactions();
    }
  }, [profile?.family_id]);

  const fetchTransactions = async () => {
    if (!profile?.family_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('family_id', profile.family_id)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToTransactions = () => {
    if (!profile?.family_id) return;

    const subscription = supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `family_id=eq.${profile.family_id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTransactions(prev => [payload.new as Transaction, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTransactions(prev =>
              prev.map(t => t.id === payload.new.id ? payload.new as Transaction : t)
            );
          } else if (payload.eventType === 'DELETE') {
            setTransactions(prev => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'family_id' | 'user_id'>) => {
    if (!profile?.family_id || !profile?.id) {
      throw new Error('User not authenticated or not in a family');
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        family_id: profile.family_id,
        user_id: profile.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const markCompleted = async (id: string) => {
    return updateTransaction(id, { status: 'completed' });
  };

  // Filter functions
  const getOverdueTransactions = () => {
    return transactions.filter(t => t.status === 'overdue');
  };

  const getTransactionsByStatus = (status: Transaction['status']) => {
    return transactions.filter(t => t.status === status);
  };

  const getTransactionsByDateRange = (startDate: string, endDate: string) => {
    return transactions.filter(t => t.date >= startDate && t.date <= endDate);
  };

  const getTransactionsByCategory = (category: string) => {
    return transactions.filter(t => t.category === category);
  };

  const searchTransactions = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return transactions.filter(t =>
      t.title.toLowerCase().includes(lowercaseQuery) ||
      t.category.toLowerCase().includes(lowercaseQuery) ||
      t.description?.toLowerCase().includes(lowercaseQuery) ||
      t.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  // Calculate monthly data
  const getMonthlyData = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const months = [];

    for (let i = 0; i < 6; i++) {
      const month = new Date(currentYear, now.getMonth() - i, 1);
      const monthStart = month.toISOString().split('T')[0];
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const monthTransactions = getTransactionsByDateRange(monthStart, monthEnd);
      const income = monthTransactions
        .filter(t => t.type === 'income' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = monthTransactions
        .filter(t => t.type === 'expense' && t.status === 'completed')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      months.unshift({
        month: month.toLocaleDateString('de-AT', { month: 'short' }),
        income,
        expenses,
        balance: income - expenses,
      });
    }

    return months;
  };

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    markCompleted,
    getOverdueTransactions,
    getTransactionsByStatus,
    getTransactionsByDateRange,
    getTransactionsByCategory,
    searchTransactions,
    getMonthlyData,
    refetch: fetchTransactions,
  };
};