'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export type CalendarBooking = {
  tanggal: string
  sesi: string
  status: string
  penyewa?: string
  catatan?: string
}

export default function BookingCalendar({ bookings, isAdmin = false }: { bookings: CalendarBooking[], isAdmin?: boolean }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const router = useRouter()
  const supabase = createClient()

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [modalDate, setModalDate] = useState('')
  const [modalSesi, setModalSesi] = useState('pagi')
  const [tipeInput, setTipeInput] = useState<'booking' | 'lainnya'>('booking')
  const [namaPenyewa, setNamaPenyewa] = useState('')
  const [catatanLainnya, setCatatanLainnya] = useState('')

  const [activeSesiList, setActiveSesiList] = useState<any[]>([
    { id: 'pagi', nama: 'Sesi Pagi', jam: '07:00-12:00', harga: 200000 },
    { id: 'sore', nama: 'Sesi Sore', jam: '15:00-18:00', harga: 250000 }
  ])

  useEffect(() => {
    supabase.from('lapangan').select('fasilitas').limit(1).single().then(({ data }) => {
      try {
        if (Array.isArray(data?.fasilitas)) {
          const parsedSesi = data.fasilitas.map((item: any) => 
            typeof item === 'string' ? JSON.parse(item) : item
          )
          if (parsedSesi.length > 0) setActiveSesiList(parsedSesi)
        } else if (typeof data?.fasilitas === 'string') {
          const parsed = JSON.parse(data.fasilitas)
          if (parsed?.sesi && Array.isArray(parsed.sesi)) setActiveSesiList(parsed.sesi)
        }
      } catch(e) {}
    })
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

  // Real-time check for today (resetting time to 00:00:00)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Cek apakah sesi dibooking
  const getBooking = (day: number, sesi: string) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return bookings.find(b => b.tanggal === dateStr && b.sesi === sesi && (b.status === 'confirmed' || b.status === 'pending' || b.status === 'completed' || b.status === 'maintenance'))
  }

  // Cari booking user yg sesinya sudah dihapus dari daftar aktif (orphan bookings)
  // Hanya yang bukan maintenance (booking user asli)
  const getOrphanBookings = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const activeSesiIds = new Set(activeSesiList.map((s: any) => s.id))
    return bookings.filter(b =>
      b.tanggal === dateStr &&
      !activeSesiIds.has(b.sesi) &&
      b.status !== 'maintenance' &&
      (b.status === 'confirmed' || b.status === 'pending' || b.status === 'completed')
    )
  }

  const openModal = (day: number, sesi: string) => {
    if (!isAdmin) return
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setModalDate(dateStr)
    setModalSesi(sesi)
    setTipeInput('booking')
    setNamaPenyewa('')
    setCatatanLainnya('')
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 1. Get Lapangan ID and Harga
      const { data: lapangan } = await supabase.from('lapangan').select('id, fasilitas').limit(1).single()
      if (!lapangan) throw new Error("Data lapangan tidak ditemukan")

      // 2. Get Current Admin User
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Anda harus login")

      const selectedSesi = activeSesiList.find(s => s.id === modalSesi)
      const jamArr = selectedSesi ? selectedSesi.jam.split('-') : ['00:00', '00:00']
      const jamMulai = jamArr[0] || '00:00'
      const jamSelesai = jamArr[1] || '00:00'
      
      const status = tipeInput === 'booking' ? 'completed' : 'maintenance'
      const catatan = tipeInput === 'booking' ? namaPenyewa : catatanLainnya
      const totalHarga = (tipeInput === 'booking' && selectedSesi) ? selectedSesi.harga : 0

      const { error } = await supabase.from('sewa').insert({
        user_id: user.id, // Admin's user_id since it's offline input
        lapangan_id: lapangan.id,
        tanggal: modalDate,
        sesi: modalSesi,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        total_harga: totalHarga,
        status: status,
        catatan: catatan
      })

      if (error) throw error

      setShowModal(false)
      router.refresh() // Refresh page to get updated bookings
    } catch (err: any) {
      alert("Gagal menyimpan: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', padding: '24px' }}>
        
        {/* Header Kalender */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#09090b' }}>
            {monthNames[month]} {year}
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handlePrevMonth} style={{ padding: '6px 12px', background: '#f4f4f5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
              ← Prev
            </button>
            <button onClick={handleNextMonth} style={{ padding: '6px 12px', background: '#09090b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
              Next →
            </button>
          </div>
        </div>

        {/* Grid Kalender */}
        <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', minWidth: '600px' }}>
          {/* Nama Hari */}
          {dayNames.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#71717a', paddingBottom: '8px', borderBottom: '1px solid #e4e4e7' }}>
              {d}
            </div>
          ))}

          {/* Tanggal Kosong di awal bulan */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} style={{ minHeight: '80px', padding: '8px', background: '#fafafa', borderRadius: '8px' }} />
          ))}

          {/* Tanggal */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const cellDate = new Date(year, month, day)
            const isPast = cellDate < today

            const renderSesi = (sesiInfo: CalendarBooking | undefined, sesiTypeObj: any) => {
              if (!sesiInfo) {
                if (isPast) {
                  return (
                    <div 
                      key={sesiTypeObj.id}
                      style={{
                        fontSize: '11px', padding: '4px 6px', borderRadius: '4px', textAlign: 'center', fontWeight: 500,
                        background: '#f4f4f5', color: '#a1a1aa', border: '1px solid #e4e4e7',
                        cursor: 'not-allowed'
                      }}
                      title="Sesi sudah berlalu"
                    >
                      {sesiTypeObj.nama.replace('Sesi ', '')} (Berlalu)
                    </div>
                  )
                }

                return (
                  <div 
                    key={sesiTypeObj.id}
                    onClick={() => {
                      if (isAdmin) {
                        openModal(day, sesiTypeObj.id)
                      } else {
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                        router.push(`/user/booking?tanggal=${dateStr}&sesi=${sesiTypeObj.id}`)
                      }
                    }}
                    style={{
                      fontSize: '11px', padding: '4px 6px', borderRadius: '4px', textAlign: 'center', fontWeight: 500,
                      background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0',
                      cursor: 'pointer'
                    }}
                    title={isAdmin ? `Klik untuk input jadwal ${sesiTypeObj.nama}` : `Klik untuk booking ${sesiTypeObj.nama}`}
                  >
                    {sesiTypeObj.nama.replace('Sesi ', '')} (Kosong)
                  </div>
                )
              }

              const isMaintenance = sesiInfo.status === 'maintenance'
              const bgColor = isMaintenance ? '#fef08a' : '#fee2e2'
              const textColor = isMaintenance ? '#854d0e' : '#b91c1c'
              const borderColor = isMaintenance ? '#fde047' : '#fecaca'

              const detailText = isMaintenance ? `Lainnya: ${sesiInfo.catatan || 'Ditutup'}` : `Booking: ${sesiInfo.catatan || sesiInfo.penyewa || 'Penuh'}`

              return (
                <div key={sesiTypeObj.id} style={{
                  fontSize: '11px', padding: '4px 6px', borderRadius: '4px', textAlign: 'center', fontWeight: 500,
                  background: bgColor, color: textColor, border: `1px solid ${borderColor}`,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  cursor: 'default'
                }} title={isAdmin ? `${sesiTypeObj.nama} - ${detailText}` : (isMaintenance ? (sesiInfo.catatan || 'Ditutup') : 'Penuh')}>
                  {isAdmin ? detailText : (isMaintenance ? (sesiInfo.catatan || 'Ditutup') : 'Penuh')}
                </div>
              )
            }
            
            // Booking dari sesi yg sudah dihapus admin (tampilkan tetap merah agar riwayat tidak hilang)
            const orphanBookings = getOrphanBookings(day)

            return (
              <div key={day} style={{ 
                minHeight: '80px', padding: '8px', border: '1px solid #e4e4e7', borderRadius: '8px',
                display: 'flex', flexDirection: 'column', gap: '4px'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#09090b', marginBottom: '4px' }}>{day}</div>
                {activeSesiList.map(sesi => renderSesi(getBooking(day, sesi.id), sesi))}
                {/* Tampilkan booking sesi yang sudah dihapus (orphan) */}
                {orphanBookings.map(b => (
                  <div key={`orphan-${b.sesi}-${b.tanggal}`} style={{
                    fontSize: '11px', padding: '4px 6px', borderRadius: '4px', textAlign: 'center', fontWeight: 500,
                    background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    cursor: 'default'
                  }} title={isAdmin ? `Sesi dihapus (${b.sesi}): ${b.catatan || b.penyewa || 'Booking'}` : 'Penuh'}>
                    {isAdmin ? `[${b.sesi}] ${b.catatan || b.penyewa || 'Booking'}` : 'Penuh'}
                  </div>
                ))}
              </div>
            )
          })}
          </div>
        </div>

        {/* Legenda */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '20px', fontSize: '12px', color: '#71717a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '3px' }} /> Tersedia
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '3px' }} /> Terbooking
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', background: '#f4f4f5', border: '1px solid #e4e4e7', borderRadius: '3px' }} /> Berlalu
          </div>
          {isAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', background: '#fef08a', border: '1px solid #fde047', borderRadius: '3px' }} /> Perawatan/Libur
            </div>
          )}
        </div>
      </div>

      {/* Modal Input Admin */}
      {showModal && isAdmin && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600 }}>Input Jadwal: {modalDate} ({modalSesi})</h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Tipe Input</label>
                <select 
                  value={tipeInput} 
                  onChange={(e) => setTipeInput(e.target.value as 'booking' | 'lainnya')}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e4e4e7', fontSize: '14px' }}
                >
                  <option value="booking">Booking Offline</option>
                  <option value="lainnya">Lainnya (Perawatan / Libur)</option>
                </select>
              </div>

              {tipeInput === 'booking' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Nama Penyewa</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Contoh: Budi (Bayar Tunai)"
                    value={namaPenyewa}
                    onChange={e => setNamaPenyewa(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e4e4e7', fontSize: '14px' }}
                  />
                  <p style={{ fontSize: '11px', color: '#71717a', margin: '6px 0 0' }}>Booking ini akan otomatis masuk ke Laporan Keuangan.</p>
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Keterangan / Alasan</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Contoh: Perbaikan Rumput"
                    value={catatanLainnya}
                    onChange={e => setCatatanLainnya(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e4e4e7', fontSize: '14px' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: '#f4f4f5', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '10px', background: '#09090b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
