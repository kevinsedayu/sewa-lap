'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Printer, XCircle, CheckCircle2, Ban, FileText, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

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
  maintenance: '#a78bfa',
  cancel_request: '#f97316',
}
const statusLabel: Record<string, string> = {
  pending: 'Menunggu',
  confirmed: 'Dikonfirmasi',
  cancelled: 'Dibatalkan',
  completed: 'Selesai',
  maintenance: 'Perawatan',
  cancel_request: 'Minta Pembatalan',
}

export default function BookingTable({ initialBookings }: { initialBookings: Booking[] }) {
  const [bookings, setBookings] = useState(initialBookings)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // Month filter: store as 'YYYY-MM' string, default = current month
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  )
  const [showAllMonths, setShowAllMonths] = useState(false)

  const monthLabel = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number)
    return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  }, [selectedMonth])

  const prevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number)
    const d = new Date(y, m - 2, 1)
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  const nextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number)
    const d = new Date(y, m, 1)
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'reject' | 'cancel'>('reject')
  const [modalBookingId, setModalBookingId] = useState<string | null>(null)
  const [alasan, setAlasan] = useState('')

  const supabase = createClient()

  const updateStatus = async (id: string, status: string, catatan?: string) => {
    setLoadingId(id)
    const updatePayload: any = { status }
    if (catatan) updatePayload.catatan = catatan

    const { error } = await supabase.from('sewa').update(updatePayload).eq('id', id)

    if (!error) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status, catatan: catatan ?? b.catatan } : b))
      const booking = bookings.find(b => b.id === id)
      if (booking && (status === 'confirmed' || status === 'cancelled')) {
        const phone = booking.profiles?.phone
        if (phone) {
          const nama = booking.profiles?.full_name || 'Penyewa'
          const tanggalFormat = new Date(booking.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
          let message = ''
          if (booking.status === 'cancel_request') {
            // Admin memproses permintaan pembatalan dari user
            if (status === 'cancelled') {
              message = `Halo ${nama},\n\nPermintaan pembatalan sewa lapangan Anda pada ${tanggalFormat} *TELAH DISETUJUI* oleh admin.\n\nMohon pastikan dana pengembalian (refund) sewa Anda sudah masuk ke rekening Anda (jika ada transaksi pengembalian).\n\nTerima kasih.`
            } else if (status === 'confirmed') {
              message = `Halo ${nama},\n\nPermintaan pembatalan sewa lapangan Anda pada ${tanggalFormat} DITOLAK (tidak jadi batal) oleh admin.\n\nJadwal Anda tetap aktif, silakan datang sesuai jadwal.\n\nTerima kasih.`
            }
          } else {
            // Proses normal (pesanan baru / batal sepihak admin)
            message = status === 'confirmed'
              ? `Halo ${nama},\n\nPeminjaman lapangan sepak bola Anda telah disetujui oleh admin.\n\nTanggal:\n${tanggalFormat}\n\nSilakan datang sesuai jadwal yang telah ditentukan.\n\nTerima kasih.`
              : `Halo ${nama},\n\nMohon maaf, peminjaman lapangan sepak bola Anda belum dapat kami setujui.\n\n${catatan ? 'Alasan: ' + catatan + '\n\n' : ''}Silakan kirimkan nomor rekening Anda agar proses pengembalian dana dapat dilakukan.\n\nTerima kasih.`
          }
          try {
            const res = await fetch('/api/whatsapp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, message }) })
            const result = await res.json()
            if (!res.ok) { alert('Status diupdate, gagal kirim WA: ' + (result.error || 'Unknown')) }
            else { alert('Status diupdate dan notifikasi WhatsApp terkirim!') }
          } catch (err: any) { alert('Status diupdate, error WA: ' + err.message) }
        } else { alert('Status diupdate. Nomor telepon kosong, WA tidak terkirim.') }
      } else if (!['confirmed','cancelled'].includes(status)) { alert('Status berhasil diupdate!') }
    } else { alert('Gagal: ' + error.message) }
    setLoadingId(null)
  }

  const openModal = (type: 'reject' | 'cancel', id: string) => {
    setModalType(type); setModalBookingId(id); setAlasan(''); setShowModal(true)
  }

  const handleModalSubmit = async () => {
    if (!modalBookingId) return
    setShowModal(false)
    await updateStatus(modalBookingId, 'cancelled', alasan || undefined)
  }

  const handlePrint = () => {
    const rows = filtered.map(b => `
      <tr>
        <td>${b.profiles?.full_name || '-'}</td>
        <td>${b.profiles?.phone || '-'}</td>
        <td>${new Date(b.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
        <td style="text-transform:capitalize">${b.sesi} (${b.jam_mulai?.slice(0,5)||''} - ${b.jam_selesai?.slice(0,5)||''})</td>
        <td>Rp ${Number(b.total_harga).toLocaleString('id-ID')}</td>
        <td>${statusLabel[b.status] || b.status}</td>
        <td>${b.catatan || '-'}</td>
      </tr>`).join('')
    const filterLabel = filter === 'all' ? 'Semua' : (statusLabel[filter] || filter)
    const bulanLabel = showAllMonths ? 'Semua Bulan' : monthLabel
    const now = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const html = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Laporan Persewaan</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;color:#09090b;padding:32px;font-size:13px}
.header{margin-bottom:24px;border-bottom:2px solid #09090b;padding-bottom:16px}.header h1{font-size:20px;font-weight:700}
.header p{font-size:12px;color:#71717a;margin-top:4px}.meta{display:flex;gap:24px;margin-bottom:20px;font-size:12px;flex-wrap:wrap}
.meta span{color:#71717a}.meta b{color:#09090b}table{width:100%;border-collapse:collapse}
th{background:#f4f4f5;padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#52525b;border-bottom:2px solid #e4e4e7}
td{padding:10px 12px;border-bottom:1px solid #f4f4f5;vertical-align:top}tr:last-child td{border-bottom:none}
.footer{margin-top:32px;font-size:11px;color:#a1a1aa;text-align:center;border-top:1px solid #e4e4e7;padding-top:16px}
</style></head><body>
<div class="header"><h1>Gelora Bumi Mintarsih</h1><p>Laporan Data Persewaan Lapangan</p></div>
<div class="meta"><div><span>Bulan: </span><b>${bulanLabel}</b></div><div><span>Filter Status: </span><b>${filterLabel}</b></div><div><span>Jumlah: </span><b>${filtered.length} data</b></div><div><span>Dicetak: </span><b>${now}</b></div></div>
<table><thead><tr><th>Penyewa</th><th>No. Telepon</th><th>Tanggal</th><th>Sesi</th><th>Total</th><th>Status</th><th>Catatan</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">Dokumen dicetak otomatis dari Sistem Persewaan Lapangan Gelora Bumi Mintarsih &bull; ${now}</div>
</body></html>`
    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(() => win.print(), 500) }
  }

  const filtered = bookings
    .filter(b => {
      // Month filter
      if (!showAllMonths) {
        const bookingMonth = b.tanggal?.slice(0, 7) // 'YYYY-MM'
        if (bookingMonth !== selectedMonth) return false
      }
      return true
    })
    .filter(b => filter === 'all' || b.status === filter)
    .filter(b => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (b.profiles?.full_name || '').toLowerCase().includes(q) || (b.profiles?.phone || '').toLowerCase().includes(q)
    })

  return (
    <div className="space-y-4">

      {/* Month Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-4 rounded-2xl" style={{ background: '#0F172A', border: '1px solid rgba(99,119,180,0.25)' }}>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-blue-300 shrink-0" />
          <span className="text-sm font-bold text-white/80">Filter Bulan:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Semua Persewaan */}
          <button onClick={() => setShowAllMonths(true)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={showAllMonths
              ? { background: 'linear-gradient(135deg, #1e3a8a, #1e40af)', border: '1px solid rgba(99,119,180,0.6)', color: '#bfdbfe' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }
            }>
            Semua Persewaan
          </button>
          {/* Manual month nav */}
          <div className="flex items-center gap-1">
            <button onClick={() => { prevMonth(); setShowAllMonths(false) }} className="w-7 h-7 flex items-center justify-center rounded-lg transition-all" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setShowAllMonths(false)}
              className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={!showAllMonths
                ? { background: 'linear-gradient(135deg, #1e3a8a, #1e40af)', border: '1px solid rgba(99,119,180,0.6)', color: '#bfdbfe', minWidth: '110px', textAlign: 'center' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', minWidth: '110px', textAlign: 'center' }
              }>
              {monthLabel}
            </button>
            <button onClick={() => { nextMonth(); setShowAllMonths(false) }} className="w-7 h-7 flex items-center justify-center rounded-lg transition-all" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Status Filter + Search + Print Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Semua' },
            { key: 'pending', label: 'Menunggu' },
            { key: 'cancel_request', label: 'Minta Batal' },
            { key: 'confirmed', label: 'Dikonfirmasi' },
            { key: 'completed', label: 'Selesai' },
            { key: 'cancelled', label: 'Dibatalkan' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${filter === f.key ? 'text-[#0A7A68] font-bold shadow-sm' : 'border-teal-700/40 text-teal-700 hover:border-teal-600 hover:text-teal-900'}`} style={filter === f.key ? { background: 'linear-gradient(135deg, #3DB8A0, #6CC9B4)', border: '1px solid rgba(61,184,160,0.5)' } : {}}>
              {f.label}
              {f.key !== 'all' && <span className={`ml-1.5 ${filter === f.key ? 'opacity-70' : 'opacity-50'}`}>({bookings.filter(b => b.status === f.key).length})</span>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input type="text" placeholder="Cari nama / telepon..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-zinc-800 bg-[#09090b] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
          </div>
          <button onClick={handlePrint} title="Cetak / Export PDF"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-zinc-800 bg-[#09090b] hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors shadow-sm whitespace-nowrap">
            <Printer size={14} /> Cetak / PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(15,23,42,0.4)] relative" style={{ background: '#0F172A', border: '1px solid rgba(99,119,180,0.25)' }}>
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        {filtered.length > 0 ? (
          <div className="overflow-x-auto relative z-10">
            <table className="w-full min-w-[900px] text-left border-collapse">
              <thead>
                <tr className="bg-black/20 border-b border-white/10">
                  {['Penyewa','Tanggal','Sesi','Total','Bukti','Catatan','Status','Aksi'].map(h => (
                    <th key={h} className="px-5 py-4 text-xs font-semibold text-white/60 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map(b => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4">
                      <div className="text-sm font-semibold text-white">{b.profiles?.full_name || 'Tidak diketahui'}</div>
                      <div className="text-xs text-white/50 mt-0.5">{b.profiles?.phone || '-'}</div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-white whitespace-nowrap">
                      {new Date(b.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold capitalize text-white">{b.sesi}</div>
                      <div className="text-xs text-white/50">{b.jam_mulai?.slice(0,5)} - {b.jam_selesai?.slice(0,5)}</div>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-white whitespace-nowrap">
                      Rp {Number(b.total_harga).toLocaleString('id-ID')}
                    </td>
                    <td className="px-5 py-4">
                      {b.bukti_pembayaran ? (
                        <a href={b.bukti_pembayaran} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 font-medium text-xs underline underline-offset-2">
                          <FileText size={12} /> Lihat
                        </a>
                      ) : <span className="text-white/20">-</span>}
                    </td>
                    <td className="px-5 py-4 text-xs text-white/50 max-w-[130px]">
                      <span title={b.catatan || ''} className="line-clamp-2">{b.catatan || '-'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shadow-sm"
                        style={{ background: (statusColor[b.status] || '#a1a1aa') + '20', color: statusColor[b.status] || '#a1a1aa', border: `1px solid ${(statusColor[b.status] || '#a1a1aa')}40` }}>
                        {statusLabel[b.status] || b.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5">
                        {b.status === 'pending' && (<>
                          <button onClick={() => updateStatus(b.id, 'confirmed')} disabled={loadingId === b.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap">
                            <CheckCircle2 size={12} /> Setujui
                          </button>
                          <button onClick={() => openModal('reject', b.id)} disabled={loadingId === b.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-white border border-red-200 hover:bg-red-50 disabled:opacity-50 transition-colors whitespace-nowrap">
                            <XCircle size={12} /> Tolak
                          </button>
                        </>)}
                        {b.status === 'confirmed' && (<>
                          <button onClick={() => updateStatus(b.id, 'completed')} disabled={loadingId === b.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap">
                            <CheckCircle2 size={12} /> Selesai
                          </button>
                          <button onClick={() => openModal('cancel', b.id)} disabled={loadingId === b.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-orange-600 bg-white border border-orange-200 hover:bg-orange-50 disabled:opacity-50 transition-colors whitespace-nowrap">
                            <Ban size={12} /> Batalkan
                          </button>
                        </>)}
                        {/* Admin: Setujui atau Tolak request pembatalan dari user */}
                        {b.status === 'cancel_request' && (<>
                          <div className="text-[10px] font-semibold text-orange-600 mb-1 whitespace-nowrap">⚠️ Minta Batal</div>
                          <button onClick={() => updateStatus(b.id, 'cancelled')} disabled={loadingId === b.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap">
                            <CheckCircle2 size={12} /> Setujui Batal
                          </button>
                          <button onClick={() => updateStatus(b.id, 'confirmed')} disabled={loadingId === b.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-50 disabled:opacity-50 transition-colors whitespace-nowrap">
                            <XCircle size={12} /> Tolak Batal
                          </button>
                        </>)}
                        {['cancelled','completed','maintenance'].includes(b.status) && (
                          <span className="text-zinc-300 text-lg font-bold leading-none">-</span>
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
            <div className="text-5xl mb-4 opacity-20">??</div>
            <p className="text-sm font-medium text-zinc-400">
              {search ? `Tidak ada hasil untuk "${search}"` : 'Tidak ada data persewaan dengan filter ini'}
            </p>
          </div>
        )}
      </div>

      {(search || filter !== 'all') && (
        <p className="text-xs text-zinc-400 text-right">
          Menampilkan <span className="font-semibold text-zinc-600">{filtered.length}</span> dari {bookings.length} data
        </p>
      )}

      {/* Modal Tolak / Batalkan */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl shadow-2xl w-full max-w-md p-6" style={{ background: '#0F172A', border: '1px solid rgba(99,119,180,0.3)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${modalType === 'reject' ? 'bg-red-500/20' : 'bg-orange-500/20'}`}>
                {modalType === 'reject' ? <XCircle size={20} className="text-red-300" /> : <Ban size={20} className="text-orange-300" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {modalType === 'reject' ? 'Tolak Persewaan' : 'Batalkan Persewaan'}
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  {modalType === 'reject' ? 'Alasan penolakan akan dikirim via WhatsApp.' : 'Alasan pembatalan akan dikirim via WhatsApp.'}
                </p>
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-xs font-semibold text-white/70 mb-2">
                Alasan {modalType === 'reject' ? 'Penolakan' : 'Pembatalan'} <span className="text-white/30 font-normal">(opsional)</span>
              </label>
              <textarea rows={3} value={alasan} onChange={e => setAlasan(e.target.value)}
                placeholder={modalType === 'reject' ? 'Contoh: Bukti pembayaran tidak sesuai...' : 'Contoh: Lapangan tidak tersedia pada tanggal tersebut...'}
                className="w-full px-3 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 transition-all resize-none" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)' }}>
                Batal
              </button>
              <button onClick={handleModalSubmit}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-black transition-colors shadow-sm ${modalType === 'reject' ? 'bg-red-500 hover:bg-red-400' : 'bg-orange-500 hover:bg-orange-400'}`}>
                {modalType === 'reject' ? 'Ya, Tolak' : 'Ya, Batalkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
