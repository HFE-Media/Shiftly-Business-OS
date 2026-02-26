'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { isInsideRadius } from '@/lib/geofence';
import { toast } from 'sonner';

export default function ClockingPage() {
  const [sites, setSites] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [siteId, setSiteId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [override, setOverride] = useState('');

  useEffect(() => {
    supabase.from('sites').select('*').then(({ data }) => setSites(data ?? []));
    supabase.from('employees').select('id,full_name').then(({ data }) => setEmployees(data ?? []));
  }, []);

  const clock = (type: 'in' | 'out') => {
    const site = sites.find((s) => s.id === siteId);
    if (!site || !employeeId) return toast.error('Select employee and site');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;
      const inside = isInsideRadius({ latitude, longitude }, { latitude: site.latitude, longitude: site.longitude }, site.radius_m);

      let method = 'gps';
      let override_by_user_id = null;

      if (!inside) {
        if (!override) return toast.error('Outside radius. Override code required.');
        const { data, error } = await supabase.functions.invoke('verifyOverride', { body: { code: override } });
        if (error || !data?.ok) return toast.error('Invalid override code');
        method = 'override';
        override_by_user_id = data.user_id;
      }

      const { error } = await supabase.from('clock_entries').insert({ employee_id: employeeId, site_id: siteId, type, ts: new Date().toISOString(), latitude, longitude, accuracy_m: pos.coords.accuracy, method, override_by_user_id });
      if (error) return toast.error(error.message);
      toast.success(`Clock ${type} successful`);
    }, () => toast.error('Failed to capture GPS'));
  };

  return <div className="space-y-4"><h1 className="text-2xl font-semibold">Clocking</h1>
  <div className="card space-y-3 max-w-xl">
    <select className="input" value={employeeId} onChange={(e)=>setEmployeeId(e.target.value)}><option value="">Select employee</option>{employees.map((e)=><option key={e.id} value={e.id}>{e.full_name}</option>)}</select>
    <select className="input" value={siteId} onChange={(e)=>setSiteId(e.target.value)}><option value="">Select site</option>{sites.map((s)=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
    <input className="input" value={override} onChange={(e)=>setOverride(e.target.value)} placeholder="Supervisor override code (if outside radius)" />
    <div className="flex gap-2"><button className="btn-primary flex-1" onClick={()=>clock('in')}>Clock In</button><button className="btn-secondary flex-1" onClick={()=>clock('out')}>Clock Out</button></div>
  </div></div>;
}
