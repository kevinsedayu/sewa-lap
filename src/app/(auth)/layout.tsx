import { createClient } from '@/lib/supabase/server'
import BookingCalendar from '@/components/shared/BookingCalendar'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Fetch data untuk public landing page
  const { data: lapangan } = await supabase.from('lapangan').select('*').limit(1).single()
  const { data: allBookings } = await supabase.from('sewa').select('tanggal, sesi, status, catatan')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Left Panel: Public Landing Page (75%) */}
      <div style={{ 
        flex: 3, 
        background: '#fafafa', 
        padding: '40px', 
        overflowY: 'auto', 
        height: '100vh',
        display: 'none', // Sembunyikan di mobile
      }} className="auth-left-panel">
        
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Header BUMI MINTARSIH */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '40px', 
              color: '#166534', 
              letterSpacing: '-0.02em', 
              margin: '0 0 16px 0',
              textTransform: 'uppercase',
              fontWeight: 800
            }}>
              Gelora Bumi Mintarsih
            </h1>
            <div style={{ 
              width: '100%', 
              height: '180px', 
              borderRadius: '16px', 
              overflow: 'hidden',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            }}>
              <img 
                src="/lapangan.jpeg" 
                alt="Gelora Bumi Mintarsih" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Fasilitas Kami */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h2 style={{ 
              fontSize: '24px', 
              color: '#166534', 
              marginBottom: '20px', 
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              fontWeight: 800
            }}>
              Fasilitas Kami
            </h2>
            <div style={{ 
              display: 'flex', 
              overflowX: 'auto', 
              scrollSnapType: 'x mandatory', 
              gap: '16px', 
              paddingBottom: '16px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}>
              {[
                { src: '/lapangan2.jpeg', label: 'Lapangan Standart Nasional' },
                { src: '/toilet.jpeg', label: 'Toilet Bersih' },
                { src: '/mushola.jpeg', label: 'Mushola' },
                { src: '/bench.jpeg', label: 'Bench Pemain' }
              ].map((img, i) => (
                <div key={i} style={{ 
                  scrollSnapAlign: 'center', 
                  flex: '0 0 calc(50% - 8px)', 
                  height: '300px',
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  position: 'relative',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                }}>
                  <img src={img.src} alt={img.label} style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#e4e4e7' }} />
                  <div style={{ 
                    position: 'absolute', bottom: 0, left: 0, right: 0, 
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', 
                    color: 'white', padding: '24px 16px 16px', textAlign: 'center', 
                    fontSize: '18px', fontWeight: 600, letterSpacing: '0.02em',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                  }}>
                    {img.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Informasi Lapangan */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#09090b', marginBottom: '16px', letterSpacing: '-0.01em' }}>
              Informasi Lapangan
            </h2>
            <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', padding: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: '#09090b' }}>{lapangan?.nama || 'Nama Lapangan'}</h3>
                <p style={{ fontSize: '13px', color: '#52525b', margin: '0 0 16px', lineHeight: '1.5' }}>{lapangan?.deskripsi || 'Deskripsi belum ditambahkan.'}</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '4px' }}>Harga per Sesi</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#16a34a' }}>Sesi Pagi: Rp 200.000 <br/> Sesi Sore: Rp 250.000</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Kalender Booking Publik */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#09090b', marginBottom: '16px', letterSpacing: '-0.01em' }}>
              Jadwal Lapangan
            </h2>
            <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '16px' }}>
              Silakan periksa jadwal yang kosong sebelum melakukan booking. Untuk melakukan booking, Anda harus masuk (login) terlebih dahulu menggunakan form di sebelah kanan.
            </p>
            <BookingCalendar bookings={allBookings || []} isAdmin={false} />
          </div>
        </div>

      </div>

      {/* Right Panel: Auth Forms (25%) */}
      <div style={{ 
        flex: 1, 
        minWidth: '350px', 
        maxWidth: '100%',
        background: '#09090b', 
        borderLeft: '1px solid #27272a', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        zIndex: 10
      }}>
        {children}
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .auth-left-panel {
            display: block !important;
          }
        }
      `}</style>
    </div>
  )
}
