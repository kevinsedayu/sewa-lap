'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { FileText, Printer } from 'lucide-react'

export type TransaksiKeuangan = {
  id: string
  tipe: 'pemasukan' | 'pengeluaran'
  jumlah: number
  keterangan: string
  tanggal: string
  created_at: string
  sumber?: 'Sewa' | 'Manual'
}

interface KeuanganManagerProps {
  isAdmin: boolean
  initialTransaksi: TransaksiKeuangan[]
  totalPemasukan: number
  totalPengeluaran: number
}

export default function KeuanganManager({ isAdmin, initialTransaksi, totalPemasukan, totalPengeluaran }: KeuanganManagerProps) {
  const [transaksi, setTransaksi] = useState(initialTransaksi)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Filter bulan (Format YYYY-MM)
  const today = new Date()
  const [filterBulan, setFilterBulan] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`)
  
  // Form state
  const [tipe, setTipe] = useState<'pemasukan' | 'pengeluaran'>('pengeluaran')
  const [jumlah, setJumlah] = useState('')
  const [keterangan, setKeterangan] = useState('')
  const [tanggal, setTanggal] = useState(today.toISOString().split('T')[0])

  const [editingId, setEditingId] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jumlah || !keterangan || !tanggal) return

    setIsSubmitting(true)
    const newEntry = {
      tipe,
      jumlah: parseFloat(jumlah),
      keterangan,
      tanggal
    }

    if (editingId) {
      const { data, error } = await supabase
        .from('keuangan')
        .update(newEntry)
        .eq('id', editingId)
        .select()
        .single()

      if (!error && data) {
        setTransaksi(transaksi.map(t => t.id === editingId ? { ...data, sumber: 'Manual' } : t).sort((a, b) => {
          const dateDiff = new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
          if (dateDiff !== 0) return dateDiff;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }))
        setShowForm(false)
        resetForm()
      } else {
        toast.error("Gagal mengupdate data: " + (error?.message || 'Unknown error'))
      }
    } else {
      const { data, error } = await supabase
        .from('keuangan')
        .insert([newEntry])
        .select()
        .single()

      if (!error && data) {
        setTransaksi([{ ...data, sumber: 'Manual' }, ...transaksi].sort((a, b) => {
          const dateDiff = new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime();
          if (dateDiff !== 0) return dateDiff;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }))
        setShowForm(false)
        resetForm()
      } else {
        toast.error("Gagal menyimpan data: " + (error?.message || 'Unknown error'))
      }
    }
    setIsSubmitting(false)
  }

  const resetForm = () => {
    setEditingId(null)
    setJumlah('')
    setKeterangan('')
    setTipe('pengeluaran')
    setTanggal(today.toISOString().split('T')[0])
  }

  const handleDelete = async (id: string, sumber: string | undefined) => {
    if (sumber === 'Sewa') {
      toast.warning('Transaksi sewa tidak dapat dihapus dari menu keuangan. Silakan kelola di menu Booking / Kalender.')
      return
    }
    if (!confirm('Yakin ingin menghapus catatan keuangan ini?')) return

    const { error } = await supabase.from('keuangan').delete().eq('id', id)
    if (!error) {
      setTransaksi(transaksi.filter(t => t.id !== id))
    } else {
      toast.error('Gagal menghapus: ' + error.message)
    }
  }

  const handleEdit = (t: TransaksiKeuangan) => {
    if (t.sumber === 'Sewa') {
      toast.warning('Transaksi sewa tidak dapat diubah dari menu keuangan. Silakan kelola di menu Booking / Kalender.')
      return
    }
    setEditingId(t.id)
    setTipe(t.tipe)
    setJumlah(t.jumlah.toString())
    setKeterangan(t.keterangan)
    setTanggal(t.tanggal)
    setShowForm(true)
  }

  // Filter transaksi berdasarkan bulan
  const filteredTransaksi = transaksi.filter(t => {
    const tBulan = t.tanggal.substring(0, 7)
    return tBulan === filterBulan
  })

  // Hitung total dari data yang sudah di-filter
  const currentPemasukan = filteredTransaksi.filter(t => t.tipe === 'pemasukan').reduce((sum, t) => sum + Number(t.jumlah), 0)
  const currentPengeluaran = filteredTransaksi.filter(t => t.tipe === 'pengeluaran').reduce((sum, t) => sum + Number(t.jumlah), 0)
  const currentSaldo = currentPemasukan - currentPengeluaran

  // Bulan nama formatter
  const formatBulanTahun = (yyyyMm: string) => {
    const [y, m] = yyyyMm.split('-')
    const date = new Date(parseInt(y), parseInt(m) - 1, 1)
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  }

  // Handle Print
  const handlePrint = () => {
    window.print()
  }

  // Handle Export Excel (CSV)
  const handleExportExcel = () => {
    const bulanLabel = formatBulanTahun(filterBulan)
    const nowLabel = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    const fileName = `laporan-keuangan-${filterBulan}.csv`

    const header = ['No', 'Tanggal', 'Tipe', 'Keterangan', 'Jumlah (Rp)', 'Sumber']
    const dataRows = filteredTransaksi.map((t, i) => [
      i + 1,
      new Date(t.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      t.tipe === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran',
      t.keterangan,
      Number(t.jumlah),
      t.sumber || 'Manual',
    ])
    
    const csvRows = [header, ...dataRows]
    const csv = '\uFEFFsep=;\n' + csvRows.map(row =>
      row.map(cell => {
        const val = String(cell ?? '')
        return val.includes(';') || val.includes('"') || val.includes('\n')
          ? `"${val.replace(/"/g, '""')}"` : val
      }).join(';')
    ).join('\n')

    const tableRows = filteredTransaksi.map((t, i) => `
      <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
        <td class="center">${i + 1}</td>
        <td>${new Date(t.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
        <td class="center"><span class="badge tipe-${t.tipe}">${t.tipe === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}</span></td>
        <td>${t.keterangan}</td>
        <td class="right ${t.tipe === 'pemasukan' ? 'text-green' : 'text-red'}">Rp ${Number(t.jumlah).toLocaleString('id-ID')}</td>
        <td class="center">${t.sumber || 'Manual'}</td>
      </tr>`).join('')

    const html = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8">
<title>Preview Export Excel - Laporan Keuangan</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #09090b; background: #f4f4f5; }
  .toolbar { position: sticky; top: 0; z-index: 10; background: #09090b; color: white; padding: 14px 32px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
  .toolbar h2 { font-size: 15px; font-weight: 700; }
  .toolbar .subtitle { font-size: 12px; color: #a1a1aa; margin-top: 2px; }
  .btn-download { background: #16a34a; color: white; border: none; padding: 10px 22px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; }
  .btn-download:hover { background: #15803d; }
  .wrapper { max-width: 1000px; margin: 28px auto; background: white; border-radius: 12px; box-shadow: 0 2px 16px rgba(0,0,0,0.08); overflow: hidden; }
  .report-header { padding: 28px 32px 20px; border-bottom: 2px solid #e4e4e7; }
  .report-header h1 { font-size: 20px; font-weight: 800; color: #09090b; }
  .report-header p { font-size: 13px; color: #71717a; margin-top: 4px; }
  .meta { display: flex; gap: 32px; padding: 16px 32px; background: #fafafa; border-bottom: 1px solid #e4e4e7; flex-wrap: wrap; }
  .meta-item label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #a1a1aa; letter-spacing: .05em; display: block; }
  .meta-item span { font-size: 13px; font-weight: 600; color: #09090b; }
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #f4f4f5; }
  th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #52525b; border-bottom: 2px solid #e4e4e7; white-space: nowrap; }
  td { padding: 12px 16px; border-bottom: 1px solid #f4f4f5; vertical-align: middle; }
  tr.even td { background: #fff; }
  tr.odd td { background: #fafafa; }
  tr:hover td { background: #f0fdf4 !important; }
  .center { text-align: center; }
  .right { text-align: right; font-weight: 600; }
  .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
  .tipe-pemasukan { background: #dcfce7; color: #16a34a; }
  .tipe-pengeluaran { background: #fee2e2; color: #dc2626; }
  .text-green { color: #16a34a; }
  .text-red { color: #dc2626; }
  .footer { padding: 20px 32px; text-align: center; font-size: 11px; color: #a1a1aa; border-top: 1px solid #e4e4e7; }
  .summary { display: flex; gap: 16px; padding: 20px 32px; background: #f4f4f5; border-top: 2px solid #e4e4e7; }
  .summary-item { flex: 1; background: white; border-radius: 8px; padding: 14px 18px; border: 1px solid #e4e4e7; }
  .summary-item label { font-size: 11px; color: #71717a; font-weight: 600; display: block; margin-bottom: 4px; text-transform:uppercase; letter-spacing:0.05em; }
  .summary-item span { font-size: 18px; font-weight: 800; }
  .summary-item .pemasukan { color: #16a34a; }
  .summary-item .pengeluaran { color: #dc2626; }
  .summary-item .saldo { color: #09090b; }
</style></head><body>
<div class="toolbar">
  <div>
    <h2>📊 Preview Export Excel - Keuangan</h2>
    <div class="subtitle">Periksa data di bawah, lalu klik tombol download untuk menyimpan ke Excel</div>
  </div>
  <button class="btn-download" onclick="downloadCSV()">⬇ Download Excel (.csv)</button>
</div>
<div class="wrapper">
  <div class="report-header">
    <h1>Laporan Keuangan</h1>
    <p>Gelora Bumi Mintarsih - Kalisegoro, Gunungpati, Kota Semarang</p>
  </div>
  <div class="meta">
    <div class="meta-item"><label>Periode</label><span>${bulanLabel}</span></div>
    <div class="meta-item"><label>Total Data</label><span>${filteredTransaksi.length} transaksi</span></div>
    <div class="meta-item"><label>Tanggal Export</label><span>${nowLabel}</span></div>
  </div>
  <table>
    <thead><tr>
      <th style="width:40px; text-align:center">No</th>
      <th>Tanggal</th>
      <th style="text-align:center">Tipe</th>
      <th>Keterangan</th>
      <th style="text-align:right">Jumlah</th>
      <th style="text-align:center">Sumber</th>
    </tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  <div class="summary">
    <div class="summary-item"><label>Total Pemasukan</label><span class="pemasukan">Rp ${currentPemasukan.toLocaleString('id-ID')}</span></div>
    <div class="summary-item"><label>Total Pengeluaran</label><span class="pengeluaran">Rp ${currentPengeluaran.toLocaleString('id-ID')}</span></div>
    <div class="summary-item"><label>Saldo Tersisa</label><span class="saldo">Rp ${currentSaldo.toLocaleString('id-ID')}</span></div>
  </div>
  <div class="footer">Sistem Keuangan Lapangan Gelora Bumi Mintarsih &bull; Dicetak: ${nowLabel}</div>
</div>
<script>
  const csvData = \`${csv.replace(/\\n/g, '\\\\n').replace(/'/g, "\\'")}\`;
  const fileName = "${fileName}";
  function downloadCSV() {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fileName; a.click();
    URL.revokeObjectURL(url);
  }
</script>
</body></html>`

    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close(); }
  }


  return (
    <div>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          .no-print { display: none !important; }
          .only-print { display: block !important; }
        }
        @media screen {
          .only-print { display: none !important; }
        }
      `}} />

      {/* Kontrol Laporan (Filter & Print) */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '14px', fontWeight: 600, color: '#3f3f46' }}>Pilih Bulan:</label>
          <input 
            type="month" 
            value={filterBulan} 
            onChange={(e) => setFilterBulan(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d4d4d8', fontSize: '14px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handlePrint}
            style={{ padding: '8px 16px', background: '#09090b', color: '#a1a1aa', border: '1px solid #27272a', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Printer size={14} /> Cetak Laporan
          </button>
          <button
            onClick={handleExportExcel}
            style={{ padding: '8px 16px', background: '#09090b', color: '#a1a1aa', border: '1px solid #27272a', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FileText size={14} /> Export Excel
          </button>
        </div>
      </div>

      <div id="print-area">
        <div className="only-print">
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>Laporan Keuangan Gelora Bumi Mintarsih</h1>
          <p style={{ fontSize: '14px', marginBottom: '24px', color: '#000' }}>Periode: {formatBulanTahun(filterBulan)}</p>
        </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: '13px', color: '#71717a', fontWeight: 500, marginBottom: '8px' }}>Total Pemasukan</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a' }}>Rp {currentPemasukan.toLocaleString('id-ID')}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: '13px', color: '#71717a', fontWeight: 500, marginBottom: '8px' }}>Total Pengeluaran</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#dc2626' }}>Rp {currentPengeluaran.toLocaleString('id-ID')}</div>
        </div>
        <div style={{ background: '#09090b', borderRadius: '12px', padding: '24px', color: '#fafafa' }}>
          <div style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: 500, marginBottom: '8px' }}>Saldo Bersih</div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>Rp {currentSaldo.toLocaleString('id-ID')}</div>
        </div>
      </div>

      {isAdmin && (
        <div className="no-print" style={{ marginBottom: '24px' }}>
          {!showForm ? (
            <button 
              onClick={() => { resetForm(); setShowForm(true); }}
              style={{ padding: '10px 16px', background: '#09090b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              + Tambah Transaksi Manual
            </button>
          ) : (
            <form onSubmit={handleSubmit} style={{ background: '#f4f4f5', padding: '24px', borderRadius: '12px', border: '1px solid #e4e4e7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{editingId ? 'Edit Transaksi' : 'Tambah Transaksi'}</h3>
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a' }}>Batal</button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>Tipe</label>
                  <select value={tipe} onChange={e => setTipe(e.target.value as any)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '14px' }}>
                    <option value="pengeluaran">Pengeluaran</option>
                    <option value="pemasukan">Pemasukan</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>Tanggal</label>
                  <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '14px' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>Jumlah (Rp)</label>
                  <input type="number" value={jumlah} onChange={e => setJumlah(e.target.value)} required min="1" placeholder="Contoh: 150000" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '14px' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>Keterangan</label>
                  <input type="text" value={keterangan} onChange={e => setKeterangan(e.target.value)} required placeholder="Contoh: Bayar listrik bulanan" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '14px' }} />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} style={{ padding: '10px 16px', background: '#09090b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', width: '100%', opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Table Laporan */}
      <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f4f4f5', background: '#fafafa' }}>
              {['Tanggal', 'Sumber', 'Keterangan', 'Pemasukan', 'Pengeluaran', ...(isAdmin ? ['Aksi'] : [])].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTransaksi.length > 0 ? filteredTransaksi.map((t, i) => (
              <tr key={t.id} style={{ borderBottom: i < filteredTransaksi.length - 1 ? '1px solid #f4f4f5' : 'none' }}>
                <td style={{ padding: '14px 16px', fontSize: '13px', color: '#3f3f46' }}>
                  {new Date(t.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '20px', background: t.sumber === 'Sewa' ? '#e0e7ff' : '#f3f4f6', color: t.sumber === 'Sewa' ? '#4f46e5' : '#4b5563' }}>
                    {t.sumber || 'Manual'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '13px', color: '#09090b', fontWeight: 500 }}>
                  {t.keterangan}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#16a34a' }}>
                  {t.tipe === 'pemasukan' ? `Rp ${Number(t.jumlah).toLocaleString('id-ID')}` : '-'}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#dc2626' }}>
                  {t.tipe === 'pengeluaran' ? `Rp ${Number(t.jumlah).toLocaleString('id-ID')}` : '-'}
                </td>
                {isAdmin && (
                  <td style={{ padding: '14px 16px' }}>
                    {t.sumber !== 'Sewa' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEdit(t)} style={{ padding: '6px 12px', background: '#f4f4f5', border: '1px solid #d4d4d8', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', color: '#3f3f46', fontWeight: 500 }}>Edit</button>
                        <button onClick={() => handleDelete(t.id, t.sumber)} style={{ padding: '6px 12px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', color: '#b91c1c', fontWeight: 500 }}>Hapus</button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#a1a1aa', fontStyle: 'italic' }}>Auto</span>
                    )}
                  </td>
                )}
              </tr>
            )) : (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} style={{ padding: '48px 24px', textAlign: 'center', color: '#a1a1aa' }}>Belum ada data transaksi untuk bulan ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div> {/* End Print Area */}
    </div>
  )
}
