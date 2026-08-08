import { Copyright, MapPin, Instagram, Phone } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden pt-16 pb-8 px-6 sm:px-12" style={{
      background: 'linear-gradient(135deg, #0F172A 0%, #1e2d5a 100%)',
      borderTop: '1px solid rgba(67,56,202,0.3)',
    }}>
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(67,56,202,0.5)]" />
              <span className="text-2xl font-extrabold tracking-wide font-bricolage text-white">BumiMintarsih</span>
            </div>
            <p className="text-blue-100/70 text-sm leading-relaxed mb-6 max-w-sm">
              Sistem penyewaan lapangan sepakbola online berstandar nasional. Kami memastikan kenyamanan dan kualitas rumput terbaik untuk pengalaman bermain Anda.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:ml-auto">
            <h3 className="font-bricolage text-lg font-bold text-white mb-6">Tautan Singkat</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-sm text-blue-100/70 hover:text-white transition-colors">Beranda</Link></li>
              <li><Link href="/user/bantuan" className="text-sm text-blue-100/70 hover:text-white transition-colors">Pusat Bantuan</Link></li>
              <li><Link href="/login" className="text-sm text-blue-100/70 hover:text-white transition-colors">Login / Daftar</Link></li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div className="md:ml-auto">
            <h3 className="font-bricolage text-lg font-bold text-white mb-6">Hubungi Kami</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-blue-100/70">
                <MapPin size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">Sedayu RW 01, Kalisegoro, Gunungpati<br/>Kota Semarang</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-blue-100/70">
                <Phone size={18} className="text-indigo-400 shrink-0" />
                <a href="https://wa.me/6281328215620" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">0813-2821-5620</a>
              </li>
              <li className="flex items-center gap-3 text-sm text-blue-100/70">
                <Instagram size={18} className="text-indigo-400 shrink-0" />
                <a href="https://instagram.com/putrapermadafc" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">@putrapermadafc</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"></div>

        {/* Copyright line */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm font-medium text-blue-200/50">
          <div className="flex items-center gap-1.5">
            <Copyright size={14} />
            <span>2026 Gelora Bumi Mintarsih.</span>
          </div>
          <span className="hidden sm:inline">|</span>
          <span>Hak Cipta Dilindungi.</span>
        </div>
      </div>
    </footer>
  )
}
