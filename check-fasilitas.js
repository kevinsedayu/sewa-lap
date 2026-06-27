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
  const { data, error } = await supabase
    .rpc('get_schema_info'); // This might not exist, let's just use PostgREST introspection if possible
    
  // Let's just fetch a row and look at the structure, or we can use SQL if admin key is present
  const res = await supabase.from('lapangan').select('fasilitas').limit(1).single();
  console.log('Fasilitas value:', res.data.fasilitas);
  console.log('Fasilitas type (JS):', typeof res.data.fasilitas);
  console.log('Fasilitas isArray:', Array.isArray(res.data.fasilitas));
}

main();
