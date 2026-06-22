import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function UserRiwayatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Silakan login untuk melihat riwayat.</div>
  }

  // Fetch semua booking user ini
  const { data: bookings } = await supabase
    .from('sewa')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const statusColor: Record<string, string> = {
    pending: '#f59e0b',
    confirmed: '#22c55e',
    cancelled: '#ef4444',
    completed: '#6366f1',
  }

  const statusLabel: Record<string, string> = {
    pending: 'Menunggu',
    confirmed: 'Dikonfirmasi',
    cancelled: 'Dibatalkan',
    completed: 'Selesai',
  }

  return (
    <div style={{ padding: '32px', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#09090b', letterSpacing: '-0.025em', margin: '0 0 6px' }}>
            Riwayat Booking
          </h1>
          <p style={{ fontSize: '13px', color: '#71717a', margin: 0 }}>
            Daftar lengkap semua pemesanan lapangan yang pernah Anda lakukan.
          </p>
        </div>
        <Link href="/user/booking" style={{
          padding: '10px 20px', background: '#09090b', color: '#fff',
          borderRadius: '8px', fontSize: '13px', fontWeight: 600,
          textDecoration: 'none'
        }}>
          + Booking Baru
        </Link>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f4f4f5', background: '#fafafa' }}>
              {['Tgl. Main', 'Sesi', 'Tanggal Dipesan', 'Total Bayar', 'Status'].map(h => (
                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings && bookings.length > 0 ? bookings.map((b: any, i: number) => (
              <tr key={b.id} style={{ borderBottom: i < bookings.length - 1 ? '1px solid #f4f4f5' : 'none' }}>
                <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#09090b' }}>
                  {new Date(b.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#3f3f46' }}>
                  <div style={{ fontWeight: 600, textTransform: 'capitalize', color: '#09090b' }}>{b.sesi}</div>
                  <div style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>{b.jam_mulai?.slice(0, 5)} - {b.jam_selesai?.slice(0, 5)}</div>
                </td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#52525b' }}>
                  {new Date(b.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600, color: '#16a34a' }}>
                  Rp {Number(b.total_harga).toLocaleString('id-ID')}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{
                    display: 'inline-block', padding: '4px 12px',
                    borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                    background: statusColor[b.status] + '18',
                    color: statusColor[b.status],
                  }}>
                    {statusLabel[b.status] || b.status}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ padding: '64px 24px', textAlign: 'center', color: '#a1a1aa' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
                  <p style={{ fontSize: '15px', fontWeight: 500, margin: '0 0 8px', color: '#3f3f46' }}>Belum ada riwayat booking</p>
                  <p style={{ fontSize: '13px', margin: 0 }}>Yuk, mulai booking lapangan pertamamu sekarang!</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
