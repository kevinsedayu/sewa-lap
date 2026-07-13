'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Printer, XCircle, CheckCircle2, Ban, FileText } from 'lucide-react'

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
}
const statusLabel: Record<string, string> = {
  pending: 'Menunggu',
  confirmed: 'Dikonfirmasi',
  cancelled: 'Dibatalkan',
  completed: 'Selesai',
  maintenance: 'Perawatan',
}

export default function BookingTable({ initialBookings }: { initialBookings: Booking[] }) {
  const [bookings, setBookings] = useState(initialBookings)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

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
          const message = status === 'confirmed'
            ? `Halo ${nama},\n\nPeminjaman lapangan sepak bola Anda telah disetujui oleh admin.\n\nTanggal:\n${tanggalFormat}\n\nSilakan datang sesuai jadwal yang telah ditentukan.\n\nTerima kasih.`
            : `Halo ${nama},\n\nMohon maaf, peminjaman lapangan sepak bola Anda belum dapat kami setujui.\n\n${catatan ? 'Alasan: ' + catatan + '\n\n' : ''}Silakan kirimkan nomor rekening Anda agar proses pengembalian dana dapat dilakukan.\n\nTerima kasih.`
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
    const now = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const html = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><title>Laporan Persewaan</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;color:#09090b;padding:32px;font-size:13px}
.header{margin-bottom:24px;border-bottom:2px solid #09090b;padding-bottom:16px}.header h1{font-size:20px;font-weight:700}
.header p{font-size:12px;color:#71717a;margin-top:4px}.meta{display:flex;gap:24px;margin-bottom:20px;font-size:12px}
.meta span{color:#71717a}.meta b{color:#09090b}table{width:100%;border-collapse:collapse}
th{background:#f4f4f5;padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#52525b;border-bottom:2px solid #e4e4e7}
td{padding:10px 12px;border-bottom:1px solid #f4f4f5;vertical-align:top}tr:last-child td{border-bottom:none}
.footer{margin-top:32px;font-size:11px;color:#a1a1aa;text-align:center;border-top:1px solid #e4e4e7;padding-top:16px}
</style></head><body>
<div class="header"><h1>Gelora Bumi Mintarsih</h1><p>Laporan Data Persewaan Lapangan</p></div>
<div class="meta"><div><span>Filter: </span><b>${filterLabel}</b></div><div><span>Jumlah: </span><b>${filtered.length} data</b></div><div><span>Dicetak: </span><b>${now}</b></div></div>
<table><thead><tr><th>Penyewa</th><th>No. Telepon</th><th>Tanggal</th><th>Sesi</th><th>Total</th><th>Status</th><th>Catatan</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">Dokumen dicetak otomatis dari Sistem Persewaan Lapangan Gelora Bumi Mintarsih &bull; ${now}</div>
</body></html>`
    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(() => win.print(), 500) }
  }

  const filtered = bookings
    .filter(b => filter === 'all' || b.status === filter)
    .filter(b => {
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (b.profiles?.full_name || '').toLowerCase().includes(q) || (b.profiles?.phone || '').toLowerCase().includes(q)
    })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Semua' },
            { key: 'pending', label: 'Menunggu' },
            { key: 'confirmed', label: 'Dikonfirmasi' },
            { key: 'completed', label: 'Selesai' },
            { key: 'cancelled', label: 'Dibatalkan' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${filter === f.key ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm' : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700'}`}>
              {f.label}
              {f.key !== 'all' && <span className={`ml-1.5 ${filter === f.key ? 'opacity-70' : 'opacity-50'}`}>({bookings.filter(b => b.status === f.key).length})</span>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input type="text" placeholder="Cari nama / telepon..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-400 transition-all" />
          </div>
          <button onClick={handlePrint} title="Cetak / Export PDF"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 transition-colors shadow-sm whitespace-nowrap">
            <Printer size={14} /> Cetak / PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-200/80">
                  {['Penyewa','Tanggal','Sesi','Total','Bukti','Catatan','Status','Aksi'].map(h => (
                    <th key={h} className="px-5 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map(b => (
                  <tr key={b.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="text-sm font-semibold text-zinc-900">{b.profiles?.full_name || 'Tidak diketahui'}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">{b.profiles?.phone || '-'}</div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-zinc-800 whitespace-nowrap">
                      {new Date(b.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold capitalize text-zinc-900">{b.sesi}</div>
                      <div className="text-xs text-zinc-400">{b.jam_mulai?.slice(0,5)} - {b.jam_selesai?.slice(0,5)}</div>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-zinc-900 whitespace-nowrap">
                      Rp {Number(b.total_harga).toLocaleString('id-ID')}
                    </td>
                    <td className="px-5 py-4">
                      {b.bukti_pembayaran ? (
                        <a href={b.bukti_pembayaran} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-xs underline underline-offset-2">
                          <FileText size={12} /> Lihat
                        </a>
                      ) : <span className="text-zinc-300">-</span>}
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-500 max-w-[130px]">
                      <span title={b.catatan || ''} className="line-clamp-2">{b.catatan || '-'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ background: (statusColor[b.status] || '#a1a1aa') + '18', color: statusColor[b.status] || '#a1a1aa' }}>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${modalType === 'reject' ? 'bg-red-100' : 'bg-orange-100'}`}>
                {modalType === 'reject' ? <XCircle size={20} className="text-red-600" /> : <Ban size={20} className="text-orange-600" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">
                  {modalType === 'reject' ? 'Tolak Persewaan' : 'Batalkan Persewaan'}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {modalType === 'reject' ? 'Alasan penolakan akan dikirim via WhatsApp.' : 'Alasan pembatalan akan dikirim via WhatsApp.'}
                </p>
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-xs font-semibold text-zinc-700 mb-2">
                Alasan {modalType === 'reject' ? 'Penolakan' : 'Pembatalan'} <span className="text-zinc-400 font-normal">(opsional)</span>
              </label>
              <textarea rows={3} value={alasan} onChange={e => setAlasan(e.target.value)}
                placeholder={modalType === 'reject' ? 'Contoh: Bukti pembayaran tidak sesuai...' : 'Contoh: Lapangan tidak tersedia pada tanggal tersebut...'}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-400 transition-all resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors">
                Batal
              </button>
              <button onClick={handleModalSubmit}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-colors shadow-sm ${modalType === 'reject' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'}`}>
                {modalType === 'reject' ? 'Ya, Tolak' : 'Ya, Batalkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
