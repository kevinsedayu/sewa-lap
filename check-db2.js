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
  const { data, error } = await supabase.rpc('get_schema_info');
  // Or just try inserting a JSON object into fasilitas to see if it accepts JSON
  const res = await supabase.from('lapangan').update({ fasilitas: '{"pagi": 200000, "sore": 250000}' }).eq('id', '41de7b9e-f22e-4c61-9cdc-733647b38562');
  console.log('Update res:', res);
}

main();
