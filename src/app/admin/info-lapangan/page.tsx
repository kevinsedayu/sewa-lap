import { createClient } from '@/lib/supabase/server'
import InfoLapanganClient from './InfoLapanganClient'

export default async function AdminInfoLapanganPage() {
  const supabase = await createClient()

  // Fetch data lapangan
  const { data: lapangan } = await supabase
    .from('lapangan')
    .select('*')
    .limit(1)
    .single()

  return (
    <div className="page-content" style={{ maxWidth: '900px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#09090b', letterSpacing: '-0.025em', margin: '0 0 6px' }}>
          Informasi Lapangan & Sesi
        </h1>
        <p style={{ fontSize: '13px', color: '#71717a', margin: 0 }}>
          Kelola profil lapangan dan atur daftar sesi penyewaan beserta harganya.
        </p>
      </div>

      <InfoLapanganClient initialData={lapangan} />
    </div>
  )
}
