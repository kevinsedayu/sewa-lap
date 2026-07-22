import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import BookingCalendar from '@/components/shared/BookingCalendar'
import FasilitasGallery from '@/components/landing/FasilitasGallery'
import BackgroundVideo from '@/components/landing/BackgroundVideo'

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
    <div className="min-h-screen bg-transparent font-sans pb-12">
      {/* Top Navbar Bar - Dark & Luxurious */}
      <div className="w-full">
        <header className="flex items-center justify-between px-6 py-4 bg-[#09090b] text-white z-50 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain shrink-0 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-transform hover:scale-105" />
            <span className="text-lg font-bold tracking-wide font-bricolage">BumiMintarsih</span>
          </div>

          <div>
            {user ? (
              <Link 
                href={dashboardPath} 
                className="bg-white hover:bg-zinc-200 text-black px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Ke Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline-block text-sm text-zinc-400 font-medium">
                  Belum punya akun?
                </span>
                <Link 
                  href="/login" 
                  className="bg-white hover:bg-zinc-200 text-black px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:-translate-y-0.5"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Hero Section — Video Background, full uncropped */}
        <div className="w-full relative overflow-hidden text-center text-white">
          
          {/* Robust Background Video with Client Component forcing playback */}
          <BackgroundVideo />

          {/* Dark overlay + text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 pt-6 sm:pt-0"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.55) 100%)' }}>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tighter leading-[1.1] mb-2 sm:mb-6 font-bricolage drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)]">
              SEWA LAPANGAN<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">GELORA BUMI MINTARSIH</span>
            </h1>
            <p className="text-xs sm:text-lg text-zinc-200 max-w-2xl mx-auto leading-relaxed mb-4 sm:mb-8 drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)] px-2 mt-3 sm:mt-0">
              Sistem penyewaan lapangan sepakbola online Gelora Bumi Mintarsih Kalisegoro, Gunungpati, Kota Semarang
            </p>
            <a href="#jadwal" className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 sm:px-8 py-2 sm:py-4 rounded-lg sm:rounded-xl text-xs sm:text-base font-bold transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:-translate-y-1">
              Cek Ketersediaan
            </a>
          </div>
        </div>

        {/* Marquee Ticker — directly below video, no gap */}
        <div className="marquee-wrapper py-2 border-y" style={{ background: '#0F172A', borderColor: '#1e2d5a' }}>
          <div className="marquee-track">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="flex items-center gap-8 px-8 font-bold text-xs uppercase tracking-widest" style={{ color: '#93c5fd' }}>
                Gelora Bumi Mintarsih
                <span style={{ color: '#60a5fa', fontSize: '10px' }}>✦</span>
                Kalisegoro Semarang
                <span style={{ color: '#60a5fa', fontSize: '10px' }}>✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content (White Base with emerald glow from globals.css) */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20">
        
        {/* Fasilitas Section (Luxurious Cards) */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Fasilitas</p>
              <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight font-bricolage">
                Fasilitas Lengkap
              </h2>
            </div>
          </div>
          
          <FasilitasGallery />
        </div>

        {/* Info Lapangan & Harga */}
        <div className="mb-20 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Informasi</p>
            <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight font-bricolage">
              Detail Sewa
            </h2>
          </div>
          <div className="bg-[#09090b] text-white border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="text-center mb-8 relative z-10">
              <h3 className="text-2xl font-bold mb-3 font-bricolage">{lapangan?.nama || 'Gelora Bumi Mintarsih'}</h3>
              <p className="text-zinc-400 leading-relaxed text-sm max-w-2xl mx-auto">
                {lapangan?.deskripsi || 'Lapangan sepakbola standart nasional dengan rumput berkualitas dan fasilitas lengkap untuk pengalaman bermain terbaik.'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {sesiList.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                  <div>
                    <div className="font-bold text-white mb-1">{s.nama}</div>
                    <div className="text-xs text-zinc-400">{s.jam}</div>
                  </div>
                  <div className="text-lg font-bold text-emerald-400 font-bricolage">
                    Rp {s.harga.toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div id="jadwal" className="mb-20 scroll-mt-24">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Jadwal</p>
            <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight font-bricolage">
              Cek Ketersediaan
            </h2>
          </div>
          <div className="relative">
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
