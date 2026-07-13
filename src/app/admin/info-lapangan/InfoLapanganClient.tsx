'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Tag } from 'lucide-react'

export type Sesi = {
  id: string
  nama: string
  jam: string
  harga: number
}

export default function InfoLapanganClient({ initialData }: { initialData: any }) {
  const [nama, setNama] = useState(initialData?.nama || '')
  const [deskripsi, setDeskripsi] = useState(initialData?.deskripsi || '')
  
  // Discount loyalty state
  const [discountActive, setDiscountActive] = useState<boolean>(initialData?.discount_active ?? false)
  const [discountMinBooking, setDiscountMinBooking] = useState<number>(initialData?.discount_min_booking ?? 10)
  const [discountPct, setDiscountPct] = useState<number>(initialData?.discount_pct ?? 10)

  // Parse fasilitas JSON for sessions. If parsing fails or doesn't exist, use default
  let initialSesi: Sesi[] = [
    { id: 'pagi', nama: 'Sesi Pagi', jam: '07:00-12:00', harga: 200000 },
    { id: 'sore', nama: 'Sesi Sore', jam: '15:00-18:00', harga: 250000 }
  ]
  
  try {
    if (Array.isArray(initialData?.fasilitas)) {
      // It's an array of JSON strings (or already parsed objects)
      const parsedSesi = initialData.fasilitas.map((item: any) => 
        typeof item === 'string' ? JSON.parse(item) : item
      )
      if (parsedSesi.length > 0) {
        initialSesi = parsedSesi
      }
    } else if (typeof initialData?.fasilitas === 'string') {
      // Fallback if it's somehow a single JSON string
      const parsed = JSON.parse(initialData.fasilitas)
      if (parsed.sesi && Array.isArray(parsed.sesi)) {
        initialSesi = parsed.sesi
      }
    } else if (initialData?.fasilitas?.sesi && Array.isArray(initialData.fasilitas.sesi)) {
      initialSesi = initialData.fasilitas.sesi
    }
  } catch(e) {
    console.error("Failed to parse fasilitas", e)
  }

  const [sesiList, setSesiList] = useState<Sesi[]>(initialSesi)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAddSesi = () => {
    const newId = `sesi-${Date.now()}`
    setSesiList([...sesiList, { id: newId, nama: '', jam: '', harga: 0 }])
  }

  const handleRemoveSesi = async (index: number) => {
    const sesiToRemove = sesiList[index]
    
    if (!window.confirm(`Apakah Anda yakin ingin menghapus "${sesiToRemove.nama || sesiToRemove.id}"?\n\nCatatan: Riwayat booking user pada sesi ini akan tetap tersimpan. Hanya entri "Lainnya/Perawatan" yang akan dihapus.`)) {
      return
    }

    try {
      // Hapus HANYA data 'maintenance' (Lainnya/Perawatan) yang diinput admin
      // Booking user (pending, confirmed, completed) TETAP dipertahankan
      const { error } = await supabase
        .from('sewa')
        .delete()
        .eq('sesi', sesiToRemove.id)
        .eq('status', 'maintenance')

      if (error) {
        console.error('Gagal menghapus data maintenance sesi:', error.message)
        alert('Peringatan: Gagal menghapus entri perawatan sesi ini dari database: ' + error.message)
      }
    } catch (err: any) {
      console.error('Error saat menghapus sesi:', err)
    }

    // Hapus sesi dari daftar UI
    setSesiList(sesiList.filter((_, i) => i !== index))
  }

  const handleSesiChange = (index: number, field: keyof Sesi, value: string | number) => {
    const newList = [...sesiList]
    newList[index] = { ...newList[index], [field]: value }
    setSesiList(newList)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Map sessions to array of strings so it stores correctly in text[] column
      const fasilitasArray = sesiList.map(sesi => JSON.stringify(sesi))
      
      const { error } = await supabase
        .from('lapangan')
        .update({
          nama,
          deskripsi,
          fasilitas: fasilitasArray,
          discount_active: discountActive,
          discount_min_booking: discountMinBooking,
          discount_pct: discountPct
        })
        .eq('id', initialData.id)

      if (error) throw error
      alert('Data lapangan berhasil diperbarui!')
      router.refresh()
    } catch(err: any) {
      alert('Gagal menyimpan: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Form Profil Lapangan */}
      <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px', color: '#09090b' }}>Profil Utama</h2>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Nama Lapangan</label>
            <input 
              type="text" value={nama} onChange={e => setNama(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '14px' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Deskripsi</label>
            <textarea 
              value={deskripsi} onChange={e => setDeskripsi(e.target.value)} rows={3}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '14px' }} 
            />
          </div>
        </div>
      </div>

      {/* Pengaturan Sesi & Harga */}
      <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#09090b' }}>Pengaturan Sesi & Harga</h2>
          <button 
            onClick={handleAddSesi}
            style={{ padding: '6px 12px', background: '#f4f4f5', border: '1px solid #e4e4e7', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
          >
            + Tambah Sesi
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #e4e4e7' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#71717a', fontWeight: 600 }}>ID Sesi (Unik)</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#71717a', fontWeight: 600 }}>Nama Sesi</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#71717a', fontWeight: 600 }}>Jam (Mis: 07:00-12:00)</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#71717a', fontWeight: 600 }}>Harga (Rp)</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#71717a', fontWeight: 600 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sesiList.map((sesi, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f4f4f5' }}>
                  <td style={{ padding: '8px' }}>
                    <input type="text" value={sesi.id} onChange={e => handleSesiChange(index, 'id', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #e4e4e7', borderRadius: '4px', fontSize: '13px' }} placeholder="pagi" />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input type="text" value={sesi.nama} onChange={e => handleSesiChange(index, 'nama', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #e4e4e7', borderRadius: '4px', fontSize: '13px' }} placeholder="Sesi Pagi" />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input type="text" value={sesi.jam} onChange={e => handleSesiChange(index, 'jam', e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #e4e4e7', borderRadius: '4px', fontSize: '13px' }} placeholder="07:00-12:00" />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input type="number" value={sesi.harga} onChange={e => handleSesiChange(index, 'harga', Number(e.target.value))} style={{ width: '100%', padding: '8px', border: '1px solid #e4e4e7', borderRadius: '4px', fontSize: '13px' }} />
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <button onClick={() => handleRemoveSesi(index)} style={{ padding: '6px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {sesiList.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#a1a1aa', fontSize: '13px' }}>Tidak ada sesi. Silakan tambahkan sesi baru.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pengaturan Diskon Loyalitas */}
      <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Tag size={18} style={{ color: '#16a34a' }} />
          <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#09090b' }}>Diskon Loyalitas Pelanggan</h2>
        </div>
        <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '20px' }}>
          Berikan diskon otomatis kepada pelanggan yang sudah mencapai jumlah sewa tertentu.
        </p>

        {/* Toggle Aktif */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: discountActive ? '#f0fdf4' : '#fafafa', border: `1px solid ${discountActive ? '#bbf7d0' : '#e4e4e7'}`, borderRadius: '8px', marginBottom: '16px', transition: 'all 0.2s' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#09090b' }}>Aktifkan Fitur Diskon</div>
            <div style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>
              {discountActive ? '✅ Diskon aktif — pelanggan memenuhi syarat akan mendapat potongan harga' : 'Fitur diskon saat ini nonaktif'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDiscountActive(!discountActive)}
            style={{
              width: '52px', height: '28px', borderRadius: '100px', border: 'none', cursor: 'pointer',
              background: discountActive ? '#16a34a' : '#d4d4d8',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0
            }}
          >
            <span style={{
              position: 'absolute', top: '3px',
              left: discountActive ? '27px' : '3px',
              width: '22px', height: '22px', borderRadius: '50%', background: '#fff',
              transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }} />
          </button>
        </div>

        {/* Pengaturan angka — hanya tampil kalau aktif */}
        {discountActive && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                Minimum Jumlah Sewa (kali)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number" min={1} max={100}
                  value={discountMinBooking}
                  onChange={e => setDiscountMinBooking(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '14px', fontWeight: 600 }}
                />
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#71717a' }}>× sewa</span>
              </div>
              <p style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '4px' }}>Pelanggan yang sudah sewa {discountMinBooking}x atau lebih akan mendapat diskon.</p>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                Persentase Diskon (%)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number" min={1} max={100}
                  value={discountPct}
                  onChange={e => setDiscountPct(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #d4d4d8', fontSize: '14px', fontWeight: 600 }}
                />
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#71717a' }}>%</span>
              </div>
              <p style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '4px' }}>Diskon yang didapat: {discountPct}% dari harga sesi normal.</p>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          style={{ padding: '12px 24px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: isSaving ? 0.7 : 1 }}
        >
          {isSaving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
        </button>
      </div>
    </div>
  )
}
