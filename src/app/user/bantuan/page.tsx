'use client'

import { MessageCircle, Bell, Instagram, MapPin, ExternalLink, HelpCircle, CheckCircle2 } from 'lucide-react'

export default function BantuanPage() {
  return (
    <div className="page-content" style={{ maxWidth: '800px', margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* Hero Section */}
      <section style={{ 
        background: '#09090b', 
        borderRadius: '16px', 
        padding: '40px 32px',
        color: 'white',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(9,9,11,0) 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}></div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ flex: '1 1 300px' }}>
            <p style={{ 
              fontSize: '11px', 
              fontWeight: 700, 
              letterSpacing: '0.1em', 
              textTransform: 'uppercase', 
              color: '#10b981', 
              marginBottom: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <HelpCircle size={14} /> Pusat Bantuan
            </p>
            <h1 style={{ 
              fontFamily: "'Bricolage Grotesque', sans-serif", 
              fontSize: '36px', 
              fontWeight: 800, 
              lineHeight: 1.1,
              letterSpacing: '-0.03em', 
              margin: '0 0 16px' 
            }}>
              Ada kendala dengan<br/>jadwal Anda?
            </h1>
            <p style={{ fontSize: '15px', color: '#a1a1aa', margin: 0, lineHeight: 1.6, maxWidth: '400px' }}>
              Hubungi saluran resmi kami untuk bantuan pemesanan, informasi fasilitas, dan perubahan jadwal sewa.
            </p>
          </div>
          <div style={{ flexShrink: 0, background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '20px', backdropFilter: 'blur(10px)' }}>
            <img src="/logo.png" alt="Gelora Bumi Mintarsih" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
          </div>
        </div>
      </section>

      {/* Official Links Section */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: '22px', fontWeight: 700, color: '#09090b', letterSpacing: '-0.02em', margin: '0 0 4px' }}>
            Tetap Terhubung
          </h2>
          <p style={{ fontSize: '13px', color: '#71717a', margin: 0 }}>
            Gunakan tombol resmi di bawah ini untuk menghubungi kami.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {/* WA Admin */}
          <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: '16px', padding: '20px',
            background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px',
            textDecoration: 'none', color: 'inherit', transition: 'all 0.2s ease',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e4e4e7'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MessageCircle size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#09090b', margin: '0 0 2px' }}>WhatsApp Admin</h3>
              <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Respon cepat</p>
            </div>
            <ExternalLink size={16} color="#a1a1aa" />
          </a>

          {/* Instagram */}
          <a href="https://www.instagram.com/gelorabumimintarsih" target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: '16px', padding: '20px',
            background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px',
            textDecoration: 'none', color: 'inherit', transition: 'all 0.2s ease',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#db2777'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e4e4e7'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fce7f3', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Instagram size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#09090b', margin: '0 0 2px' }}>Instagram</h3>
              <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>@gelorabumimintarsih</p>
            </div>
            <ExternalLink size={16} color="#a1a1aa" />
          </a>

          {/* Maps */}
          <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: '16px', padding: '20px',
            background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '16px',
            textDecoration: 'none', color: 'inherit', transition: 'all 0.2s ease',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e4e4e7'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#09090b', margin: '0 0 2px' }}>Lokasi Maps</h3>
              <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>Petunjuk arah</p>
            </div>
            <ExternalLink size={16} color="#a1a1aa" />
          </a>
        </div>
      </section>

      {/* Values Grid Section */}
      <section style={{ 
        background: '#fafafa', 
        border: '1px solid #e4e4e7', 
        borderRadius: '24px', 
        padding: '32px' 
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
          
          <div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#09090b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <CheckCircle2 size={20} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#09090b', marginBottom: '8px' }}>Dukungan Booking</h3>
            <p style={{ fontSize: '13px', color: '#71717a', lineHeight: 1.6, margin: 0 }}>
              Butuh bantuan dengan pembayaran, konfirmasi, atau pengajuan pembatalan sewa? Silakan chat admin via WhatsApp.
            </p>
          </div>

          <div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#09090b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Bell size={20} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#09090b', marginBottom: '8px' }}>Info Lapangan</h3>
            <p style={{ fontSize: '13px', color: '#71717a', lineHeight: 1.6, margin: 0 }}>
              Ikuti Instagram resmi kami untuk update ketersediaan lapangan, cuaca terkini, dan info perbaikan rutin.
            </p>
          </div>

          <div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#09090b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <MapPin size={20} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#09090b', marginBottom: '8px' }}>Panduan Lokasi</h3>
            <p style={{ fontSize: '13px', color: '#71717a', lineHeight: 1.6, margin: 0 }}>
              Pastikan Anda sudah mengetahui lokasi pasti Gelora Bumi Mintarsih sebelum jadwal sewa Anda dimulai.
            </p>
          </div>

        </div>
      </section>

    </div>
  )
}
