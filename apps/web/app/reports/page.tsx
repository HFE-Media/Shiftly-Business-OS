'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ReportsPage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any[]>([]);
  useEffect(() => {
    supabase.from('shifts').select('employee_id,minutes_worked,minutes_overtime,late_minutes').then(({ data }) => setAttendance(data ?? []));
    supabase.from('payroll_lines').select('employee_id,gross_pay,net_pay').then(({ data }) => setPayroll(data ?? []));
  }, []);

  return <div className="space-y-4"><h1 className="text-2xl font-semibold">Reports</h1>
  <div className="card"><h2 className="font-semibold">Attendance</h2><p className="text-sm">Rows: {attendance.length}</p></div>
  <div className="card"><h2 className="font-semibold">Payroll</h2><p className="text-sm">Rows: {payroll.length}</p></div>
  </div>;
}
