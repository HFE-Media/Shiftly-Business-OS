'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const signup = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) return toast.error(error?.message ?? 'Failed');
    const { error: rpcError } = await supabase.rpc('bootstrap_company_for_owner', { p_company_name: company, p_user_id: data.user.id });
    if (rpcError) return toast.error(rpcError.message);
    toast.success('Account created');
    window.location.href = '/dashboard';
  };
  return <div className="max-w-md mx-auto card space-y-2"><h1 className="text-xl font-semibold">Sign up</h1><input className="input" placeholder="Company" value={company} onChange={(e)=>setCompany(e.target.value)} /><input className="input" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} /><input type="password" className="input" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} /><button className="btn-primary w-full" onClick={signup}>Create account</button></div>;
}
