import { Copyright } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(135deg, #0F172A 0%, #1e2d5a 100%)',
      borderTop: '1px solid rgba(99,119,180,0.2)',
      padding: '40px 24px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle glow */}
      <div style={{
        position: 'absolute',
        top: '-40px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '400px',
        height: '80px',
        background: 'radial-gradient(ellipse, rgba(99,119,180,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Copyright line */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          marginBottom: '6px',
        }}>
          <Copyright size={14} style={{ color: '#60a5fa', flexShrink: 0 }} />
          <span style={{
            fontSize: '14px',
            fontWeight: 600,
            background: 'linear-gradient(90deg, #93c5fd, #60a5fa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            2026 Gelora Bumi Mintarsih. Hak Cipta Dilindungi.
          </span>
        </div>

        {/* Location line */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontSize: '13px',
            background: 'linear-gradient(90deg, #6ea8fe, #93c5fd)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 500,
          }}>
            Jl. Sedayu Raya, Kalisegoro, Gunungpati, Kota Semarang
          </span>
        </div>
      </div>
    </footer>
  )
}
