'use client';

import { useMemo } from 'react';
import { Expense } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface ExpenseStatsProps {
  expenses: Expense[];
}

export function ExpenseStats({ expenses }: ExpenseStatsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);

    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = expense.date.toDate();
      return isWithinInterval(expenseDate, {
        start: currentMonthStart,
        end: currentMonthEnd,
      });
    });

    const totalSpent = currentMonthExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    const categorySums = currentMonthExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categorySums).reduce(
      (max, [category, sum]) => (sum > max.sum ? { category, sum } : max),
      { category: '', sum: 0 }
    );

    return {
      totalSpent,
      expenseCount: currentMonthExpenses.length,
      averageExpense: totalSpent / (currentMonthExpenses.length || 1),
      topCategory: topCategory.category,
      topCategoryAmount: topCategory.sum,
    };
  }, [expenses]);

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
      <Card>
        <CardContent className="p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Total Spent This Month
            </p>
            <p className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Number of Expenses
            </p>
            <p className="text-2xl font-bold">{stats.expenseCount}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Average Expense
            </p>
            <p className="text-2xl font-bold">
              ${stats.averageExpense.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              Top Category
            </p>
            <p className="text-2xl font-bold">
              {stats.topCategory || 'No expenses'}
            </p>
            {stats.topCategory && (
              <p className="text-sm text-muted-foreground">
                ${stats.topCategoryAmount.toFixed(2)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
