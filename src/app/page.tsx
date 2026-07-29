import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import BookingCalendar from '@/components/shared/BookingCalendar'
import FasilitasGallery from '@/components/landing/FasilitasGallery'
import BackgroundVideo from '@/components/landing/BackgroundVideo'
import FadeIn from '@/components/shared/FadeIn'

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
      {/* Top Navbar / Header (Sticky) */}
      <div className="w-full">
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4 backdrop-blur-md bg-black/60 border-b border-white/10 text-white shadow-md transition-all">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0 drop-shadow-md transition-transform hover:scale-105" />
            <span className="text-base sm:text-lg font-bold tracking-wide font-bricolage">Gelora Bumi Mintarsih</span>
          </div>
          <div>
            {user ? (
              <Link href={dashboardPath} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline-block text-sm text-zinc-300 font-medium">
                  Belum punya akun?
                </span>
                <Link 
                  href="/login" 
                  className="bg-white hover:bg-zinc-200 text-black px-5 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm font-bold transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:-translate-y-0.5"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Hero Section — Video Background, full width, constrained height on desktop */}
        <div className="w-full relative overflow-hidden text-center text-white h-[55vh] md:h-[90vh] max-h-[1000px]">
          <img
            src="/vidlap3.gif"
            alt="Background Lapangan"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'grayscale(10%)' }}
          />
          {/* Dark overlay + text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 pt-6 sm:pt-0"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.55) 100%)' }}>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold tracking-tighter leading-[1.1] mb-2 sm:mb-6 font-bricolage drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)] text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-400 animate-gradient-x">
              SEWA LAPANGAN<br/>
              <span>GELORA BUMI MINTARSIH</span>
            </h1>
            <p className="text-xs sm:text-lg text-[rgba(255,255,255,0.85)] max-w-2xl mx-auto leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)] px-2 mt-3 sm:mt-0">
              Sistem penyewaan lapangan sepakbola online Gelora Bumi Mintarsih Kalisegoro, Gunungpati, Kota Semarang
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {/* Fasilitas Section (Luxurious Cards) */}
        <FadeIn delay={100}>
          <div className="mb-20">
            <div className="flex flex-col items-center justify-center text-center mb-8">
              <div>
                <h2 className="text-4xl font-extrabold text-zinc-900 tracking-tight font-bricolage">
                  Fasilitas Kami
                </h2>
              </div>
            </div>
            
            <FasilitasGallery />
          </div>
        </FadeIn>

        {/* Info Lapangan & Harga */}
        <FadeIn delay={150}>
          <div className="mb-20 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight font-bricolage">
                Informasi Detail Sewa
              </h2>
            </div>
            <div className="bg-[#09090b] text-white border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="text-center mb-8 relative z-10">
                <h3 className="text-2xl font-bold mb-3 font-bricolage">{lapangan?.nama || 'Gelora Bumi Mintarsih'}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl mx-auto">
                  {lapangan?.deskripsi || 'Lapangan sepakbola standart nasional dengan rumput berkualitas dan fasilitas lengkap untuk pengalaman bermain terbaik.'}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-emerald-400">📍 Kalisegoro, Gunungpati</span>
                  <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-teal-400">⚽ Rumput Asli</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                {sesiList.map((s: any) => (
                  <div key={s.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex justify-between items-center transition-all hover:bg-white/10 hover:-translate-y-1 hover:border-emerald-500/30 group">
                    <div>
                      <div className="font-bold text-lg mb-1 group-hover:text-emerald-400 transition-colors">{s.nama}</div>
                      <div className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {s.jam}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-extrabold text-white">Rp {Number(s.harga).toLocaleString('id-ID')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Kalender Section */}
        <FadeIn delay={200}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight font-bricolage mb-3">
                Jadwal Ketersediaan
              </h2>
              <p className="text-zinc-500 text-sm max-w-md mx-auto">
                Periksa ketersediaan lapangan secara real-time. Slot berwarna hijau menandakan lapangan tersedia dan siap dipesan.
              </p>
            </div>
            
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
              <BookingCalendar 
                isAdmin={false} 
                bookings={(allBookings || []).map(b => ({
                  tanggal: b.tanggal,
                  sesi: b.sesi,
                  status: b.status
                }))}
              />
            </div>
            
            <div className="mt-12 text-center">
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-full text-base font-bold transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(16,185,129,0.4)]"
              >
                Pesan Lapangan Sekarang
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
