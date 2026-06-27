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
  const jsonStr = JSON.stringify({
    sesi: [
      { id: 'pagi', nama: 'Sesi Pagi', jam: '07:00-12:00', harga: 200000 },
      { id: 'sore', nama: 'Sesi Sore', jam: '15:00-18:00', harga: 250000 }
    ]
  });
  
  // Pass it as an array to see if it works
  const { data, error } = await supabase.from('lapangan').update({
    fasilitas: [jsonStr]
  }).eq('id', '41de7b9e-f22e-4c61-9cdc-733647b38562');

  console.log('Update array result:', { data, error });
  
  if (!error) {
    const { data: readData } = await supabase.from('lapangan').select('fasilitas').limit(1).single();
    console.log('Read back:', readData.fasilitas);
  }
}

main();
