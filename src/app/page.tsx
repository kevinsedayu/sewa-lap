import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import BookingCalendar from '@/components/shared/BookingCalendar'
import { Anton } from 'next/font/google'

const anton = Anton({ weight: '400', subsets: ['latin'] })

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let dashboardPath = ''
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    let role = profile?.role || 'user'
    if (user.email === 'admin@sewa.com') role = 'admin'
    dashboardPath = role === 'admin' ? '/admin/dashboard' : '/user/dashboard'
  }

  // Fetch data
  const { data: allBookings } = await supabase
    .from('sewa')
    .select('tanggal, sesi, status, catatan')

  const { data: lapangan } = await supabase
    .from('lapangan')
    .select('*')
    .limit(1)
    .single()
  // Parse fasilitas JSON for sessions
  let sesiList: any[] = [
    { id: 'pagi', nama: 'Sesi Pagi', jam: '07:00-12:00', harga: 200000 },
    { id: 'sore', nama: 'Sesi Sore', jam: '15:00-18:00', harga: 250000 }
  ]
  try {
    if (Array.isArray(lapangan?.fasilitas)) {
      const parsedSesi = lapangan.fasilitas.map((item: any) => 
        typeof item === 'string' ? JSON.parse(item) : item
      )
      if (parsedSesi.length > 0) sesiList = parsedSesi
    } else if (typeof lapangan?.fasilitas === 'string') {
      const parsed = JSON.parse(lapangan.fasilitas)
      if (parsed.sesi && Array.isArray(parsed.sesi)) sesiList = parsed.sesi
    } else if (lapangan?.fasilitas?.sesi && Array.isArray(lapangan.fasilitas.sesi)) {
      sesiList = lapangan.fasilitas.sesi
    }
  } catch(e) {}

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', fontFamily: "'Inter', system-ui, sans-serif", paddingBottom: '40px' }}>
      {/* Navbar / Header */}
      <header style={{ 
        background: '#ffffff', borderBottom: '1px solid #e4e4e7', 
        padding: '16px 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        <div>
          {user ? (
            <Link href={dashboardPath} style={{
              background: '#09090b', color: '#fafafa', padding: '10px 20px', borderRadius: '8px', 
              fontSize: '14px', fontWeight: 600, textDecoration: 'none'
            }}>
              Ke Dashboard
            </Link>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="hide-on-mobile" style={{ fontSize: '14px', color: '#52525b', fontWeight: 500 }}>
                Ingin mau booking?
              </span>
              <Link href="/login" style={{
                background: '#166534', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', 
                fontSize: '14px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 12px rgba(22, 101, 52, 0.2)'
              }}>
                Login
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="page-content" style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '24px' }}>
        
        {/* Header Photo & Title */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h2 className={`${anton.className} dashboard-header-text`} style={{ 
            color: '#166534', letterSpacing: '2px', margin: '0 0 12px 0', 
            textTransform: 'uppercase', textShadow: '2px 2px 0px rgba(0,0,0,0.12)' 
          }}>
            Gelora Bumi Mintarsih
          </h2>
          <div style={{
            width: '100%', height: '180px', borderRadius: '12px',
            overflow: 'hidden', boxShadow: '0 8px 20px -5px rgba(0,0,0,0.12)',
            marginBottom: '16px'
          }}>
            <img src="/lapangan.jpeg" alt="Gelora Bumi Mintarsih" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <p style={{ fontSize: '15px', color: '#52525b', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Sistem penyewaan lapangan sepakbola online. Silakan cek jadwal yang masih kosong pada kalender di bawah ini, dan lakukan login untuk mulai booking!
          </p>
        </div>

        {/* Fasilitas Slider */}
        <div style={{ marginBottom: '32px' }}>
          <h2 className={`${anton.className} dashboard-header-text`} style={{
            color: '#166534', marginBottom: '12px', letterSpacing: '1px',
            textTransform: 'uppercase', textAlign: 'center', textShadow: '2px 2px 0px rgba(0,0,0,0.12)',
          }}>
            Fasilitas Kami
          </h2>
          <div style={{
            display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory',
            gap: '12px', paddingBottom: '8px', scrollbarWidth: 'none', msOverflowStyle: 'none',
          }}>
            {[
              { src: '/lapangan2.jpeg', label: 'Lapangan Standart Nasional' },
              { src: '/toilet.jpeg', label: 'Toilet Bersih' },
              { src: '/mushola.jpeg', label: 'Mushola' },
              { src: '/bench.jpeg', label: 'Bench Pemain' }
            ].map((img, i) => (
              <div key={i} className="facility-card" style={{
                scrollSnapAlign: 'center', borderRadius: '12px', overflow: 'hidden',
                position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flexShrink: 0,
              }}>
                <img src={img.src} alt={img.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                  color: 'white', padding: '20px 12px 12px', textAlign: 'center',
                  fontSize: '14px', fontWeight: 600,
                }}>
                  {img.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Lapangan */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#09090b', marginBottom: '12px' }}>Informasi Lapangan</h2>
          <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px', color: '#09090b' }}>{lapangan?.nama || 'Gelora Bumi Mintarsih'}</h3>
            <p style={{ fontSize: '13px', color: '#52525b', margin: '0 0 12px', lineHeight: '1.5' }}>{lapangan?.deskripsi || 'Lapangan sepakbola standart nasional dengan rumput berkualitas dan fasilitas lengkap.'}</p>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#16a34a', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {sesiList.map((s: any, idx: number) => (
                <span key={s.id}>
                  {s.nama}: Rp {s.harga.toLocaleString('id-ID')}
                  {idx < sesiList.length - 1 && <span style={{ color: '#a1a1aa', margin: '0 8px' }}>|</span>}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div style={{ marginBottom: '12px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#09090b', marginBottom: '12px' }}>Jadwal Ketersediaan</h2>
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e4e4e7', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <BookingCalendar 
              isAdmin={false} 
              bookings={(allBookings || []).map(b => ({
                tanggal: b.tanggal,
                sesi: b.sesi,
                status: b.status,
                catatan: b.catatan
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
