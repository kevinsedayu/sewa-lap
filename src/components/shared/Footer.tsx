import { Copyright } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden text-center px-6 py-10" style={{
      background: 'linear-gradient(135deg, #0F172A 0%, #1e2d5a 100%)',
      borderTop: '1px solid rgba(99,119,180,0.2)',
    }}>
      {/* Subtle glow */}
      <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 w-[400px] h-[80px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(99,119,180,0.12) 0%, transparent 70%)' }} 
      />

      <div className="relative z-10 flex flex-col items-center gap-2">
        {/* Copyright line */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-sm sm:text-base font-semibold"
          style={{
            background: 'linear-gradient(90deg, #93c5fd, #60a5fa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
          <Copyright size={14} className="text-blue-400" style={{ WebkitTextFillColor: '#60a5fa' }} />
          <span>2026 Gelora Bumi Mintarsih. Hak Cipta Dilindungi.</span>
        </div>

        {/* Location line */}
        <div className="text-xs sm:text-sm font-medium leading-relaxed max-w-[280px] sm:max-w-none mx-auto"
          style={{
            background: 'linear-gradient(90deg, #6ea8fe, #93c5fd)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
          Jl. Sedayu Raya, Kalisegoro, Gunungpati, Kota Semarang
        </div>
      </div>
    </footer>
  )
}
