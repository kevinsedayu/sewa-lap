import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { data: bookings } = await supabase.from('sewa').select('*, profiles(full_name)')
  const { data: users } = await supabase.from('profiles').select('id').eq('role', 'user')
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

  const today = new Date().toISOString().split('T')[0]
  const bookingHariIni = bookings?.filter(b => b.tanggal === today).length ?? 0
  const bookingPending = bookings?.filter(b => b.status === 'pending').length ?? 0
  const bookingConfirmed = bookings?.filter(b => b.status === 'confirmed').length ?? 0
  const totalUser = users?.length ?? 0

  const stats = [
    { label: 'Booking Hari Ini', value: String(bookingHariIni), icon: '📅', desc: 'Masuk hari ini' },
    { label: 'Menunggu', value: String(bookingPending), icon: '⏳', desc: 'Perlu ditindak' },
    { label: 'Booking Aktif', value: String(bookingConfirmed), icon: '✅', desc: 'Dikonfirmasi' },
    { label: 'Total User', value: String(totalUser), icon: '👥', desc: 'User terdaftar' },
  ]

  const { data: recentBookings } = await supabase
    .from('sewa')
    .select('*, profiles(full_name, phone)')
    .order('created_at', { ascending: false })
    .limit(5)

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
            <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain shrink-0 drop-shadow-md transition-transform hover:scale-105" />
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
      <div className="p-6 sm:p-8 max-w-6xl mx-auto space-y-8">

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

      {/* Greeting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#09090b] p-8 rounded-3xl border border-zinc-800 shadow-[0_10px_40px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <p className="text-sm text-emerald-500 font-bold tracking-widest uppercase mb-2">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h2 className="text-2xl font-extrabold text-white tracking-tight font-bricolage">
            Selamat datang, {profile?.full_name || 'Admin'} 👋
          </h2>
        </div>
        <Link 
          href="/admin/booking" 
          className="relative z-10 inline-flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:-translate-y-1"
        >
          Kelola Booking
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { ...stats[0], color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-zinc-800' },
          { ...stats[1], color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-zinc-800' },
          { ...stats[2], color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-zinc-800' },
          { ...stats[3], color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-zinc-800' }
        ].map((stat) => (
          <div key={stat.label} className={`bg-[#09090b] border ${stat.border} rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-colors`}>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} font-bold`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-4xl font-extrabold text-white tracking-tight mb-2 font-bricolage relative z-10">
              {stat.value}
            </div>
            <div className="text-xs text-zinc-500 font-medium relative z-10">{stat.desc}</div>
            
            {/* Subtle glow on hover */}
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${stat.bg}`}></div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Booking Terbaru</h2>
          <Link href="/admin/booking" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
            Lihat semua &rarr;
          </Link>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm">
          {recentBookings && recentBookings.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-200/80">
                  {['Nama Penyewa', 'Tanggal', 'Jam', 'Total', 'Status'].map(h => (
                    <th key={h} className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/80">
                {recentBookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-zinc-900">{b.profiles?.full_name || '-'}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{b.profiles?.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                      {new Date(b.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 font-medium">
                      {b.jam_mulai?.slice(0, 5)} – {b.jam_selesai?.slice(0, 5)}
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
              <p className="text-sm font-medium text-zinc-500">Belum ada booking masuk</p>
            </div>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden space-y-3">
          {recentBookings && recentBookings.length > 0 ? (
            recentBookings.map((b: any) => (
              <div key={b.id} className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-sm text-zinc-900 capitalize">{b.profiles?.full_name || '-'}</div>
                    <div className="text-xs text-zinc-500 mt-1 font-medium">
                      {b.profiles?.phone || '-'}
                    </div>
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
              <p className="text-sm font-medium text-zinc-500">Belum ada booking masuk</p>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
