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
  const sessions = [
    JSON.stringify({ id: 'pagi', nama: 'Sesi Pagi', jam: '07:00-12:00', harga: 200000 }),
    JSON.stringify({ id: 'sore', nama: 'Sesi Sore', jam: '15:00-18:00', harga: 250000 })
  ];
  
  const { data, error } = await supabase.from('lapangan').update({
    fasilitas: sessions
  }).eq('id', '41de7b9e-f22e-4c61-9cdc-733647b38562').select();

  console.log('Update result:', { data, error });
}

main();
