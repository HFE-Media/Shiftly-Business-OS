'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const [stats, setStats] = useState({ revenue: 0, expenses: 0, payroll: 0, attendance: 0 });

  useEffect(() => {
    const load = async () => {
      const [{ data: invoices }, { data: expenses }, { data: payroll }, { count }] = await Promise.all([
        supabase.from('invoices').select('total,status'),
        supabase.from('expenses').select('total'),
        supabase.from('payroll_lines').select('net_pay'),
        supabase.from('shifts').select('*', { count: 'exact', head: true })
      ]);
      setStats({
        revenue: invoices?.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0) ?? 0,
        expenses: expenses?.reduce((s, e) => s + Number(e.total), 0) ?? 0,
        payroll: payroll?.reduce((s, p) => s + Number(p.net_pay), 0) ?? 0,
        attendance: count ?? 0
      });
    };
    load();
  }, []);

  const profit = stats.revenue - stats.expenses - stats.payroll;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="card"><p className="text-sm text-slate-500">Revenue</p><p className="text-2xl font-bold">${stats.revenue.toFixed(2)}</p></div>
        <div className="card"><p className="text-sm text-slate-500">Expenses</p><p className="text-2xl font-bold">${stats.expenses.toFixed(2)}</p></div>
        <div className="card"><p className="text-sm text-slate-500">Payroll Cost</p><p className="text-2xl font-bold">${stats.payroll.toFixed(2)}</p></div>
        <div className="card"><p className="text-sm text-slate-500">Profit Estimate</p><p className="text-2xl font-bold">${profit.toFixed(2)}</p></div>
      </div>
    </div>
  );
}
