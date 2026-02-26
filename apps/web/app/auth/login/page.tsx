'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message); else window.location.href = '/dashboard';
  };
  return <div className="max-w-md mx-auto card space-y-2"><h1 className="text-xl font-semibold">Login</h1><input className="input" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} /><input type="password" className="input" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} /><button className="btn-primary w-full" onClick={login}>Login</button></div>;
}
