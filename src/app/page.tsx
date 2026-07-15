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

        {/* Hero Section - Dirty Klab Style (Dark, Bold, Glowing) */}
        <div className="w-full relative overflow-hidden bg-[#09090b] text-center text-white">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(circle at center, rgba(16,185,129,0.15) 0%, rgba(9,9,11,0) 60%)'
          }}></div>
          
          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center px-6 pt-24 pb-12 sm:pt-32 sm:pb-16">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Pusat Sewa Lapangan
            </p>
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter leading-[1.1] mb-8 font-bricolage">
              BERMAIN LEBIH BEBAS,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">BOOKING LEBIH CEPAT</span>
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
              Sistem penyewaan lapangan sepakbola online Gelora Bumi Mintarsih. Jadwal real-time, bebas ribet, main kapan saja.
            </p>
            
            <a href="#jadwal" className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-xl text-base font-bold transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-1">
              Cek Ketersediaan
            </a>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
            <div className="rounded-3xl overflow-hidden border border-zinc-800 shadow-[0_20px_60px_rgba(16,185,129,0.15)] relative">
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent z-10"></div>
              <img src="/lapangan.jpeg" alt="Hero Lapangan" className="w-full h-auto object-cover max-h-[500px]" />
            </div>
          </div>
        </div>

        {/* Marquee Ticker */}
        <div className="marquee-wrapper bg-black py-2 border-y border-zinc-800">
          <div className="marquee-track">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="flex items-center gap-8 px-8 font-bold text-xs uppercase text-zinc-400 tracking-widest">
                Gelora Bumi Mintarsih
                <span className="text-emerald-500 text-[10px]">✦</span>
                Kalisegoro Semarang
                <span className="text-emerald-500 text-[10px]">✦</span>
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
                Fasilitas Premium
              </h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { src: '/lapangan2.jpeg', label: 'Lapangan Standart' },
              { src: '/toilet.jpeg', label: 'Toilet Bersih' },
              { src: '/mushola.jpeg', label: 'Mushola' },
              { src: '/bench.jpeg', label: 'Bench Pemain' }
            ].map((img, i) => (
              <div key={i} className="group relative h-[280px] rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-zinc-200">
                <img 
                  src={img.src} 
                  alt={img.label} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="w-8 h-1 bg-emerald-500 mb-3 rounded-full"></div>
                  <h3 className="text-white text-lg font-bold font-bricolage leading-tight">
                    {img.label}
                  </h3>
                </div>
              </div>
            ))}
          </div>
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
      
      {/* Footer */}
      <footer className="bg-[#09090b] text-zinc-400 py-8 border-t border-zinc-800 text-center text-sm">
        <p>© {new Date().getFullYear()} Gelora Bumi Mintarsih. Hak Cipta Dilindungi.</p>
      </footer>
    </div>
  )
}
