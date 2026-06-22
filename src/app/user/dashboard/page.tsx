import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Anton } from 'next/font/google'

const anton = Anton({ weight: '400', subsets: ['latin'] })

export default async function UserDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  // Fetch user's own bookings for history
  const { data: userBookings } = await supabase
    .from('sewa')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  // Fetch lapangan info for showcase
  const { data: lapangan } = await supabase.from('lapangan').select('*').limit(1).single()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam'

  const bookingAktif = userBookings?.filter(b => b.status === 'confirmed').length ?? 0
  const bookingPending = userBookings?.filter(b => b.status === 'pending').length ?? 0
  const totalBooking = userBookings?.length ?? 0

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
    <div style={{ padding: '32px', maxWidth: '1100px' }}>
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

      {/* Profil Lapangan / Etalase */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#09090b', marginBottom: '16px', letterSpacing: '-0.01em' }}>
          Informasi Lapangan
        </h2>
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
            {greeting}, {profile?.full_name || 'User'} 👋
          </h2>
        </div>
        <Link href="/user/booking" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', background: '#09090b', color: '#fafafa',
          borderRadius: '8px', fontSize: '13px', fontWeight: 600,
          textDecoration: 'none',
        }}>
          ⚽ Booking Sekarang
        </Link>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {[
          { label: 'Booking Aktif', value: String(bookingAktif), icon: '✅', desc: 'Sudah dikonfirmasi' },
          { label: 'Menunggu Konfirmasi', value: String(bookingPending), icon: '⏳', desc: 'Sedang diproses' },
          { label: 'Total Booking', value: String(totalBooking), icon: '📋', desc: 'Semua riwayat' },
        ].map((card) => (
          <div key={card.label} style={{
            background: '#ffffff',
            border: '1px solid #e4e4e7',
            borderRadius: '12px',
            padding: '20px 24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: '#71717a', fontWeight: 500 }}>{card.label}</span>
              <span style={{ fontSize: '20px' }}>{card.icon}</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#09090b', letterSpacing: '-0.03em', marginBottom: '4px' }}>
              {card.value}
            </div>
            <div style={{ fontSize: '12px', color: '#a1a1aa' }}>{card.desc}</div>
          </div>
        ))}
      </div>

      {/* CTA Banner */}
      <div style={{
        background: '#09090b',
        borderRadius: '14px',
        padding: '28px 32px',
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap',
      }}>
        <div>
          <h2 style={{ color: '#fafafa', fontSize: '17px', fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
            Siap bermain hari ini?
          </h2>
          <p style={{ color: '#71717a', fontSize: '13px', margin: 0 }}>
            Lapangan tersedia setiap hari. Booking sekarang!
          </p>
        </div>
        <Link href="/user/booking" style={{
          background: '#fafafa', color: '#09090b',
          borderRadius: '8px', padding: '11px 22px',
          fontSize: '13px', fontWeight: 600,
          textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          Pilih Jadwal →
        </Link>
      </div>

      {/* Riwayat Booking */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#09090b', margin: 0, letterSpacing: '-0.01em' }}>
            Riwayat Booking
          </h2>
          <Link href="/user/riwayat" style={{ fontSize: '13px', color: '#71717a', textDecoration: 'none' }}>
            Lihat semua →
          </Link>
        </div>
        <div style={{
          background: '#ffffff',
          border: '1px solid #e4e4e7',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {userBookings && userBookings.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f4f4f5' }}>
                  {['Tanggal', 'Sesi / Jam', 'Total Harga', 'Status'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontSize: '12px', fontWeight: 600, color: '#71717a',
                      letterSpacing: '0.02em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {userBookings.slice(0, 5).map((b: any, i: number) => (
                  <tr key={b.id} style={{
                    borderBottom: i < Math.min(userBookings.length, 5) - 1 ? '1px solid #f4f4f5' : 'none',
                  }}>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#3f3f46' }}>
                      {new Date(b.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#3f3f46' }}>
                      <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{b.sesi}</div>
                      <div style={{ fontSize: '11px', color: '#a1a1aa' }}>{b.jam_mulai?.slice(0, 5)} – {b.jam_selesai?.slice(0, 5)}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#09090b' }}>
                      Rp {Number(b.total_harga).toLocaleString('id-ID')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px',
                        borderRadius: '20px', fontSize: '11px', fontWeight: 600,
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
              <p style={{ fontSize: '14px', margin: 0 }}>Belum ada riwayat booking</p>
              <p style={{ fontSize: '12px', margin: '4px 0 0', color: '#d4d4d8' }}>
                Yuk, booking lapangan pertama Anda!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
