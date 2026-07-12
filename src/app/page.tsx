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
    <div className="min-h-screen bg-zinc-50 font-sans pb-12">
      {/* Navbar / Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-6 py-4 flex justify-end items-center shadow-sm">
        <div>
          {user ? (
            <Link 
              href={dashboardPath} 
              className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm"
            >
              Ke Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-block text-sm text-zinc-600 font-medium">
                Ingin mau booking?
              </span>
              <Link 
                href="/login" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-[0_4px_12px_rgba(5,150,105,0.2)] hover:shadow-[0_4px_16px_rgba(5,150,105,0.3)] hover:-translate-y-0.5"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        
        {/* Header Photo & Title */}
        <div className="mb-12 text-center">
          <h1 className={`${anton.className} text-4xl sm:text-5xl text-emerald-800 tracking-wide uppercase mb-6 drop-shadow-sm`}>
            Gelora Bumi Mintarsih
          </h1>
          <div className="w-full h-[240px] sm:h-[320px] rounded-2xl overflow-hidden shadow-lg mb-6 relative group">
            <img 
              src="/lapangan.jpeg" 
              alt="Gelora Bumi Mintarsih" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
          </div>
          <p className="text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            Sistem penyewaan lapangan sepakbola online. Silakan cek jadwal yang masih kosong pada kalender di bawah ini, dan lakukan login untuk mulai booking!
          </p>
        </div>

        {/* Fasilitas Slider */}
        <div className="mb-16">
          <h2 className={`${anton.className} text-2xl text-emerald-800 mb-6 tracking-wide uppercase text-center drop-shadow-sm`}>
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
