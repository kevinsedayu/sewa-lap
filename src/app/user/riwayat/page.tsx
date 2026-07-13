import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import RiwayatClient from './RiwayatClient'

export default async function UserRiwayatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Silakan login untuk melihat riwayat.</div>
  }

  const { data: bookings } = await supabase
    .from('sewa')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="page-content" style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#09090b', margin: '0 0 4px' }}>
            Riwayat Sewa
          </h1>
          <p style={{ fontSize: '13px', color: '#71717a', margin: 0 }}>
            Daftar lengkap semua pemesanan lapangan Anda.
          </p>
        </div>
        <Link href="/user/booking" style={{
          padding: '10px 20px', background: '#09090b', color: '#fff',
          borderRadius: '8px', fontSize: '13px', fontWeight: 600,
          textDecoration: 'none', display: 'inline-block',
        }}>
          + Sewa Baru
        </Link>
      </div>

      <RiwayatClient initialBookings={bookings || []} />
    </div>
  )
}
