import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')!;
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { global: { headers: { Authorization: authHeader } } });
  const { payroll_line_id } = await req.json();

  const { data: line } = await supabase.from('payroll_lines').select('payslip_path').eq('id', payroll_line_id).single();
  if (!line?.payslip_path) return new Response('Not found', { status: 404 });

  const { data, error } = await supabase.storage.from('payslips').createSignedUrl(line.payslip_path, 60 * 5);
  if (error) return new Response(error.message, { status: 400 });
  return new Response(JSON.stringify({ url: data.signedUrl }), { headers: { 'Content-Type': 'application/json' } });
});
