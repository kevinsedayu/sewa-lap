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
            const apiUrl = process.env.NEXT_PUBLIC_WA_API_URL || 'https://creole-giggle-stimulate.ngrok-free.dev/api/message/send'
            const apiKey = process.env.NEXT_PUBLIC_WA_API_KEY || ''
            
            const res = await fetch(apiUrl, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'X-Api-Key': apiKey,
                'ngrok-skip-browser-warning': '1'
              },
              body: JSON.stringify({ to: phone, text: message })
            })
            
            if (!res.ok) {
              const errorText = await res.text()
              console.error("WhatsApp API Error:", res.status, errorText)
              alert(`Status berhasil diupdate, tetapi gagal mengirim notifikasi WhatsApp.\n\nError Code: ${res.status}\nResponse: ${errorText}`)
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
    <div>
      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
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
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: filter === f.key ? '#09090b' : '#e4e4e7',
              background: filter === f.key ? '#09090b' : '#ffffff',
              color: filter === f.key ? '#fafafa' : '#71717a',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            {f.label}
            {f.key !== 'all' && (
              <span style={{ marginLeft: '6px', opacity: 0.7 }}>
                ({bookings.filter(b => b.status === f.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e4e4e7',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {filtered.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f4f4f5', background: '#fafafa' }}>
                  {['Penyewa', 'Tanggal', 'Sesi', 'Total', 'Bukti', 'Status', 'Aksi'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontSize: '11px', fontWeight: 600,
                      color: '#71717a', letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => (
                  <tr key={b.id} style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid #f4f4f5' : 'none',
                  }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#09090b' }}>
                        {b.profiles?.full_name || 'Tidak diketahui'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px' }}>
                        {b.profiles?.phone || '-'}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#3f3f46' }}>
                      {new Date(b.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#3f3f46', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{b.sesi}</div>
                      <div style={{ fontSize: '11px', color: '#a1a1aa' }}>{b.jam_mulai?.slice(0, 5)} – {b.jam_selesai?.slice(0, 5)}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#09090b', whiteSpace: 'nowrap' }}>
                      Rp {Number(b.total_harga).toLocaleString('id-ID')}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px' }}>
                      {b.bukti_pembayaran ? (
                        <a 
                          href={b.bukti_pembayaran} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}
                        >
                          Lihat Bukti
                        </a>
                      ) : (
                        <span style={{ color: '#a1a1aa' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px',
                        borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                        background: (statusColor[b.status] || '#a1a1aa') + '18',
                        color: statusColor[b.status] || '#a1a1aa',
                        whiteSpace: 'nowrap',
                      }}>
                        {statusLabel[b.status] || b.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {b.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(b.id, 'confirmed')}
                              disabled={loadingId === b.id}
                              style={{
                                padding: '5px 12px', border: 'none',
                                borderRadius: '6px', fontSize: '11px',
                                fontWeight: 600, cursor: 'pointer',
                                background: '#22c55e', color: '#fff',
                                fontFamily: 'inherit',
                                opacity: loadingId === b.id ? 0.5 : 1,
                              }}
                            >
                              ✓ Setujui
                            </button>
                            <button
                              onClick={() => updateStatus(b.id, 'cancelled')}
                              disabled={loadingId === b.id}
                              style={{
                                padding: '5px 12px', border: '1px solid #e4e4e7',
                                borderRadius: '6px', fontSize: '11px',
                                fontWeight: 600, cursor: 'pointer',
                                background: '#fff', color: '#ef4444',
                                fontFamily: 'inherit',
                                opacity: loadingId === b.id ? 0.5 : 1,
                              }}
                            >
                              ✕ Tolak
                            </button>
                          </>
                        )}
                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => updateStatus(b.id, 'completed')}
                            disabled={loadingId === b.id}
                            style={{
                              padding: '5px 12px', border: 'none',
                              borderRadius: '6px', fontSize: '11px',
                              fontWeight: 600, cursor: 'pointer',
                              background: '#6366f1', color: '#fff',
                              fontFamily: 'inherit',
                              opacity: loadingId === b.id ? 0.5 : 1,
                            }}
                          >
                            ✓ Selesai
                          </button>
                        )}
                        {(b.status === 'cancelled' || b.status === 'completed') && (
                          <span style={{ fontSize: '11px', color: '#d4d4d8' }}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#a1a1aa' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
            <p style={{ fontSize: '14px', margin: 0 }}>Tidak ada booking dengan filter ini</p>
          </div>
        )}
      </div>
    </div>
  )
}
