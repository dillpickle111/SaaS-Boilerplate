/* eslint-disable no-console */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE credentials: set NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  {
    const { data, error } = await supabase.rpc('noop'); // trigger client init; ignore
  }
  const { data: countRows } = await supabase.from('questions').select('id', { count: 'exact', head: true });
  console.log('Total in questions:', countRows === null ? 'unknown' : (countRows as any));

  const { data: byTest } = await supabase.from('questions').select('test, count:test').group('test').order('test', { ascending: true });
  console.log('By test:', byTest);

  const { data: small } = await supabase
    .from('questions')
    .select('id, stem, choices, answer')
    .order('created_at', { ascending: true })
    .limit(2);
  console.log('First 2 rows (id, stem, choices, answer):');
  console.log(JSON.stringify(small, null, 2));

  const { data: first10 } = await supabase
    .from('questions')
    .select('id, stem, choices, answer, created_at')
    .order('created_at', { ascending: true })
    .limit(10);
  const brief = (first10 || []).map(r => ({ id: r.id, L: (r.stem || '').length, k: Array.isArray(r.choices) ? r.choices.length : null }));
  console.log('First 10 brief:', brief);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});



