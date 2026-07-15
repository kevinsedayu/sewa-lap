import { createClient } from '@/lib/supabase/server'
import BookingTable from '@/components/admin/BookingTable'

export default async function AdminBookingPage() {
  const supabase = await createClient()

  const { data: bookings } = await supabase
    .from('sewa')
    .select('*, profiles(full_name, phone)')
    .order('created_at', { ascending: false })

  const pending = bookings?.filter(b => b.status === 'pending').length ?? 0
  const confirmed = bookings?.filter(b => b.status === 'confirmed').length ?? 0
  const completed = bookings?.filter(b => b.status === 'completed').length ?? 0
  const cancelled = bookings?.filter(b => b.status === 'cancelled').length ?? 0

  return (
    <div className="page-content" style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#09090b', letterSpacing: '-0.025em', margin: '0 0 4px' }}>
          Kelola Persewaan
        </h1>
        <p style={{ fontSize: '13px', color: '#71717a', margin: 0 }}>
          Konfirmasi, tolak, atau tandai persewaan sebagai selesai
        </p>
      </div>

      {/* Summary cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '28px',
      }}>
        {[
          { label: 'Menunggu', value: pending, color: '#f59e0b' },
          { label: 'Dikonfirmasi', value: confirmed, color: '#22c55e' },
          { label: 'Selesai', value: completed, color: '#6366f1' },
          { label: 'Dibatalkan', value: cancelled, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="relative overflow-hidden" style={{
            background: '#09090b',
            border: '1px solid #27272a',
            borderRadius: '16px',
            padding: '20px',
            borderTop: `3px solid ${s.color}`,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              position: 'absolute', top: 0, right: 0, width: '100px', height: '100px',
              background: s.color, opacity: 0.05, filter: 'blur(30px)', pointerEvents: 'none', transform: 'translate(30%, -30%)'
            }}></div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', position: 'relative', zIndex: 10 }}>
              {s.value}
            </div>
            <div style={{ fontSize: '13px', color: '#a1a1aa', marginTop: '4px', fontWeight: 600, position: 'relative', zIndex: 10 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Booking Table */}
      <BookingTable initialBookings={bookings as any ?? []} />
    </div>
  )
}
