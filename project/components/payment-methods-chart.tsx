'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPaymentMethodStats } from '@/lib/expenseService';
import { Expense, PaymentMethodStats, PaymentMethod } from '@/types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

interface PaymentMethodsChartProps {
  expenses: Expense[];
  profileId: string;
}

export function PaymentMethodsChart({ expenses, profileId }: PaymentMethodsChartProps) {
  const [stats, setStats] = useState<PaymentMethodStats[]>([]);

  useEffect(() => {
    const loadStats = async () => {
      if (!profileId) return;
      const stats = await getPaymentMethodStats(profileId);
      setStats(stats.map(stat => ({
        ...stat,
        method: stat.method as PaymentMethod
      })));
    };
    loadStats();
  }, [profileId]);

  if (stats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          No expenses recorded yet
        </CardContent>
      </Card>
    );
  }

  const data = stats.map((stat, index) => ({
    name: stat.method,
    value: stat.total,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
