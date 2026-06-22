import { createClient } from '@/lib/supabase/server'

export default async function UserDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam'

  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '4px' }}>
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#09090b', letterSpacing: '-0.025em', margin: 0 }}>
          {greeting}, {profile?.full_name || 'User'} 👋
        </h1>
      </div>

      {/* Info Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {[
          { label: 'Booking Aktif', value: '0', icon: '✅', desc: 'Konfirmasi booking' },
          { label: 'Riwayat Sewa', value: '0', icon: '📋', desc: 'Total penyewaan' },
          { label: 'Lapangan Favorit', value: '-', icon: '⭐', desc: 'Paling sering disewa' },
        ].map((card) => (
          <div key={card.label} style={{
            background: '#ffffff',
            border: '1px solid #e4e4e7',
            borderRadius: '12px',
            padding: '20px 24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: '#71717a', fontWeight: 500 }}>{card.label}</span>
              <span style={{ fontSize: '20px' }}>{card.icon}</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#09090b', letterSpacing: '-0.03em', marginBottom: '4px' }}>
              {card.value}
            </div>
            <div style={{ fontSize: '12px', color: '#a1a1aa' }}>{card.desc}</div>
          </div>
        ))}
      </div>

      {/* CTA - Book Now */}
      <div style={{
        background: '#09090b',
        borderRadius: '14px',
        padding: '32px',
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap',
      }}>
        <div>
          <h2 style={{ color: '#fafafa', fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
            Siap bermain hari ini?
          </h2>
          <p style={{ color: '#71717a', fontSize: '14px', margin: 0 }}>
            Temukan lapangan tersedia dan booking sekarang
          </p>
        </div>
        <button style={{
          background: '#fafafa',
          color: '#09090b',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          Cari Lapangan →
        </button>
      </div>

      {/* Booking Terdekat Placeholder */}
      <div>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#09090b', marginBottom: '16px', letterSpacing: '-0.01em' }}>
          Booking Mendatang
        </h2>
        <div style={{
          background: '#ffffff',
          border: '1px solid #e4e4e7',
          borderRadius: '12px',
        }}>
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#a1a1aa' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
            <p style={{ fontSize: '14px', margin: 0 }}>Belum ada booking mendatang</p>
            <p style={{ fontSize: '12px', margin: '4px 0 0', color: '#d4d4d8' }}>Booking lapangan pertama Anda sekarang!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
