import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Anton } from 'next/font/google'

const anton = Anton({ weight: '400', subsets: ['latin'] })

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  // Fetch real booking stats
  const { data: bookings } = await supabase.from('sewa').select('*, profiles(full_name)')
  const { data: users } = await supabase.from('profiles').select('id').eq('role', 'user')
  const { data: lapangan } = await supabase.from('lapangan').select('*').limit(1).single()

  const today = new Date().toISOString().split('T')[0]
  const bookingHariIni = bookings?.filter(b => b.tanggal === today).length ?? 0
  const bookingPending = bookings?.filter(b => b.status === 'pending').length ?? 0
  const bookingConfirmed = bookings?.filter(b => b.status === 'confirmed').length ?? 0
  const totalUser = users?.length ?? 0

  const stats = [
    { label: 'Booking Hari Ini', value: String(bookingHariIni), icon: '📅', desc: 'Booking masuk hari ini' },
    { label: 'Menunggu Konfirmasi', value: String(bookingPending), icon: '⏳', desc: 'Perlu ditindaklanjuti' },
    { label: 'Booking Aktif', value: String(bookingConfirmed), icon: '✅', desc: 'Sudah dikonfirmasi' },
    { label: 'Total Pengguna', value: String(totalUser), icon: '👥', desc: 'User terdaftar' },
  ]

  // Recent bookings
  const { data: recentBookings } = await supabase
    .from('sewa')
    .select('*, profiles(full_name, phone)')
    .order('created_at', { ascending: false })
    .limit(5)

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

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      {/* Header Baru: Sewa Gelora Bumi Mintarsih */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 className={anton.className} style={{ 
          fontSize: '48px', 
          color: '#166534', /* Hijau Tua */
          letterSpacing: '2px', 
          margin: '0 0 16px 0',
          textTransform: 'uppercase',
          textShadow: '3px 3px 0px rgba(0,0,0,0.15), 6px 6px 0px rgba(0,0,0,0.05)'
        }}>
          Sewa Gelora Bumi Mintarsih
        </h1>
        <div style={{ 
          width: '100%', 
          maxWidth: '1000px', 
          height: '180px', 
          margin: '0 auto', 
          borderRadius: '16px', 
          overflow: 'hidden',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          position: 'relative'
        }}>
          <div style={{ width: '100%', height: '100%', background: '#e4e4e7', position: 'relative' }}>
            <img 
              src="/lapangan.jpeg" 
              alt="Gelora Bumi Mintarsih" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>

      {/* Fasilitas Slider */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h2 className={anton.className} style={{ 
          fontSize: '48px', 
          color: '#166534', 
          marginBottom: '16px', 
          letterSpacing: '2px',
          textTransform: 'uppercase',
          textShadow: '3px 3px 0px rgba(0,0,0,0.15), 6px 6px 0px rgba(0,0,0,0.05)'
        }}>
          Fasilitas Kami
        </h2>
        <div style={{ 
          display: 'flex', 
          overflowX: 'auto', 
          scrollSnapType: 'x mandatory', 
          gap: '16px', 
          paddingBottom: '16px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {[
            { src: '/lapangan2.jpeg', label: 'Lapangan Standart Nasional' },
            { src: '/toilet.jpeg', label: 'Toilet Bersih' },
            { src: '/mushola.jpeg', label: 'Mushola' },
            { src: '/bench.jpeg', label: 'Bench Pemain' }
          ].map((img, i) => (
            <div key={i} style={{ 
              scrollSnapAlign: 'center', 
              flex: '0 0 calc(50% - 8px)', 
              height: '300px',
              borderRadius: '16px', 
              overflow: 'hidden', 
              position: 'relative',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
            }}>
              <img src={img.src} alt={img.label} style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#e4e4e7' }} />
              <div style={{ 
                position: 'absolute', bottom: 0, left: 0, right: 0, 
                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', 
                color: 'white', padding: '24px 16px 16px', textAlign: 'center', 
                fontSize: '18px', fontWeight: 600, letterSpacing: '0.02em',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
              }}>
                {img.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profil Lapangan */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#09090b', margin: 0, letterSpacing: '-0.01em' }}>
            Informasi Lapangan
          </h2>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', padding: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px', color: '#09090b' }}>{lapangan?.nama || 'Nama Lapangan'}</h3>
            <p style={{ fontSize: '13px', color: '#52525b', margin: '0 0 16px', lineHeight: '1.5' }}>{lapangan?.deskripsi || 'Deskripsi belum ditambahkan.'}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: '4px' }}>Harga per Sesi</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#16a34a' }}>Sesi Pagi: Rp 200.000 <br/> Sesi Sore: Rp 250.000</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Greeting & Quick Action */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '4px' }}>
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#09090b', letterSpacing: '-0.01em', margin: 0 }}>
            Selamat datang, {profile?.full_name || 'Admin'} 👋
          </h2>
        </div>
        <Link href="/admin/booking" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', background: '#09090b', color: '#fafafa',
          borderRadius: '8px', fontSize: '13px', fontWeight: 600,
          textDecoration: 'none', transition: 'opacity 0.15s',
        }}>
          📋 Kelola Semua Booking
        </Link>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{
            background: '#ffffff',
            border: '1px solid #e4e4e7',
            borderRadius: '12px',
            padding: '20px 24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: '#71717a', fontWeight: 500 }}>{stat.label}</span>
              <span style={{ fontSize: '20px' }}>{stat.icon}</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#09090b', letterSpacing: '-0.03em', marginBottom: '4px' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '12px', color: '#a1a1aa' }}>{stat.desc}</div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#09090b', margin: 0, letterSpacing: '-0.01em' }}>
            Booking Terbaru
          </h2>
          <Link href="/admin/booking" style={{ fontSize: '13px', color: '#71717a', textDecoration: 'none' }}>
            Lihat semua →
          </Link>
        </div>
        <div style={{
          background: '#ffffff',
          border: '1px solid #e4e4e7',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {recentBookings && recentBookings.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f4f4f5' }}>
                  {['Nama Penyewa', 'Tanggal', 'Jam', 'Total', 'Status'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontSize: '12px', fontWeight: 600, color: '#71717a',
                      letterSpacing: '0.02em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b: any, i: number) => (
                  <tr key={b.id} style={{
                    borderBottom: i < recentBookings.length - 1 ? '1px solid #f4f4f5' : 'none',
                    transition: 'background 0.1s',
                  }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#09090b' }}>
                        {b.profiles?.full_name || '-'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#a1a1aa' }}>{b.profiles?.phone || '-'}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#3f3f46' }}>
                      {new Date(b.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#3f3f46' }}>
                      {b.jam_mulai?.slice(0, 5)} – {b.jam_selesai?.slice(0, 5)}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#09090b' }}>
                      Rp {Number(b.total_harga).toLocaleString('id-ID')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: statusColor[b.status] + '18',
                        color: statusColor[b.status],
                      }}>
                        {statusLabel[b.status] || b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#a1a1aa' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
              <p style={{ fontSize: '14px', margin: 0 }}>Belum ada booking masuk</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
