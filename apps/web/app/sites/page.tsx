'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function SitesPage() {
  const [sites, setSites] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', latitude: '', longitude: '', radius_m: '100' });
  const load = async () => {
    const { data, error } = await supabase.from('sites').select('*');
    if (error) toast.error(error.message); else setSites(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const addSite = async () => {
    const { error } = await supabase.from('sites').insert({ ...form, latitude: Number(form.latitude), longitude: Number(form.longitude), radius_m: Number(form.radius_m), active: true });
    if (error) return toast.error(error.message);
    toast.success('Site created');
    load();
  };

  return <div className="space-y-4"><h1 className="text-2xl font-semibold">Sites</h1>
  <div className="card grid gap-2 md:grid-cols-5">{Object.keys(form).map((k)=><input key={k} className="input" placeholder={k} value={(form as any)[k]} onChange={(e)=>setForm({...form,[k]:e.target.value})} />)}<button className="btn-primary" onClick={addSite}>Create</button></div>
  <div className="grid gap-3 md:grid-cols-2">{sites.map((s)=><div className="card" key={s.id}><p className="font-medium">{s.name}</p><p className="text-sm text-slate-500">{s.latitude}, {s.longitude} • {s.radius_m}m</p></div>)}</div></div>;
}
