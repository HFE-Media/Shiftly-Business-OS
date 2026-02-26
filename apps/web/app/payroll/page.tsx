'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function PayrollPage() {
  const [periods, setPeriods] = useState<any[]>([]);
  const [selected, setSelected] = useState('');
  const [runs, setRuns] = useState<any[]>([]);

  const load = async () => {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from('payroll_periods').select('*'),
      supabase.from('payroll_runs').select('*').order('run_ts', { ascending: false })
    ]);
    setPeriods(p ?? []); setRuns(r ?? []);
  };
  useEffect(() => { load(); }, []);

  const runPayroll = async () => {
    const { error } = await supabase.functions.invoke('runPayroll', { body: { payroll_period_id: selected } });
    if (error) return toast.error(error.message);
    toast.success('Payroll run completed');
    load();
  };

  return <div className="space-y-4"><h1 className="text-2xl font-semibold">Payroll</h1>
  <div className="card flex gap-2"><select className="input" value={selected} onChange={(e)=>setSelected(e.target.value)}><option value="">Select period</option>{periods.map((p)=><option key={p.id} value={p.id}>{p.name}</option>)}</select><button className="btn-primary" onClick={runPayroll}>Run Payroll</button></div>
  <div className="card overflow-auto"><table className="w-full text-sm"><thead><tr><th>Run Date</th><th>Status</th><th>Totals</th></tr></thead><tbody>{runs.map((r)=><tr key={r.id} className="border-t"><td>{new Date(r.run_ts).toLocaleString()}</td><td>{r.status}</td><td>{JSON.stringify(r.totals_json)}</td></tr>)}</tbody></table></div></div>;
}
