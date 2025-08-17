'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Expense, CreateExpenseInput } from '@/types';
import { useProfile } from './ProfileContext';
import { createExpense, getExpenses, updateExpense, deleteExpense } from '@/lib/expenseService';
import { Timestamp } from 'firebase/firestore';

interface ExpenseContextType {
  expenses: Expense[];
  isLoading: boolean;
  addExpense: (data: CreateExpenseInput) => Promise<void>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { activeProfile } = useProfile();

  useEffect(() => {
    async function loadExpenses() {
      if (!activeProfile?.id) {
        setExpenses([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const fetchedExpenses = await getExpenses(activeProfile?.id || '');
        setExpenses(fetchedExpenses as Expense[]);
      } catch (error) {
        console.error('Error loading expenses:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadExpenses();
  }, [activeProfile?.id]);

  const handleAddExpense = async (data: CreateExpenseInput) => {
    if (!activeProfile?.id) return;

    try {
      const expenseId = await createExpense(activeProfile?.id || '', data);
      const newExpense: Expense = {
        id: expenseId,
        ...data,
        profileId: activeProfile?.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        date: Timestamp.fromDate(data.date),
      };
      setExpenses(prev => [newExpense, ...prev]);
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  const handleUpdateExpense = async (id: string, data: Partial<Expense>) => {
    try {
      await updateExpense(id, {
        ...data,
        date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
      });
      setExpenses(prev =>
        prev.map(expense =>
          expense.id === id
            ? { ...expense, ...data, updatedAt: Timestamp.now() }
            : expense
        )
      );
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      setExpenses(prev => prev.filter(expense => expense.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        isLoading,
        addExpense: handleAddExpense,
        updateExpense: handleUpdateExpense,
        deleteExpense: handleDeleteExpense,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpense() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
}
