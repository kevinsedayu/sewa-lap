import { createClient } from '@/lib/supabase/server'
import BookingCalendar from '@/components/shared/BookingCalendar'

export default async function UserKalenderPage() {
  const supabase = await createClient()

  // Get current logged in user
  const { data: { user } } = await supabase.auth.getUser()

  const { data: allBookings } = await supabase
    .from('sewa')
    .select('tanggal, sesi, status, catatan, user_id')

  return (
    <div className="page-content" style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#09090b', letterSpacing: '-0.025em', margin: '0 0 6px' }}>
          Jadwal Ketersediaan Lapangan
        </h1>
        <p style={{ fontSize: '13px', color: '#71717a', margin: 0 }}>
          Cek tanggal dan sesi mana saja yang masih kosong sebelum mem-booking.
        </p>
      </div>

      <BookingCalendar 
        isAdmin={false}
        currentUserId={user?.id}
        bookings={(allBookings || []).map(b => ({
          tanggal: b.tanggal,
          sesi: b.sesi,
          status: b.status,
          catatan: b.catatan,
          user_id: b.user_id
        }))}
      />
    </div>
  )
}
