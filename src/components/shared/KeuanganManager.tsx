'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type TransaksiKeuangan = {
  id: string
  tipe: 'pemasukan' | 'pengeluaran'
  jumlah: number
  keterangan: string
  tanggal: string
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
        setTransaksi(transaksi.map(t => t.id === editingId ? { ...data, sumber: 'Manual' } : t).sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()))
        setShowForm(false)
        resetForm()
      } else {
        alert("Gagal mengupdate data: " + (error?.message || 'Unknown error'))
      }
    } else {
      const { data, error } = await supabase
        .from('keuangan')
        .insert([newEntry])
        .select()
        .single()

      if (!error && data) {
        setTransaksi([{ ...data, sumber: 'Manual' }, ...transaksi].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()))
        setShowForm(false)
        resetForm()
      } else {
        alert("Gagal menyimpan data: " + (error?.message || 'Unknown error'))
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
      alert('Transaksi sewa tidak dapat dihapus dari menu keuangan. Silakan kelola di menu Booking / Kalender.')
      return
    }
    if (!confirm('Yakin ingin menghapus catatan keuangan ini?')) return

    const { error } = await supabase.from('keuangan').delete().eq('id', id)
    if (!error) {
      setTransaksi(transaksi.filter(t => t.id !== id))
    } else {
      alert('Gagal menghapus: ' + error.message)
    }
  }

  const handleEdit = (t: TransaksiKeuangan) => {
    if (t.sumber === 'Sewa') {
      alert('Transaksi sewa tidak dapat diubah dari menu keuangan. Silakan kelola di menu Booking / Kalender.')
      return
    }
    setEditingId(t.id)
    setTipe(t.tipe)
    setJumlah(t.jumlah.toString())
    setKeterangan(t.keterangan)
    setTanggal(t.tanggal)
    setShowForm(true)
  }

  // Handle Print
  const handlePrint = () => {
    window.print()
  }

  // Filter transaksi berdasarkan bulan
  const filteredTransaksi = transaksi.filter(t => {
    const tBulan = t.tanggal.substring(0, 7) // 'YYYY-MM-DD' -> 'YYYY-MM'
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
        <button 
          onClick={handlePrint}
          style={{ padding: '8px 16px', background: '#ffffff', color: '#09090b', border: '1px solid #e4e4e7', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          🖨️ Cetak Laporan
        </button>
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
      <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', overflow: 'hidden' }}>
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
