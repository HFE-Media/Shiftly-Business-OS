'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function InvoicesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [client, setClient] = useState('');
  const [total, setTotal] = useState('');
  const load = async () => { const { data } = await supabase.from('invoices').select('*'); setRows(data ?? []); };
  useEffect(() => { load(); }, []);
  const add = async () => {
    const { error } = await supabase.from('invoices').insert({ invoice_no: `INV-${Date.now().toString().slice(-6)}`, client_name: client, issue_date: new Date().toISOString().slice(0,10), due_date: new Date().toISOString().slice(0,10), status: 'draft', subtotal: Number(total), vat: 0, total: Number(total) });
    if (error) return toast.error(error.message);
    toast.success('Invoice added'); load();
  };
  return <div className="space-y-4"><h1 className="text-2xl font-semibold">Invoices</h1><div className="card grid md:grid-cols-3 gap-2"><input className="input" placeholder="Client" value={client} onChange={(e)=>setClient(e.target.value)} /><input className="input" placeholder="Total" value={total} onChange={(e)=>setTotal(e.target.value)} /><button className="btn-primary" onClick={add}>Create</button></div><div className="card overflow-auto"><table className="w-full text-sm"><thead><tr><th>No</th><th>Client</th><th>Status</th><th>Total</th></tr></thead><tbody>{rows.map((r)=><tr className="border-t" key={r.id}><td>{r.invoice_no}</td><td>{r.client_name}</td><td>{r.status}</td><td>{r.total}</td></tr>)}</tbody></table></div></div>;
}
