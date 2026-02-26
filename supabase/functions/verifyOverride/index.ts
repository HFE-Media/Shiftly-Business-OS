import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

async function sha256(text: string) {
  const bytes = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')!;
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { global: { headers: { Authorization: authHeader } } });
  const { code, create } = await req.json();
  const { data: u } = await supabase.auth.getUser();
  const userId = u.user?.id;
  if (!userId) return new Response(JSON.stringify({ ok: false }), { status: 401 });

  const { data: membership } = await supabase.from('company_members').select('company_id').eq('user_id', userId).eq('active', true).limit(1).single();
  if (!membership) return new Response(JSON.stringify({ ok: false }), { status: 403 });

  const hash = await sha256(code);

  if (create) {
    await supabase.from('override_codes').insert({ company_id: membership.company_id, code_hash: hash, active: true });
    return new Response(JSON.stringify({ ok: true }));
  }

  const { data } = await supabase.from('override_codes').select('id').eq('company_id', membership.company_id).eq('code_hash', hash).eq('active', true).limit(1);
  return new Response(JSON.stringify({ ok: (data?.length ?? 0) > 0, user_id: userId }), { headers: { 'Content-Type': 'application/json' } });
});
