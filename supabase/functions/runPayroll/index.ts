import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PDFDocument, StandardFonts } from 'https://esm.sh/pdf-lib@1.17.1';

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const { payroll_period_id } = await req.json();

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return new Response('Unauthorized', { status: 401 });

    const { data: period, error: periodError } = await supabase.from('payroll_periods').select('*').eq('id', payroll_period_id).single();
    if (periodError) throw periodError;

    const { data: employees, error: empErr } = await supabase.from('employees').select('*').eq('company_id', period.company_id).eq('status', 'active');
    if (empErr) throw empErr;

    const runInsert = await supabase.from('payroll_runs').insert({ company_id: period.company_id, payroll_period_id: payroll_period_id, run_by_user_id: userId, status: 'draft', totals_json: {} }).select('*').single();
    if (runInsert.error) throw runInsert.error;
    const run = runInsert.data;

    let totalGross = 0;
    let totalNet = 0;

    for (const emp of employees ?? []) {
      const { data: shifts } = await supabase.from('shifts').select('minutes_worked,minutes_overtime').eq('employee_id', emp.id).gte('start_ts', period.start_date).lte('start_ts', `${period.end_date}T23:59:59Z`);
      const regularMinutes = (shifts ?? []).reduce((s, sh) => s + Number(sh.minutes_worked || 0) - Number(sh.minutes_overtime || 0), 0);
      const overtimeMinutes = (shifts ?? []).reduce((s, sh) => s + Number(sh.minutes_overtime || 0), 0);

      const regularHours = regularMinutes / 60;
      const overtimeHours = overtimeMinutes / 60;
      const gross = regularHours * Number(emp.pay_rate) + overtimeHours * Number(emp.pay_rate) * 1.5;

      const { data: deductions } = await supabase.from('deductions').select('*').eq('company_id', period.company_id).eq('active', true).or(`employee_id.is.null,employee_id.eq.${emp.id}`);
      const deductionTotal = (deductions ?? []).reduce((sum, d) => sum + (d.type === 'fixed' ? Number(d.value) : gross * Number(d.value) / 100), 0);
      const net = gross - deductionTotal;

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      page.drawText(`Shiftly Payslip`, { x: 40, y: 800, size: 18, font });
      page.drawText(`Company: ${period.company_id}`, { x: 40, y: 770, size: 11, font });
      page.drawText(`Employee: ${emp.full_name} (${emp.employee_code})`, { x: 40, y: 750, size: 11, font });
      page.drawText(`Period: ${period.start_date} to ${period.end_date}`, { x: 40, y: 730, size: 11, font });
      page.drawText(`Regular Hours: ${regularHours.toFixed(2)}`, { x: 40, y: 700, size: 11, font });
      page.drawText(`Overtime Hours: ${overtimeHours.toFixed(2)}`, { x: 40, y: 680, size: 11, font });
      page.drawText(`Gross: ${gross.toFixed(2)}`, { x: 40, y: 660, size: 11, font });
      page.drawText(`Deductions: ${deductionTotal.toFixed(2)}`, { x: 40, y: 640, size: 11, font });
      page.drawText(`Net: ${net.toFixed(2)}`, { x: 40, y: 620, size: 11, font });
      const bytes = await pdfDoc.save();

      const path = `${period.company_id}/${run.id}/${emp.id}.pdf`;
      await supabase.storage.from('payslips').upload(path, bytes, { contentType: 'application/pdf', upsert: true });

      await supabase.from('payroll_lines').insert({
        company_id: period.company_id,
        payroll_run_id: run.id,
        employee_id: emp.id,
        hours_regular: regularHours,
        hours_overtime: overtimeHours,
        gross_pay: gross,
        deductions: deductionTotal,
        net_pay: net,
        breakdown_json: { deductions },
        payslip_path: path
      });

      totalGross += gross;
      totalNet += net;
    }

    const { data: payrollExpense } = await supabase.from('accounts').select('id').eq('company_id', period.company_id).eq('code', '5000').single();
    const { data: bankAccount } = await supabase.from('accounts').select('id').eq('company_id', period.company_id).eq('code', '1000').single();

    if (payrollExpense && bankAccount) {
      await supabase.from('transactions').insert({
        company_id: period.company_id,
        debit_account_id: payrollExpense.id,
        credit_account_id: bankAccount.id,
        amount: totalNet,
        reference_type: 'payroll',
        reference_id: run.id,
        description: `Payroll run ${run.id}`
      });
    }

    await supabase.from('payroll_runs').update({ totals_json: { totalGross, totalNet, employeeCount: employees?.length ?? 0 } }).eq('id', run.id);

    return new Response(JSON.stringify({ ok: true, run_id: run.id }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
});
