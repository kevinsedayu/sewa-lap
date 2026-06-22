import { createClient } from '@/lib/supabase/server'
import BookingCalendar from '@/components/shared/BookingCalendar'

export default async function AdminKalenderPage() {
  const supabase = await createClient()

  const { data: bookings } = await supabase
    .from('sewa')
    .select('*, profiles(full_name)')

  return (
    <div style={{ padding: '32px', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#09090b', letterSpacing: '-0.025em', margin: '0 0 6px' }}>
          Kalender Ketersediaan
        </h1>
        <p style={{ fontSize: '13px', color: '#71717a', margin: 0 }}>
          Klik pada sesi yang kosong (hijau) untuk memasukkan Booking Offline atau Libur/Perawatan.
        </p>
      </div>

      <BookingCalendar 
        isAdmin={true} 
        bookings={(bookings || []).map(b => ({
          tanggal: b.tanggal,
          sesi: b.sesi,
          status: b.status,
          penyewa: (b.profiles as any)?.full_name || 'User',
          catatan: b.catatan
        }))}
      />
    </div>
  )
}
