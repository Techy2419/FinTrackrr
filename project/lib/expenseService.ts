import { 
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  Timestamp,
  serverTimestamp,
  Query,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { Expense as ExpenseType, CreateExpenseInput, UpdateExpenseInput, PaymentMethod } from '@/types';

export interface Expense {
  id?: string;
  profileId: string;
  amount: number;
  memo?: string;
  date: Timestamp;
  paymentMethod: PaymentMethod;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type SortField = 'date' | 'amount';
export type SortOrder = 'asc' | 'desc';

const EXPENSES_COLLECTION = 'expenses';

export async function getExpenses(
  profileId: string,
  sortField: SortField = 'date',
  sortOrder: SortOrder = 'desc',
  startDate?: Date,
  endDate?: Date
): Promise<Expense[]> {
  try {
    const expensesRef = collection(db, EXPENSES_COLLECTION);
    let q: Query<DocumentData> = query(
      expensesRef,
      where('profileId', '==', profileId),
      orderBy(sortField, sortOrder)
    );

    if (startDate && endDate) {
      q = query(
        q,
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate))
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Expense[];
  } catch (error) {
    console.error('Error getting expenses:', error);
    throw error;
  }
}

export async function createExpense(profileId: string, expenseData: CreateExpenseInput): Promise<string> {
  try {
    const expensesRef = collection(db, EXPENSES_COLLECTION);
    const now = Timestamp.now();
    
    const expense = {
      ...expenseData,
      profileId,
      date: Timestamp.fromDate(expenseData.date),
      createdAt: now,
      updatedAt: now
    };

    const docRef = await addDoc(expensesRef, expense);
    return docRef.id;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
}

export async function updateExpense(expenseId: string, updates: UpdateExpenseInput): Promise<void> {
  try {
    const expenseRef = doc(db, EXPENSES_COLLECTION, expenseId);
    const updateData = {
      ...updates,
      updatedAt: new Date(),
      date: updates.date ? Timestamp.fromDate(updates.date) : undefined,
      updatedAt: Timestamp.now()
    };

    await updateDoc(expenseRef, updateData);
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
}

export async function deleteExpense(expenseId: string): Promise<void> {
  try {
    const expenseRef = doc(db, EXPENSES_COLLECTION, expenseId);
    await deleteDoc(expenseRef);
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
}

export async function getPaymentMethodStats(profileId: string): Promise<{ method: string; total: number; count: number; }[]> {
  try {
    const expenses = await getExpenses(profileId);
    const stats = expenses.reduce((acc, expense) => {
      const method = expense.paymentMethod;
      if (!acc[method]) {
        acc[method] = { method, total: 0, count: 0 };
      }
      acc[method].total += expense.amount;
      acc[method].count += 1;
      return acc;
    }, {} as Record<string, { method: string; total: number; count: number; }>);

    return Object.values(stats);
  } catch (error) {
    console.error('Error getting payment method stats:', error);
    throw error;
  }
}

export async function getMonthlyExpenses(profileId: string, year: number, month: number): Promise<number> {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  const expenses = await getExpenses(profileId, 'date', 'desc', start, end);
  return expenses.reduce((total, expense) => total + expense.amount, 0);
}

export async function compareMonthlyExpenses(
  profileId: string,
  year: number,
  month: number
): Promise<{ currentMonthTotal: number; previousMonthTotal: number; difference: number; hasSaved: boolean; } | null> {
  try {
    const currentMonthTotal = await getMonthlyExpenses(profileId, year, month);
    
    // Calculate previous month's year and month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    
    const previousMonthTotal = await getMonthlyExpenses(profileId, prevYear, prevMonth);
    
    const difference = previousMonthTotal - currentMonthTotal;
    const hasSaved = difference > 0;

    return {
      currentMonthTotal,
      previousMonthTotal,
      difference,
      hasSaved,
    };
  } catch (error) {
    console.error('Error comparing monthly expenses:', error);
    return null;
  }
}
