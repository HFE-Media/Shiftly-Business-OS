'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Employee');
  const [code, setCode] = useState('');

  const invite = async () => {
    const token = crypto.randomUUID();
    const { error } = await supabase.from('invites').insert({ email, role, token });
    if (error) return toast.error(error.message);
    toast.success(`Invite token: ${token}`);
  };

  const createOverride = async () => {
    const { error } = await supabase.functions.invoke('verifyOverride', { body: { create: true, code } });
    if (error) return toast.error(error.message);
    toast.success('Override code stored');
  };

  return <div className="space-y-4"><h1 className="text-2xl font-semibold">Settings</h1>
    <div className="card space-y-2"><h2 className="font-semibold">Invite User</h2><input className="input" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} /><select className="input" value={role} onChange={(e)=>setRole(e.target.value)}><option>Admin</option><option>PayrollManager</option><option>Supervisor</option><option>Employee</option></select><button className="btn-primary" onClick={invite}>Create Invite</button></div>
    <div className="card space-y-2"><h2 className="font-semibold">Supervisor Override Code</h2><input className="input" placeholder="Code" value={code} onChange={(e)=>setCode(e.target.value)} /><button className="btn-primary" onClick={createOverride}>Save Code</button></div>
  </div>;
}
