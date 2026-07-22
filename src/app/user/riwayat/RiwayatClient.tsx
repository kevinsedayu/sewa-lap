'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { XCircle, AlertTriangle } from 'lucide-react'

const statusColor: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#22c55e',
  cancelled: '#ef4444',
  completed: '#6366f1',
  cancel_request: '#f97316',
}
const statusLabel: Record<string, string> = {
  pending: 'Menunggu',
  confirmed: 'Dikonfirmasi',
  cancelled: 'Dibatalkan',
  completed: 'Selesai',
  cancel_request: 'Menunggu Pembatalan',
}

export default function RiwayatClient({ initialBookings }: { initialBookings: any[] }) {
  const [bookings, setBookings] = useState(initialBookings)
  const handleRequestCancel = async (b: any) => {
    if (!confirm('Anda akan diarahkan ke WhatsApp untuk meminta pembatalan ke admin. Lanjutkan?')) return
    
    setLoading(true)
    const { error } = await supabase.from('sewa').update({ status: 'cancel_request' }).eq('id', b.id)
    
    if (!error) {
      setBookings(prev => prev.map(item => item.id === b.id ? { ...item, status: 'cancel_request' } : item))
      const tanggalFormat = new Date(b.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      const text = `Halo admin, saya ingin meminta pembatalan sewa lapangan pada tanggal *${tanggalFormat}* sesi *${b.sesi}*. Mohon bantuannya.`
      const waUrl = `https://wa.me/6281328215620?text=${encodeURIComponent(text)}`
      window.open(waUrl, '_blank')
    } else {
      alert('Gagal mengirim permintaan: ' + error.message)
    }
    setLoading(false)
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="booking-table-view" style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f4f4f5', background: '#fafafa' }}>
                {['Tgl. Main', 'Sesi', 'Tanggal Dipesan', 'Total Bayar', 'Status', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? bookings.map((b: any, i: number) => (
                <tr key={b.id} style={{ borderBottom: i < bookings.length - 1 ? '1px solid #f4f4f5' : 'none' }}>
                  <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#09090b' }}>
                    {new Date(b.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#3f3f46' }}>
                    <div style={{ fontWeight: 600, textTransform: 'capitalize', color: '#09090b' }}>{b.sesi}</div>
                    <div style={{ fontSize: '11px', color: '#71717a', marginTop: '2px' }}>{b.jam_mulai?.slice(0, 5)} - {b.jam_selesai?.slice(0, 5)}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#52525b' }}>
                    {new Date(b.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#16a34a' }}>
                    Rp {Number(b.total_harga).toLocaleString('id-ID')}
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
                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => handleRequestCancel(b)}
                        disabled={loading}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                          background: '#fff', border: '1px solid #fca5a5', color: '#dc2626',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        <span>✕</span> Minta Batal
                      </button>
                    )}
                    {b.status === 'cancel_request' && (
                      <span style={{ fontSize: '12px', color: '#f97316', fontWeight: 500 }}>
                        ⏳ Menunggu admin
                      </span>
                    )}
                    {!['confirmed', 'cancel_request'].includes(b.status) && (
                      <span style={{ color: '#d4d4d8', fontSize: '14px' }}>—</span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center', color: '#a1a1aa' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>📭</div>
                    <p style={{ fontSize: '14px', margin: 0 }}>Belum ada riwayat sewa</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="booking-card-list">
        {bookings.length > 0 ? bookings.map((b: any) => (
          <div key={b.id} style={{
            background: '#fff', border: '1px solid #e4e4e7', borderRadius: '10px',
            padding: '14px 16px', marginBottom: '10px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', textTransform: 'capitalize', color: '#09090b' }}>
                  Sesi {b.sesi}
                </div>
                <div style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>
                  {new Date(b.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div style={{ fontSize: '12px', color: '#71717a', marginTop: '1px' }}>
                  {b.jam_mulai?.slice(0, 5)} – {b.jam_selesai?.slice(0, 5)}
                </div>
              </div>
              <span style={{
                display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
                fontSize: '11px', fontWeight: 600, flexShrink: 0, marginLeft: '8px',
                background: (statusColor[b.status] || '#a1a1aa') + '18',
                color: statusColor[b.status] || '#a1a1aa',
                whiteSpace: 'nowrap',
              }}>
                {statusLabel[b.status] || b.status}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>
                Rp {Number(b.total_harga).toLocaleString('id-ID')}
              </div>
              <div style={{ fontSize: '11px', color: '#a1a1aa' }}>
                Dipesan: {new Date(b.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </div>
            </div>
            {b.status === 'confirmed' && (
              <button
                onClick={() => handleRequestCancel(b)}
                disabled={loading}
                style={{
                  marginTop: '10px', width: '100%', padding: '8px',
                  borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                  background: '#fff5f5', border: '1px solid #fca5a5', color: '#dc2626',
                  cursor: 'pointer',
                }}
              >
                ✕ Minta Pembatalan
              </button>
            )}
            {b.status === 'cancel_request' && (
              <div style={{ marginTop: '10px', padding: '8px 12px', background: '#fff7ed', borderRadius: '8px', border: '1px solid #fed7aa', fontSize: '12px', color: '#c2410c', fontWeight: 500 }}>
                ⏳ Permintaan pembatalan sedang diproses admin
              </div>
            )}
          </div>
        )) : (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#a1a1aa', background: '#fff', borderRadius: '12px', border: '1px solid #e4e4e7' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📭</div>
            <p style={{ fontSize: '14px', margin: 0 }}>Belum ada riwayat sewa</p>
          </div>
        )}
      </div>

      {/* Removed Modal Konfirmasi Pembatalan since it goes straight to WA */}
    </>
  )
}
