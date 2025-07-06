import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RecurringPattern, Transaction } from '../types';
import { useAuth } from './useAuth';

export const useRecurringPatterns = () => {
  const [patterns, setPatterns] = useState<RecurringPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.family_id) {
      fetchPatterns();
      subscribeToPatterns();
    }
  }, [profile?.family_id]);

  const fetchPatterns = async () => {
    if (!profile?.family_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recurring_patterns')
        .select('*')
        .eq('family_id', profile.family_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatterns(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPatterns = () => {
    if (!profile?.family_id) return;

    const subscription = supabase
      .channel('recurring_patterns')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recurring_patterns',
          filter: `family_id=eq.${profile.family_id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPatterns(prev => [payload.new as RecurringPattern, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPatterns(prev =>
              prev.map(p => p.id === payload.new.id ? payload.new as RecurringPattern : p)
            );
          } else if (payload.eventType === 'DELETE') {
            setPatterns(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const addPattern = async (pattern: Omit<RecurringPattern, 'id' | 'family_id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!profile?.family_id || !profile?.id) {
      throw new Error('User not authenticated or not in a family');
    }

    const { data, error } = await supabase
      .from('recurring_patterns')
      .insert({
        ...pattern,
        family_id: profile.family_id,
        user_id: profile.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updatePattern = async (id: string, updates: Partial<RecurringPattern>) => {
    const { data, error } = await supabase
      .from('recurring_patterns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deletePattern = async (id: string) => {
    const { error } = await supabase
      .from('recurring_patterns')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const calculateNextOccurrence = (
    startDate: string,
    recurrenceType: RecurringPattern['recurrence_type'],
    interval: number = 1
  ): string => {
    const date = new Date(startDate);
    
    switch (recurrenceType) {
      case 'daily':
        date.setDate(date.getDate() + interval);
        break;
      case 'weekly':
        date.setDate(date.getDate() + (7 * interval));
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + interval);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + (3 * interval));
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + interval);
        break;
    }
    
    return date.toISOString().split('T')[0];
  };

  const generateTransactionFromPattern = async (pattern: RecurringPattern): Promise<Transaction> => {
    if (!profile?.family_id || !profile?.id) {
      throw new Error('User not authenticated or not in a family');
    }

    const transaction: Omit<Transaction, 'id'> = {
      family_id: profile.family_id,
      user_id: profile.id,
      title: pattern.title,
      amount: pattern.type === 'expense' ? -Math.abs(pattern.amount) : Math.abs(pattern.amount),
      category: pattern.category,
      date: pattern.next_occurrence_date,
      type: pattern.type,
      currency: pattern.currency,
      status: 'pending',
      description: pattern.description,
      tags: pattern.tags,
      recurring_pattern_id: pattern.id,
    };

    // Insert the transaction
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Update the pattern's next occurrence date
    const nextOccurrence = calculateNextOccurrence(
      pattern.next_occurrence_date,
      pattern.recurrence_type,
      pattern.recurrence_interval
    );

    await updatePattern(pattern.id, {
      next_occurrence_date: nextOccurrence,
    });

    return transactionData;
  };

  const processOverduePatterns = async () => {
    const today = new Date().toISOString().split('T')[0];
    const overduePatterns = patterns.filter(
      p => p.is_active && p.next_occurrence_date <= today
    );

    const results = [];
    for (const pattern of overduePatterns) {
      try {
        const transaction = await generateTransactionFromPattern(pattern);
        results.push({ pattern, transaction, success: true });
      } catch (error) {
        results.push({ pattern, error, success: false });
      }
    }

    return results;
  };

  return {
    patterns,
    loading,
    error,
    addPattern,
    updatePattern,
    deletePattern,
    generateTransactionFromPattern,
    processOverduePatterns,
    calculateNextOccurrence,
    refetch: fetchPatterns,
  };
};