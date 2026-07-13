import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function UserDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { data: userBookings } = await supabase
    .from('sewa')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const { data: lapangan } = await supabase.from('lapangan').select('*').limit(1).single()

  let sesiList: any[] = []
  if (lapangan?.fasilitas) {
    if (Array.isArray(lapangan.fasilitas)) {
      sesiList = lapangan.fasilitas.map((f: string) => JSON.parse(f))
    } else if (typeof lapangan.fasilitas === 'string') {
      try {
        const p = JSON.parse(lapangan.fasilitas)
        if (p.sesi && Array.isArray(p.sesi)) sesiList = p.sesi
      } catch (e) {}
    } else if (lapangan.fasilitas.sesi && Array.isArray(lapangan.fasilitas.sesi)) {
      sesiList = lapangan.fasilitas.sesi
    }
  }
  if (sesiList.length === 0) {
    sesiList = [
      { id: 'pagi', nama: 'Sesi Pagi', jam: '07:00-12:00', harga: 200000 },
      { id: 'sore', nama: 'Sesi Sore', jam: '15:00-18:00', harga: 250000 }
    ]
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam'

  const bookingAktif = userBookings?.filter(b => b.status === 'confirmed').length ?? 0
  const bookingPending = userBookings?.filter(b => b.status === 'pending').length ?? 0
  const totalBooking = userBookings?.length ?? 0

  const statusColor: Record<string, string> = {
    pending: '#f59e0b',
    confirmed: '#22c55e',
    cancelled: '#ef4444',
    completed: '#6366f1',
  }
  const statusLabel: Record<string, string> = {
    pending: 'Menunggu',
    confirmed: 'Dikonfirmasi',
    cancelled: 'Dibatalkan',
    completed: 'Selesai',
  }

  return (
    <div className="min-h-screen">
      {/* Top Header & Hero Image — FULL WIDTH */}
      <div className="w-full">
        {/* Top Navbar Bar */}
        <div className="flex items-center pl-20 pr-6 py-4 bg-zinc-900 text-white">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full object-contain bg-white shrink-0 shadow-lg ring-2 ring-emerald-500/30 p-0.5 transition-transform hover:scale-105" />
            <span className="text-lg font-bold tracking-wide">Gelora Bumi Mintarsih</span>
          </div>
        </div>

        {/* Hero Image — full width, clean, NO text overlay */}
        <div className="w-full h-[220px] sm:h-[320px] relative overflow-hidden">
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

      {/* Content below hero */}
      <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8">

      {/* Fasilitas Slider */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-emerald-800 mb-4 tracking-tight uppercase text-center">
          Fasilitas Kami
        </h2>
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {[
            { src: '/lapangan2.jpeg', label: 'Lapangan Standart Nasional' },
            { src: '/toilet.jpeg', label: 'Toilet Bersih' },
            { src: '/mushola.jpeg', label: 'Mushola' },
            { src: '/bench.jpeg', label: 'Bench Pemain' }
          ].map((img, i) => (
            <div key={i} className="snap-center shrink-0 w-[240px] h-[160px] rounded-xl overflow-hidden relative shadow-sm group">
              <img src={img.src} alt={img.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white p-3 pt-8 text-center text-sm font-semibold">
                {img.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Lapangan */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-zinc-900 mb-4 tracking-tight">Informasi Lapangan</h2>
        <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-zinc-900 mb-2">{lapangan?.nama || 'Nama Lapangan'}</h3>
          <p className="text-sm text-zinc-600 mb-6 leading-relaxed">{lapangan?.deskripsi || 'Deskripsi belum ditambahkan.'}</p>
          <div className="flex flex-wrap gap-3">
            {sesiList.map((s: any, idx: number) => (
              <div key={s.id} className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-800">{s.nama} ({s.jam || 'Jam belum diatur'})</span>
                <span className="text-emerald-300">|</span>
                <span className="text-xs font-bold text-emerald-600">Rp {s.harga.toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Greeting & Quick Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm">
        <div>
          <p className="text-sm text-zinc-500 font-medium mb-1">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
            {greeting}, {profile?.full_name || 'User'} 👋
          </h2>
        </div>
        <Link 
          href="/user/booking" 
          className="inline-flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
        >
          Booking Sekarang
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Booking Aktif', value: String(bookingAktif), desc: 'Sudah dikonfirmasi', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Menunggu', value: String(bookingPending), desc: 'Sedang diproses', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Total Booking', value: String(totalBooking), desc: 'Semua riwayat', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{card.label}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${card.bg} ${card.color} font-bold`}>
                {card.value}
              </div>
            </div>
            <div className="text-3xl font-extrabold text-zinc-900 tracking-tight mb-1">
              {card.value}
            </div>
            <div className="text-xs text-zinc-500 font-medium">{card.desc}</div>
          </div>
        ))}
      </div>

      {/* CTA Banner */}
      <div className="bg-zinc-900 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-white text-lg font-bold mb-1 tracking-tight">
            Siap bermain hari ini?
          </h2>
          <p className="text-zinc-400 text-sm font-medium">
            Lapangan tersedia setiap hari. Booking sekarang!
          </p>
        </div>
        <Link 
          href="/user/booking" 
          className="relative z-10 bg-white hover:bg-zinc-100 text-zinc-900 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm shrink-0"
        >
          Pilih Jadwal →
        </Link>
      </div>

      {/* Riwayat Booking */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Riwayat Booking Terbaru</h2>
          <Link href="/user/riwayat" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
            Lihat semua &rarr;
          </Link>
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm">
          {userBookings && userBookings.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-200/80">
                  {['Tanggal', 'Sesi / Jam', 'Total Harga', 'Status'].map(h => (
                    <th key={h} className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/80">
                {userBookings.slice(0, 5).map((b: any) => (
                  <tr key={b.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                      {new Date(b.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      <div className="font-semibold capitalize text-zinc-900">{b.sesi}</div>
                      <div className="text-xs mt-0.5 text-zinc-500">{b.jam_mulai?.slice(0, 5)} – {b.jam_selesai?.slice(0, 5)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-zinc-900">
                      Rp {Number(b.total_harga).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: statusColor[b.status] + '15', color: statusColor[b.status] }}>
                        {statusLabel[b.status] || b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3 opacity-50">📭</div>
              <p className="text-sm font-medium text-zinc-500">Belum ada riwayat booking</p>
            </div>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden space-y-3">
          {userBookings && userBookings.length > 0 ? (
            userBookings.slice(0, 5).map((b: any) => (
              <div key={b.id} className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-sm text-zinc-900 capitalize">Sesi {b.sesi}</div>
                    <div className="text-xs text-zinc-500 mt-1 font-medium">
                      {new Date(b.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      <span className="mx-1">&middot;</span>
                      {b.jam_mulai?.slice(0, 5)} – {b.jam_selesai?.slice(0, 5)}
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 ml-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: statusColor[b.status] + '15', color: statusColor[b.status] }}>
                    {statusLabel[b.status] || b.status}
                  </span>
                </div>
                <div className="text-sm font-extrabold text-zinc-900">
                  Rp {Number(b.total_harga).toLocaleString('id-ID')}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-zinc-200/80 rounded-xl py-12 text-center shadow-sm">
              <div className="text-3xl mb-2 opacity-50">📭</div>
              <p className="text-sm font-medium text-zinc-500">Belum ada riwayat booking</p>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
