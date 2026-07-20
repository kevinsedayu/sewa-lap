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
        <div className="marquee-wrapper py-1.5 border-y" style={{ background: '#0F172A', borderColor: '#1e2d5a' }}>
          <div className="marquee-track">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="flex items-center gap-6 px-6 font-bold text-sm uppercase" style={{ color: '#93c5fd', letterSpacing: '0.05em' }}>
                Gelora Bumi Mintarsih Kalisegoro
                <span style={{ color: '#60a5fa', fontSize: '10px' }}>✦</span>
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
      <div className="mb-6 relative">
        <h2 className="text-lg font-bold text-zinc-900 mb-4 tracking-tight">Informasi Lapangan</h2>
        <div className="rounded-2xl p-6 shadow-[0_10px_40px_rgba(15,23,42,0.4)] relative overflow-hidden" style={{ background: '#0F172A', border: '1px solid rgba(99,119,180,0.25)' }}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <h3 className="text-lg font-bold text-white mb-2 relative z-10">{lapangan?.nama || 'Nama Lapangan'}</h3>
          <p className="text-sm text-white/60 mb-6 leading-relaxed relative z-10">{lapangan?.deskripsi || 'Deskripsi belum ditambahkan.'}</p>
          <div className="flex flex-wrap gap-3 relative z-10">
            {sesiList.map((s: any, idx: number) => (
              <div key={s.id} className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 flex items-center gap-2 backdrop-blur-sm">
                <span className="text-xs font-semibold text-white">{s.nama} ({s.jam || 'Jam belum diatur'})</span>
                <span className="text-white/30">|</span>
                <span className="text-xs font-bold text-blue-300">Rp {s.harga.toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Greeting & Quick Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-8 rounded-3xl shadow-[0_10px_40px_rgba(15,23,42,0.5)] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1e2d5a 100%)', border: '1px solid rgba(99,119,180,0.25)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <p className="text-sm text-white/70 font-bold tracking-widest uppercase mb-2">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {greeting}, {profile?.full_name || 'User'} 👋
          </h2>
        </div>
        <Link 
          href="/user/booking" 
          className="relative z-10 inline-flex items-center justify-center text-white px-6 py-3 rounded-xl text-sm font-bold transition-all hover:-translate-y-1"
          style={{ background: '#0F172A', boxShadow: '0 0 20px rgba(15,23,42,0.5)', border: '1px solid rgba(99,119,180,0.4)' }}
        >
          Booking Sekarang
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Booking Aktif', value: String(bookingAktif), desc: 'Sudah dikonfirmasi', color: 'text-blue-300', bg: 'bg-white/10', border: 'border-teal-600/30' },
          { label: 'Menunggu', value: String(bookingPending), desc: 'Sedang diproses', color: 'text-amber-200', bg: 'bg-amber-500/20', border: 'border-amber-500/20' },
          { label: 'Total Booking', value: String(totalBooking), desc: 'Semua riwayat', color: 'text-blue-200', bg: 'bg-blue-500/20', border: 'border-blue-500/20' },
        ].map((card) => (
          <div key={card.label} className={`rounded-3xl p-6 shadow-sm relative overflow-hidden group transition-all hover:scale-[1.02] hover:shadow-[0_10px_40px_rgba(30,45,90,0.6)]`} style={{ background: '#0F172A', border: '1px solid rgba(99,119,180,0.2)' }}>
            <div className="flex justify-between items-center mb-4 relative z-10">
              <span className="text-xs font-bold text-white/60 uppercase tracking-widest">{card.label}</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg} ${card.color} font-bold`}>
                {card.value}
              </div>
            </div>
            <div className="text-4xl font-extrabold text-white tracking-tight mb-2 font-bricolage relative z-10">
              {card.value}
            </div>
            <div className="text-xs text-white/40 font-medium relative z-10">{card.desc}</div>
            
            {/* Subtle glow on hover */}
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/5`}></div>
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
        <div className="hidden sm:block rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(15,23,42,0.4)] relative" style={{ background: '#0F172A', border: '1px solid rgba(99,119,180,0.25)' }}>
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          {userBookings && userBookings.length > 0 ? (
            <table className="w-full text-left border-collapse relative z-10">
              <thead>
                <tr className="bg-black/20 border-b border-white/10">
                  {['Tanggal', 'Sesi / Jam', 'Total Harga', 'Status'].map(h => (
                    <th key={h} className="px-6 py-4 text-xs font-semibold text-white/60 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {userBookings.slice(0, 5).map((b: any) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {new Date(b.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      <div className="font-semibold capitalize text-white">{b.sesi}</div>
                      <div className="text-xs mt-0.5 text-white/40">{b.jam_mulai?.slice(0, 5)} – {b.jam_selesai?.slice(0, 5)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-white">
                      Rp {Number(b.total_harga).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm" style={{ background: statusColor[b.status] + '20', color: statusColor[b.status], border: `1px solid ${statusColor[b.status]}40` }}>
                        {statusLabel[b.status] || b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center relative z-10">
              <div className="text-4xl mb-3 opacity-30">📭</div>
              <p className="text-sm font-medium text-zinc-500">Belum ada riwayat booking</p>
            </div>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden space-y-3">
          {userBookings && userBookings.length > 0 ? (
            userBookings.slice(0, 5).map((b: any) => (
              <div key={b.id} className="rounded-xl p-4 shadow-sm relative overflow-hidden" style={{ background: '#0F172A', border: '1px solid rgba(99,119,180,0.25)' }}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <div>
                    <div className="font-bold text-sm text-white capitalize">Sesi {b.sesi}</div>
                    <div className="text-xs text-white/50 mt-1 font-medium">
                      {new Date(b.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      <span className="mx-1 text-white/20">·</span>
                      {b.jam_mulai?.slice(0, 5)} – {b.jam_selesai?.slice(0, 5)}
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 ml-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: statusColor[b.status] + '20', color: statusColor[b.status], border: `1px solid ${statusColor[b.status]}40` }}>
                    {statusLabel[b.status] || b.status}
                  </span>
                </div>
                <div className="text-sm font-extrabold text-white relative z-10">
                  Rp {Number(b.total_harga).toLocaleString('id-ID')}
                </div>
              </div>
            ))
          ) : (
              <div className="rounded-xl py-12 text-center shadow-sm" style={{ background: '#0F172A', border: '1px solid rgba(99,119,180,0.25)' }}>
              <div className="text-3xl mb-2 opacity-30">📭</div>
              <p className="text-sm font-medium text-zinc-500">Belum ada riwayat booking</p>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
