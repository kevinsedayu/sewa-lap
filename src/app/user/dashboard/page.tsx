import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
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

  const { data: userBookings } = await supabase
    .from('sewa')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

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
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h1 className={`${anton.className} dashboard-header-text`} style={{
          color: '#166534',
          letterSpacing: '2px',
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          textShadow: '2px 2px 0px rgba(0,0,0,0.12)',
        }}>
          Sewa Gelora Bumi Mintarsih
        </h1>
        <div style={{
          width: '100%',
          height: '160px',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 8px 20px -5px rgba(0,0,0,0.12)',
        }}>
          <img
            src="/lapangan.jpeg"
            alt="Gelora Bumi Mintarsih"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* Fasilitas Slider */}
      <div style={{ marginBottom: '24px' }}>
        <h2 className={`${anton.className} dashboard-header-text`} style={{
          color: '#166534',
          marginBottom: '12px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          textAlign: 'center',
          textShadow: '2px 2px 0px rgba(0,0,0,0.12)',
        }}>
          Fasilitas Kami
        </h2>
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          gap: '12px',
          paddingBottom: '8px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}>
          {[
            { src: '/lapangan2.jpeg', label: 'Lapangan Standart Nasional' },
            { src: '/toilet.jpeg', label: 'Toilet Bersih' },
            { src: '/mushola.jpeg', label: 'Mushola' },
            { src: '/bench.jpeg', label: 'Bench Pemain' }
          ].map((img, i) => (
            <div key={i} className="facility-card" style={{
              scrollSnapAlign: 'center',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              flexShrink: 0,
            }}>
              <img src={img.src} alt={img.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                color: 'white', padding: '20px 12px 12px', textAlign: 'center',
                fontSize: '14px', fontWeight: 600,
              }}>
                {img.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Lapangan */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#09090b', marginBottom: '12px' }}>Informasi Lapangan</h2>
        <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', padding: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px', color: '#09090b' }}>{lapangan?.nama || 'Nama Lapangan'}</h3>
          <p style={{ fontSize: '13px', color: '#52525b', margin: '0 0 12px', lineHeight: '1.5' }}>{lapangan?.deskripsi || 'Deskripsi belum ditambahkan.'}</p>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#16a34a' }}>
            Sesi Pagi: Rp 200.000 &nbsp;|&nbsp; Sesi Sore: Rp 250.000
          </div>
        </div>
      </div>

      {/* Greeting & Quick Action */}
      <div className="greeting-row">
        <div>
          <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '4px' }}>
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#09090b', margin: 0 }}>
            {greeting}, {profile?.full_name || 'User'} 👋
          </h2>
        </div>
        <Link href="/user/booking" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          padding: '10px 20px', background: '#09090b', color: '#fafafa',
          borderRadius: '8px', fontSize: '13px', fontWeight: 600,
          textDecoration: 'none',
        }}>
          ⚽ Booking Sekarang
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Booking Aktif', value: String(bookingAktif), icon: '✅', desc: 'Sudah dikonfirmasi' },
          { label: 'Menunggu', value: String(bookingPending), icon: '⏳', desc: 'Sedang diproses' },
          { label: 'Total Booking', value: String(totalBooking), icon: '📋', desc: 'Semua riwayat' },
        ].map((card) => (
          <div key={card.label} style={{
            background: '#ffffff',
            border: '1px solid #e4e4e7',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#71717a', fontWeight: 500 }}>{card.label}</span>
              <span style={{ fontSize: '18px' }}>{card.icon}</span>
            </div>
            <div className="stats-card-value" style={{ fontSize: '26px', fontWeight: 700, color: '#09090b', letterSpacing: '-0.03em', marginBottom: '2px' }}>
              {card.value}
            </div>
            <div style={{ fontSize: '11px', color: '#a1a1aa' }}>{card.desc}</div>
          </div>
        ))}
      </div>

      {/* CTA Banner */}
      <div style={{
        background: '#09090b',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
      }}>
        <div className="cta-banner">
          <div>
            <h2 style={{ color: '#fafafa', fontSize: '16px', fontWeight: 700, margin: '0 0 4px' }}>
              Siap bermain hari ini?
            </h2>
            <p style={{ color: '#71717a', fontSize: '13px', margin: 0 }}>
              Lapangan tersedia setiap hari. Booking sekarang!
            </p>
          </div>
          <Link href="/user/booking" style={{
            background: '#fafafa', color: '#09090b',
            borderRadius: '8px', padding: '10px 20px',
            fontSize: '13px', fontWeight: 600,
            textDecoration: 'none', display: 'inline-block', textAlign: 'center',
          }}>
            Pilih Jadwal →
          </Link>
        </div>
      </div>

      {/* Riwayat Booking */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#09090b', margin: 0 }}>Riwayat Booking</h2>
          <Link href="/user/riwayat" style={{ fontSize: '13px', color: '#71717a', textDecoration: 'none' }}>
            Lihat semua →
          </Link>
        </div>

        {/* Desktop Table View */}
        <div className="booking-table-view" style={{
          background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', overflow: 'hidden',
        }}>
          {userBookings && userBookings.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f4f4f5' }}>
                  {['Tanggal', 'Sesi / Jam', 'Total Harga', 'Status'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontSize: '12px', fontWeight: 600, color: '#71717a', letterSpacing: '0.02em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {userBookings.slice(0, 5).map((b: any, i: number) => (
                  <tr key={b.id} style={{ borderBottom: i < Math.min(userBookings.length, 5) - 1 ? '1px solid #f4f4f5' : 'none' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#3f3f46' }}>
                      {new Date(b.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#3f3f46' }}>
                      <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{b.sesi}</div>
                      <div style={{ fontSize: '11px', color: '#a1a1aa' }}>{b.jam_mulai?.slice(0, 5)} – {b.jam_selesai?.slice(0, 5)}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#09090b' }}>
                      Rp {Number(b.total_harga).toLocaleString('id-ID')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 10px',
                        borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                        background: statusColor[b.status] + '18', color: statusColor[b.status],
                      }}>
                        {statusLabel[b.status] || b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#a1a1aa' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📭</div>
              <p style={{ fontSize: '14px', margin: 0 }}>Belum ada riwayat booking</p>
            </div>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="booking-card-list">
          {userBookings && userBookings.length > 0 ? (
            userBookings.slice(0, 5).map((b: any) => (
              <div key={b.id} style={{
                background: '#fff', border: '1px solid #e4e4e7', borderRadius: '10px',
                padding: '14px 16px', marginBottom: '10px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px', textTransform: 'capitalize', color: '#09090b' }}>
                      Sesi {b.sesi}
                    </div>
                    <div style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>
                      {new Date(b.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}{b.jam_mulai?.slice(0, 5)} – {b.jam_selesai?.slice(0, 5)}
                    </div>
                  </div>
                  <span style={{
                    display: 'inline-block', padding: '3px 10px',
                    borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                    background: statusColor[b.status] + '18', color: statusColor[b.status],
                    flexShrink: 0, marginLeft: '8px',
                  }}>
                    {statusLabel[b.status] || b.status}
                  </span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#09090b', marginTop: '10px' }}>
                  Rp {Number(b.total_harga).toLocaleString('id-ID')}
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: '#a1a1aa', background: '#fff', borderRadius: '12px', border: '1px solid #e4e4e7' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📭</div>
              <p style={{ fontSize: '14px', margin: 0 }}>Belum ada riwayat booking</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
