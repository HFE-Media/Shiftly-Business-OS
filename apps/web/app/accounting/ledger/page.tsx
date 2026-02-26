'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LedgerPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { supabase.from('transactions').select('*, debit:accounts!transactions_debit_account_id_fkey(name), credit:accounts!transactions_credit_account_id_fkey(name)').then(({ data }) => setRows(data ?? [])); }, []);

  return <div className="space-y-4"><h1 className="text-2xl font-semibold">Ledger</h1><div className="card overflow-auto"><table className="w-full text-sm"><thead><tr><th>Time</th><th>Description</th><th>Debit</th><th>Credit</th><th>Amount</th></tr></thead><tbody>{rows.map((r)=><tr className="border-t" key={r.id}><td>{new Date(r.ts).toLocaleDateString()}</td><td>{r.description}</td><td>{r.debit?.name}</td><td>{r.credit?.name}</td><td>{r.amount}</td></tr>)}</tbody></table></div></div>;
}
