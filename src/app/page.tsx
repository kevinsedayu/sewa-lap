import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import BookingCalendar from '@/components/shared/BookingCalendar'

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
    <div className="min-h-screen bg-zinc-50 font-sans pb-12">
      {/* Top Navbar Bar */}
      <div className="w-full">
        <header className="flex items-center justify-between px-6 py-4 bg-zinc-900 text-white shadow-sm z-50">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full object-contain bg-white shrink-0 shadow-lg ring-2 ring-emerald-500/30 p-0.5 transition-transform hover:scale-105" />
            <span className="text-lg font-bold tracking-wide">Gelora Bumi Mintarsih</span>
          </div>

          <div>
            {user ? (
              <Link 
                href={dashboardPath} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm"
              >
                Ke Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline-block text-sm text-zinc-400 font-medium">
                  Ingin mau booking?
                </span>
                <Link 
                  href="/login" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-[0_4px_12px_rgba(5,150,105,0.2)] hover:-translate-y-0.5"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Hero Image — full width, clean, NO text overlay */}
        <div className="w-full h-[220px] sm:h-[360px] relative overflow-hidden">
          <img
            src="/lapangan.jpeg"
            alt="Gelora Bumi Mintarsih"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
        </div>

        {/* Marquee Ticker — scrolling text below hero */}
        <div className="marquee-wrapper bg-emerald-700 py-1.5 border-y border-emerald-600">
          <div className="marquee-track">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="flex items-center gap-6 px-6 font-bold text-sm uppercase" style={{ color: '#ffffff', letterSpacing: '0.05em' }}>
                Gelora Bumi Mintarsih Kalisegoro
                <span style={{ color: '#a7f3d0', fontSize: '10px' }}>✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        
        {/* Intro Text */}
        <div className="mb-14 text-center">
          <p className="text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            Sistem penyewaan lapangan sepakbola online. Silakan cek jadwal yang masih kosong pada kalender di bawah ini, dan lakukan login untuk mulai booking!
          </p>
        </div>

        {/* Kalender Jadwal Kosong */}
        <div>
          <h2 className="text-2xl font-bold text-emerald-800 mb-6 tracking-tight uppercase text-center">
            Fasilitas Kami
          </h2>
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            {[
              { src: '/lapangan2.jpeg', label: 'Lapangan Standart Nasional' },
              { src: '/toilet.jpeg', label: 'Toilet Bersih' },
              { src: '/mushola.jpeg', label: 'Mushola' },
              { src: '/bench.jpeg', label: 'Bench Pemain' }
            ].map((img, i) => (
              <div key={i} className="snap-center shrink-0 w-[260px] h-[180px] rounded-xl overflow-hidden relative shadow-md group">
                <img 
                  src={img.src} 
                  alt={img.label} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white p-4 pt-12 text-center text-sm font-semibold">
                  {img.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Lapangan */}
        <div className="mb-12">
          <h2 className="text-lg font-bold text-zinc-900 mb-4 tracking-tight">Informasi Lapangan</h2>
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-bold text-zinc-900 mb-2">{lapangan?.nama || 'Gelora Bumi Mintarsih'}</h3>
            <p className="text-zinc-600 mb-6 leading-relaxed">{lapangan?.deskripsi || 'Lapangan sepakbola standart nasional dengan rumput berkualitas dan fasilitas lengkap.'}</p>
            
            <div className="flex flex-wrap gap-3">
              {sesiList.map((s: any, idx: number) => (
                <div key={s.id} className="bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-2.5 flex items-center gap-2">
                  <span className="text-sm font-semibold text-emerald-800">{s.nama}</span>
                  <span className="text-emerald-300">|</span>
                  <span className="text-sm font-bold text-emerald-600">Rp {s.harga.toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-zinc-900 mb-4 tracking-tight">Jadwal Ketersediaan</h2>
          <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-sm">
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
      </main>
    </div>
  )
}
