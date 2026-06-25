const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env', 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';

envFile.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: lapangan, error } = await supabase.from('lapangan').select('*');
  console.log('Lapangan:', JSON.stringify(lapangan, null, 2));

  const { data: sesi, error: err2 } = await supabase.from('sesi').select('*');
  console.log('Sesi:', JSON.stringify(sesi, null, 2), 'Error:', err2);
}

main();
