'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

type Booking = {
  id: string
  tanggal: string
  jam_mulai: string
  jam_selesai: string
  sesi: string
  total_harga: number
  status: string
  catatan: string | null
  bukti_pembayaran: string | null
  profiles: { full_name: string | null; phone: string | null } | null
}

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

export default function BookingTable({ initialBookings }: { initialBookings: Booking[] }) {
  const [bookings, setBookings] = useState(initialBookings)
  const [filter, setFilter] = useState('all')
  const [isPending, startTransition] = useTransition()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const supabase = createClient()

  const updateStatus = async (id: string, status: string) => {
    setLoadingId(id)
    const { error } = await supabase
      .from('sewa')
      .update({ status })
      .eq('id', id)

    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))

      // Kirim Notifikasi WA jika di-approve (confirmed) atau ditolak (cancelled)
      const booking = bookings.find(b => b.id === id)
      if (booking && (status === 'confirmed' || status === 'cancelled')) {
        const phone = booking.profiles?.phone
        if (phone) {
          const nama = booking.profiles?.full_name || 'Penyewa'
          const tanggalFormat = new Date(booking.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
          
          const message = status === 'confirmed'
            ? `Halo ${nama},\n\nPeminjaman lapangan sepak bola Anda telah disetujui oleh admin.\n\nTanggal:\n${tanggalFormat}\n\nSilakan datang sesuai jadwal yang telah ditentukan.\n\nTerima kasih.`
            : `Halo ${nama},\n\nMohon maaf, peminjaman lapangan sepak bola Anda belum dapat kami setujui.\n\nSilakan kirimkan nomor rekening Anda agar proses pengembalian dana dapat dilakukan.\n\nTerima kasih.`
          
          try {
            const res = await fetch('/api/whatsapp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone, message })
            })
            
            const result = await res.json()
            
            if (!res.ok) {
              console.error("WhatsApp API Error:", result)
              alert(`Status berhasil diupdate, tetapi gagal mengirim notifikasi WhatsApp.\n\nError: ${result.error || 'Unknown'}\nDetail: ${JSON.stringify(result.details || '')}`)
            } else {
              alert('Status berhasil diupdate dan notifikasi WhatsApp terkirim!')
            }
          } catch (err: any) {
            console.error("WhatsApp API Fetch Error:", err)
            alert(`Status berhasil diupdate, tetapi terjadi error saat koneksi ke API WhatsApp.\n\nError: ${err.message}`)
          }
        } else {
          alert('Status berhasil diupdate, namun notifikasi WA tidak terkirim karena nomor telepon kosong.')
        }
      }
    } else {
      alert('Gagal mengupdate status: ' + error.message)
    }
    setLoadingId(null)
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: 'all', label: 'Semua' },
          { key: 'pending', label: 'Menunggu' },
          { key: 'confirmed', label: 'Dikonfirmasi' },
          { key: 'completed', label: 'Selesai' },
          { key: 'cancelled', label: 'Dibatalkan' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              filter === f.key
                ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm'
                : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700'
            }`}
          >
            {f.label}
            {f.key !== 'all' && (
              <span className={`ml-1.5 ${filter === f.key ? 'opacity-70' : 'opacity-50'}`}>
                ({bookings.filter(b => b.status === f.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-200/80">
                  {['Penyewa', 'Tanggal', 'Sesi', 'Total', 'Bukti', 'Status', 'Aksi'].map(h => (
                    <th key={h} className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/80">
                {filtered.map((b, i) => (
                  <tr key={b.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-zinc-900">
                        {b.profiles?.full_name || 'Tidak diketahui'}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {b.profiles?.phone || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                      {new Date(b.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 font-medium whitespace-nowrap">
                      <div className="font-semibold capitalize text-zinc-900">{b.sesi}</div>
                      <div className="text-xs text-zinc-500">{b.jam_mulai?.slice(0, 5)} – {b.jam_selesai?.slice(0, 5)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-zinc-900 whitespace-nowrap">
                      Rp {Number(b.total_harga).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {b.bukti_pembayaran ? (
                        <a 
                          href={b.bukti_pembayaran} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 transition-colors underline underline-offset-2"
                        >
                          Lihat Bukti
                        </a>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span 
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{
                          background: (statusColor[b.status] || '#a1a1aa') + '15',
                          color: statusColor[b.status] || '#a1a1aa',
                        }}
                      >
                        {statusLabel[b.status] || b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {b.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(b.id, 'confirmed')}
                              disabled={loadingId === b.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 transition-colors shadow-sm"
                            >
                              ✓ Setujui
                            </button>
                            <button
                              onClick={() => updateStatus(b.id, 'cancelled')}
                              disabled={loadingId === b.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 disabled:opacity-50 transition-colors"
                            >
                              ✕ Tolak
                            </button>
                          </>
                        )}
                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus(b.id, 'completed')}
                            disabled={loadingId === b.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 transition-colors shadow-sm"
                          >
                            ✓ Selesai
                          </button>
                        )}
                        {(b.status === 'cancelled' || b.status === 'completed') && (
                          <span className="text-zinc-300 font-bold">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="text-5xl mb-4 opacity-30">📭</div>
            <p className="text-sm font-medium text-zinc-500">Tidak ada booking dengan filter ini</p>
          </div>
        )}
      </div>
    </div>
  )
}
