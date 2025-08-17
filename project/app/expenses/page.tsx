'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useExpense } from '@/contexts/ExpenseContext';
import { useProfile } from '@/contexts/ProfileContext';
import { ExpenseForm } from '@/components/expense-form';
import { ExpenseList } from '@/components/expense-list';
import { MonthYearSelector } from '@/components/month-year-selector';
import { ExpenseStats } from '@/components/expense-stats';
import { PaymentMethodsChart } from '@/components/payment-methods-chart';
import { ExpenseFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function ExpensesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeProfile } = useProfile();
  const { addExpense, expenses, isLoading } = useExpense();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
    } else if (!activeProfile) {
      router.push('/profiles');
    }
  }, [user, activeProfile, router]);

  if (!user || !activeProfile || !expenses) {
    return null;
  }

  const handleExpenseSubmit = async (data: ExpenseFormData) => {
    try {
      await addExpense(data);
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/profiles')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Expenses</h1>
        </div>
        <MonthYearSelector
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseForm onSubmit={handleExpenseSubmit} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseStats expenses={expenses} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentMethodsChart expenses={expenses} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseList expenses={expenses} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
