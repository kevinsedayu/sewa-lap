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
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-[#09090b]/90 backdrop-blur-md text-white border-b border-zinc-800 shadow-lg">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain shrink-0 drop-shadow-[0_0_15px_rgba(67,56,202,0.5)] transition-transform hover:scale-105" />
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

        {/* Hero Section — Video Background, full width, constrained height on desktop */}
        <div className="w-full relative overflow-hidden text-center text-white h-[55vh] md:h-[90vh] max-h-[1000px]">
          
          {/* Robust Background Video with Client Component forcing playback */}
          <BackgroundVideo />

          {/* Dark overlay + text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 pt-6 sm:pt-0"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.55) 100%)' }}>
            <h1 className="hero-title-gradient text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tighter leading-[1.1] mb-2 sm:mb-6 font-bricolage">
              SEWA LAPANGAN<br/>
              <span>GELORA BUMI MINTARSIH</span>
            </h1>
            <p className="text-xs sm:text-lg text-[rgba(255,255,255,0.85)] max-w-2xl mx-auto leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)] px-2 mt-3 sm:mt-0">
              Sistem penyewaan lapangan sepakbola online Gelora Bumi Mintarsih Kalisegoro, Gunungpati, Kota Semarang
            </p>
          </div>
        </div>

        {/* Marquee Ticker — directly below video, no gap */}
        <div className="marquee-wrapper py-2 border-y" style={{ background: '#172554', borderColor: 'rgba(67,56,202,0.25)' }}>
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
        
        {/* Info & Fasilitas Hub (Premium Dark Section) */}
        <div className="mb-20 rounded-3xl p-8 sm:p-12 shadow-[0_20px_60px_rgba(23,37,84,0.4)] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #172554 0%, #312e81 100%)', border: '1px solid rgba(67,56,202,0.3)' }}>
          {/* Subtle Glow Background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Teks Tentang Lapangan */}
            <div>
              <div className="w-12 h-1 bg-indigo-400 mb-6 rounded-full"></div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-bricolage mb-6 leading-tight">
                Mengenal <span className="text-blue-300">Gelora Bumi Mintarsih</span>
              </h2>
              <div className="space-y-4 text-white/80 leading-relaxed text-base sm:text-lg font-medium">
                <p>
                  Gelora Bumi Mintarsih adalah lapangan sepakbola berstandar nasional yang berlokasi strategis di <strong>Sedayu RW 01, Kalisegoro, Gunungpati, Kota Semarang</strong>. 
                </p>
                <p>
                  Kami hadir untuk memenuhi kebutuhan para pecinta sepakbola dengan menyajikan kualitas rumput terbaik yang selalu mendapat perawatan rutin secara profesional. Dilengkapi dengan berbagai fasilitas pendukung yang memadai, Gelora Bumi Mintarsih memastikan kenyamanan bermain Anda baik untuk latihan rutin maupun turnamen resmi.
                </p>
                <p className="pt-4 mt-4 border-t border-white/10 text-blue-200">
                  Lapangan ini secara resmi dikelola oleh <strong>@putrapermadafc</strong>, menjamin tata kelola yang profesional dan pelayanan yang tanggap.
                </p>
              </div>
            </div>

            {/* Foto Lapangan Utama */}
            <div className="relative h-[300px] sm:h-[400px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
              <img src="/lapangan.jpeg" alt="Gelora Bumi Mintarsih Lapangan Utama" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#172554]/90 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-bold text-lg font-bricolage">Kualitas Rumput Standar Nasional</p>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-8 font-bricolage text-center lg:text-left">
              Fasilitas Pendukung
            </h3>
            <FasilitasGallery />
          </div>
        </div>

        {/* Info Lapangan & Harga */}
        <div className="mb-20 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight font-bricolage">
              Informasi Detail Sewa
            </h2>
          </div>
          <div className="bg-[#09090b] text-white border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
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
                  <div className="text-lg font-bold text-blue-400 font-bricolage">
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
