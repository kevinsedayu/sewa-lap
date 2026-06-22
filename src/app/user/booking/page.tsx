'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UserBookingPage() {
  const [tanggal, setTanggal] = useState('')
  const [sesi, setSesi] = useState('pagi') // 'pagi' or 'sore'
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [bookedSessions, setBookedSessions] = useState<{ tanggal: string, sesi: string }[]>([])
  const [user, setUser] = useState<any>(null)
  const [phone, setPhone] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const HARGA_PAGI = 200000
  const HARGA_SORE = 250000

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Ambil profil user untuk prefill nomor telepon
      const { data: profile } = await supabase.from('profiles').select('phone').eq('id', user.id).single()
      if (profile?.phone) {
        setPhone(profile.phone)
      }

      // Ambil booking yang sudah dipesan (online/offline) atau libur untuk mencegah double booking
      const { data } = await supabase
        .from('sewa')
        .select('tanggal, sesi')
        .in('status', ['confirmed', 'pending', 'completed', 'maintenance'])
      
      if (data) {
        setBookedSessions(data as any)
      }
    }
    loadData()
  }, [])

  const isSessionBooked = (tgl: string, s: string) => {
    return bookedSessions.some(b => b.tanggal === tgl && b.sesi === s)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!tanggal || !sesi || !phone || !file) {
      setError('Harap lengkapi semua data, termasuk nomor telepon dan unggah bukti pembayaran.')
      return
    }

    if (isSessionBooked(tanggal, sesi)) {
      setError('Jadwal ini sudah dibooking. Silakan pilih tanggal atau sesi lain.')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Upload Bukti Pembayaran
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `bukti/${fileName}`

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('bukti-pembayaran')
        .upload(filePath, file)

      if (uploadError) {
        throw new Error('Gagal mengunggah bukti pembayaran: ' + uploadError.message)
      }

      // Ambil URL public dari gambar yang diupload
      const { data: { publicUrl } } = supabase.storage
        .from('bukti-pembayaran')
        .getPublicUrl(filePath)

      // 2. Ambil ID lapangan pertama (karena hanya ada 1 lapangan)
      const { data: lapanganData, error: lapanganError } = await supabase
        .from('lapangan')
        .select('id')
        .limit(1)
        .single()
        
      if (lapanganError || !lapanganData) {
        throw new Error('Data lapangan belum tersedia. Harap hubungi admin.')
      }

      // 2.5 Pastikan profil pengguna ada (mencegah error foreign key) dan update telepon
      await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          full_name: user.email?.split('@')[0] || 'User',
          phone: phone,
          role: user.email === 'admin@sewa.com' ? 'admin' : 'user'
        }, { onConflict: 'id' })

      // 3. Simpan Data Booking
      const totalHarga = sesi === 'pagi' ? HARGA_PAGI : HARGA_SORE
      const jamMulai = sesi === 'pagi' ? '07:00:00' : '15:00:00'
      const jamSelesai = sesi === 'pagi' ? '12:00:00' : '18:00:00'

      const { error: insertError } = await supabase
        .from('sewa')
        .insert({
          user_id: user.id,
          lapangan_id: lapanganData.id,
          tanggal,
          sesi,
          jam_mulai: jamMulai,
          jam_selesai: jamSelesai,
          total_harga: totalHarga,
          status: 'pending',
          bukti_pembayaran: publicUrl
        })

      if (insertError) {
        throw new Error('Gagal menyimpan booking: ' + insertError.message)
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/user/dashboard')
      }, 2000)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Dapatkan tanggal hari ini untuk min date
  const today = new Date().toISOString().split('T')[0]

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#09090b', marginBottom: '8px' }}>
          Booking Lapangan
        </h1>
        <p style={{ fontSize: '14px', color: '#71717a' }}>
          Pilih jadwal bermain Anda dan unggah bukti transfer.
        </p>
      </div>

      {success ? (
        <div style={{ padding: '24px', background: '#dcfce7', color: '#166534', borderRadius: '12px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>✅ Booking Berhasil Dibuat!</h2>
          <p style={{ fontSize: '14px' }}>Menunggu konfirmasi admin. Mengalihkan ke dashboard...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e4e4e7' }}>
          
          {error && (
             <div style={{ padding: '12px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
               {error}
             </div>
          )}

          {/* Form Pemilihan Jadwal */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid #e4e4e7', paddingBottom: '8px' }}>1. Pilih Jadwal</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Tanggal Main</label>
              <input 
                type="date" 
                min={today}
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d4d4d8', fontSize: '14px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Nomor Telepon / WhatsApp</label>
              <input 
                type="tel" 
                placeholder="Contoh: 08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d4d4d8', fontSize: '14px' }}
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Pilih Sesi</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ 
                  flex: 1, padding: '16px', border: '1px solid', borderRadius: '8px', cursor: 'pointer',
                  borderColor: sesi === 'pagi' ? '#09090b' : '#e4e4e7',
                  background: sesi === 'pagi' ? '#fafafa' : '#fff',
                  opacity: tanggal && isSessionBooked(tanggal, 'pagi') ? 0.5 : 1
                }}>
                  <input 
                    type="radio" 
                    name="sesi" 
                    value="pagi" 
                    checked={sesi === 'pagi'} 
                    onChange={() => setSesi('pagi')} 
                    disabled={tanggal ? isSessionBooked(tanggal, 'pagi') : false}
                    style={{ display: 'none' }} 
                  />
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#09090b' }}>Sesi Pagi</div>
                  <div style={{ fontSize: '13px', color: '#71717a', marginTop: '4px' }}>07:00 - 12:00</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#09090b', marginTop: '8px' }}>Rp {HARGA_PAGI.toLocaleString('id-ID')}</div>
                  {tanggal && isSessionBooked(tanggal, 'pagi') && <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>Sudah dibooking</div>}
                </label>

                <label style={{ 
                  flex: 1, padding: '16px', border: '1px solid', borderRadius: '8px', cursor: 'pointer',
                  borderColor: sesi === 'sore' ? '#09090b' : '#e4e4e7',
                  background: sesi === 'sore' ? '#fafafa' : '#fff',
                  opacity: tanggal && isSessionBooked(tanggal, 'sore') ? 0.5 : 1
                }}>
                  <input 
                    type="radio" 
                    name="sesi" 
                    value="sore" 
                    checked={sesi === 'sore'} 
                    onChange={() => setSesi('sore')}
                    disabled={tanggal ? isSessionBooked(tanggal, 'sore') : false} 
                    style={{ display: 'none' }} 
                  />
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#09090b' }}>Sesi Sore</div>
                  <div style={{ fontSize: '13px', color: '#71717a', marginTop: '4px' }}>15:00 - 18:00</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#09090b', marginTop: '8px' }}>Rp {HARGA_SORE.toLocaleString('id-ID')}</div>
                  {tanggal && isSessionBooked(tanggal, 'sore') && <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>Sudah dibooking</div>}
                </label>
              </div>
            </div>
          </div>

          {/* Form Pembayaran */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid #e4e4e7', paddingBottom: '8px' }}>2. Pembayaran</h3>
            
            <div style={{ background: '#f4f4f5', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', color: '#52525b', marginBottom: '12px', marginTop: 0 }}>Silakan transfer sesuai nominal ke salah satu rekening berikut:</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #e4e4e7' }}>
                  <div style={{ fontSize: '12px', color: '#71717a', fontWeight: 600, marginBottom: '2px' }}>BANK MANDIRI</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', letterSpacing: '1px' }}>1260021112003</div>
                </div>

                <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #e4e4e7' }}>
                  <div style={{ fontSize: '12px', color: '#71717a', fontWeight: 600, marginBottom: '2px' }}>DANA</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#09090b', letterSpacing: '1px' }}>081328215620</div>
                </div>
              </div>
              
              <div style={{ fontSize: '14px', color: '#3f3f46', fontWeight: 600, marginTop: '12px' }}>a.n Kevin Apriliyanto</div>
              
              <div style={{ marginTop: '16px', borderTop: '1px dashed #d4d4d8', paddingTop: '12px' }}>
                <div style={{ fontSize: '13px', color: '#71717a' }}>Total yang harus dibayar:</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#09090b' }}>
                  Rp {(sesi === 'pagi' ? HARGA_PAGI : HARGA_SORE).toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Unggah Bukti Transfer</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                style={{ width: '100%', padding: '10px', border: '1px dashed #d4d4d8', borderRadius: '8px', fontSize: '14px', background: '#fafafa', cursor: 'pointer' }}
                required
              />
              <p style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '6px' }}>Format JPG, PNG max 5MB</p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || (tanggal && isSessionBooked(tanggal, sesi)) ? true : false}
            style={{ 
              width: '100%', padding: '14px', background: '#09090b', color: '#fff', 
              border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, 
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting || (tanggal && isSessionBooked(tanggal, sesi)) ? 0.7 : 1
            }}
          >
            {isSubmitting ? 'Memproses Booking...' : 'Kirim Booking'}
          </button>
        </form>
      )}
    </div>
  )
}
