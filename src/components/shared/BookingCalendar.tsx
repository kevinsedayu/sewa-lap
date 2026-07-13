'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react'

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
    <div className="relative">
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-6 shadow-sm">
        
        {/* Header Kalender */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h3 className="text-xl font-bold text-zinc-900 tracking-tight" style={{ fontFamily: 'var(--font-bricolage), system-ui, sans-serif' }}>
            {monthNames[month]} {year}
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrevMonth} 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-sm font-medium transition-colors"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button 
              onClick={handleNextMonth} 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Grid Kalender */}
        <div className="overflow-x-auto pb-2">
          <div className="grid grid-cols-7 gap-3 min-w-[900px]">
          {/* Nama Hari */}
          {dayNames.map(d => (
            <div key={d} className="text-center text-xs font-bold text-zinc-500 uppercase tracking-wider pb-2 border-b border-zinc-200">
              {d}
            </div>
          ))}

          {/* Tanggal Kosong di awal bulan */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[140px] p-2 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200/60" />
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
                      className="flex items-center gap-1.5 text-[11px] p-1.5 rounded-md font-medium bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed w-full justify-center"
                      title="Sesi sudah berlalu"
                    >
                      <Info size={12} />
                      <span className="truncate">{sesiTypeObj.nama.replace('Sesi ', '')}</span>
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
                    className="flex items-center gap-1.5 text-[11px] p-1.5 rounded-md font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 hover:border-emerald-300 cursor-pointer transition-colors w-full justify-center shadow-sm"
                    title={isAdmin ? `Klik untuk input jadwal ${sesiTypeObj.nama}` : `Klik untuk booking ${sesiTypeObj.nama}`}
                  >
                    <CheckCircle2 size={12} className="shrink-0" />
                    <span className="truncate">{sesiTypeObj.nama.replace('Sesi ', '')}</span>
                  </div>
                )
              }

              const isMaintenance = sesiInfo.status === 'maintenance'
              const detailText = isMaintenance ? (sesiInfo.catatan || 'Ditutup') : (sesiInfo.catatan || sesiInfo.penyewa || 'Penuh')

              return (
                <div key={sesiTypeObj.id} 
                  className={`flex items-center gap-1.5 text-[11px] p-1.5 rounded-md font-semibold w-full shadow-sm border cursor-default
                    ${isMaintenance 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                    }
                  `}
                  title={isAdmin ? `${sesiTypeObj.nama} - ${detailText}` : (isMaintenance ? (sesiInfo.catatan || 'Ditutup') : 'Penuh')}
                >
                  {isMaintenance ? <AlertCircle size={12} className="shrink-0" /> : <XCircle size={12} className="shrink-0" />}
                  <span className="truncate">{isAdmin ? detailText : (isMaintenance ? (sesiInfo.catatan || 'Ditutup') : 'Penuh')}</span>
                </div>
              )
            }
            
            // Booking dari sesi yg sudah dihapus admin (tampilkan tetap merah agar riwayat tidak hilang)
            const orphanBookings = getOrphanBookings(day)

            return (
              <div key={day} className="flex flex-col gap-1.5 min-h-[140px] p-2.5 border border-zinc-200 bg-white rounded-xl shadow-sm hover:shadow-md hover:border-zinc-300 transition-all">
                <div className="text-sm font-bold text-zinc-800 mb-1" style={{ fontFamily: 'var(--font-bricolage), system-ui, sans-serif' }}>{day}</div>
                
                <div className="flex flex-col gap-1.5 flex-1 justify-start">
                  {activeSesiList.map(sesi => renderSesi(getBooking(day, sesi.id), sesi))}
                  {/* Tampilkan booking sesi yang sudah dihapus (orphan) */}
                  {orphanBookings.map(b => (
                    <div key={`orphan-${b.sesi}-${b.tanggal}`} 
                      className="flex items-center gap-1.5 text-[11px] p-1.5 rounded-md font-semibold w-full shadow-sm border cursor-default bg-red-50 text-red-700 border-red-200"
                      title={isAdmin ? `Sesi dihapus (${b.sesi}): ${b.catatan || b.penyewa || 'Booking'}` : 'Penuh'}
                    >
                      <XCircle size={12} className="shrink-0" />
                      <span className="truncate">{isAdmin ? (b.catatan || b.penyewa || 'Booking') : 'Penuh'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          </div>
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap gap-4 mt-6 text-xs font-medium text-zinc-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" /> Tersedia
          </div>
          <div className="flex items-center gap-1.5">
            <XCircle size={14} className="text-red-600" /> Terbooking
          </div>
          <div className="flex items-center gap-1.5">
            <Info size={14} className="text-zinc-400" /> Berlalu
          </div>
          {isAdmin && (
            <div className="flex items-center gap-1.5">
              <AlertCircle size={14} className="text-amber-600" /> Perawatan/Libur
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
