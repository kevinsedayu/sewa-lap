export default function AdminLokasiPage() {
  const mapsShareLink = 'https://share.google/jKfo3AOCfJDOJoCqv'

  return (
    <div className="page-content" style={{ maxWidth: '900px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#09090b', letterSpacing: '-0.025em', margin: '0 0 6px' }}>
          Lokasi Lapangan
        </h1>
        <p style={{ fontSize: '13px', color: '#71717a', margin: 0 }}>
          Informasi lokasi dan peta lapangan
        </p>
      </div>

      {/* Info Card */}
      <div style={{
        background: '#ffffff', border: '1px solid #e4e4e7',
        borderRadius: '14px', padding: '24px', marginBottom: '20px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px',
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '40px', height: '40px', background: '#09090b',
              borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '20px' }}>⚽</span>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#09090b' }}>Lapangan Gelora Bumi Mintarsih</div>
              <div style={{ fontSize: '12px', color: '#71717a' }}>Lapangan Sepakbola</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: '📍', label: 'Alamat', value: 'Lihat di Google Maps' },
              { icon: '🕐', label: 'Jam Operasional', value: 'Senin – Minggu, 07.00 – 22.00 WIB' },
              { icon: '🔗', label: 'Link Lokasi', value: mapsShareLink },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '14px', marginTop: '1px', flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {item.label}
                  </div>
                  {item.label === 'Link Lokasi' ? (
                    <a href={mapsShareLink} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: '12px', color: '#6366f1', marginTop: '2px', display: 'block', wordBreak: 'break-all' }}>
                      {item.value}
                    </a>
                  ) : (
                    <div style={{ fontSize: '13px', color: '#3f3f46', marginTop: '2px' }}>{item.value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <a href={mapsShareLink} target="_blank" rel="noopener noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '11px 20px', background: '#09090b', color: '#fafafa',
          borderRadius: '8px', fontSize: '13px', fontWeight: 600,
          textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          📍 Buka di Google Maps
        </a>
      </div>

      {/* Maps Embed */}
      <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid #f4f4f5',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#09090b' }}>Peta Lokasi</span>
          <a href={mapsShareLink} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '12px', color: '#71717a', textDecoration: 'none' }}>
            Buka penuh →
          </a>
        </div>
        <iframe
          src="https://maps.google.com/maps?q=lapangan+sepakbola&output=embed&z=15"
          width="100%" height="420"
          style={{ border: 'none', display: 'block' }}
          allowFullScreen loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Lokasi Lapangan"
        />
        <div style={{ padding: '14px 20px', borderTop: '1px solid #f4f4f5', textAlign: 'center' }}>
          <a href={mapsShareLink} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', color: '#71717a', textDecoration: 'none',
            padding: '8px 16px', border: '1px solid #e4e4e7', borderRadius: '8px',
          }}>
            🗺️ Jika peta tidak tampil, klik di sini untuk membuka Google Maps
          </a>
        </div>
      </div>
    </div>
  )
}
