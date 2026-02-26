'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function EmployeesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [payRate, setPayRate] = useState('');

  const load = async () => {
    const { data, error } = await supabase.from('employees').select('*').order('created_at', { ascending: false });
    if (error) return toast.error(error.message);
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    const { error } = await supabase.from('employees').insert({
      full_name: name,
      pay_type: 'hourly',
      pay_rate: Number(payRate),
      employee_code: `E${Date.now().toString().slice(-5)}`,
      status: 'active',
      start_date: new Date().toISOString().slice(0, 10)
    });
    if (error) return toast.error(error.message);
    toast.success('Employee created');
    setName(''); setPayRate(''); load();
  };

  return <div className="space-y-4"><h1 className="text-2xl font-semibold">Employees</h1>
    <div className="card grid gap-2 md:grid-cols-3"><input className="input" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Full name" /><input className="input" value={payRate} onChange={(e)=>setPayRate(e.target.value)} placeholder="Hourly rate" /><button className="btn-primary" onClick={create}>Add employee</button></div>
    <div className="card overflow-auto"><table className="w-full text-sm"><thead><tr><th>Name</th><th>Code</th><th>Rate</th><th>Status</th></tr></thead><tbody>{rows.map((r)=><tr key={r.id} className="border-t"><td>{r.full_name}</td><td>{r.employee_code}</td><td>{r.pay_rate}</td><td>{r.status}</td></tr>)}</tbody></table></div>
  </div>;
}
