'use client'

import { MessageCircle, Bell, Instagram, ExternalLink, HelpCircle, CheckCircle2 } from 'lucide-react'

export default function BantuanPage() {
  return (
    <div className="page-content" style={{ maxWidth: '800px', margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>
      
      {/* Hero Section */}
      <section style={{ 
        background: '#0F172A', 
        borderRadius: '16px', 
        padding: '40px 32px',
        color: 'white',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(15,23,42,0.4)',
        border: '1px solid rgba(99,119,180,0.25)'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(99,119,180,0.2) 0%, rgba(15,23,42,0) 70%)',
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
              color: '#93c5fd', 
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
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6, maxWidth: '400px' }}>
              Hubungi saluran resmi kami untuk bantuan pemesanan, informasi fasilitas, dan perubahan jadwal sewa.
            </p>
          </div>
          <div style={{ flexShrink: 0, background: 'rgba(255,255,255,0.08)', padding: '16px', borderRadius: '20px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
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
          <a href="https://wa.me/6281328215620" target="_blank" rel="noopener noreferrer" style={{
            position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', gap: '16px', padding: '20px',
            background: '#0F172A', border: '1px solid rgba(99,119,180,0.25)', borderRadius: '16px',
            textDecoration: 'none', color: 'white', transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(15,23,42,0.3)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#25d366'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(37,211,102,0.25)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(99,119,180,0.25)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(15,23,42,0.3)' }}
          >
            {/* Glow */}
            <div style={{ position: 'absolute', top: '-50%', right: '-30%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(37,211,102,0.15) 0%, rgba(15,23,42,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
            
            <div style={{ position: 'relative', zIndex: 1, width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(37,211,102,0.15)', color: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MessageCircle size={24} />
            </div>
            <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 2px' }}>WhatsApp Admin</h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>081328215620 · Respon cepat</p>
            </div>
            <ExternalLink size={16} color="rgba(255,255,255,0.3)" style={{ position: 'relative', zIndex: 1 }} />
          </a>

          {/* Instagram */}
          <a href="https://www.instagram.com/putrapermadafc?igsh=dmV3czcwN2dqOWZn" target="_blank" rel="noopener noreferrer" style={{
            position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', gap: '16px', padding: '20px',
            background: '#0F172A', border: '1px solid rgba(99,119,180,0.25)', borderRadius: '16px',
            textDecoration: 'none', color: 'white', transition: 'all 0.3s ease',
            boxShadow: '0 4px 20px rgba(15,23,42,0.3)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#e1306c'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(225,48,108,0.25)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(99,119,180,0.25)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(15,23,42,0.3)' }}
          >
            {/* Glow */}
            <div style={{ position: 'absolute', top: '-50%', right: '-30%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(225,48,108,0.15) 0%, rgba(15,23,42,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
            
            <div style={{ position: 'relative', zIndex: 1, width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(225,48,108,0.15)', color: '#e1306c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Instagram size={24} />
            </div>
            <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 2px' }}>Instagram</h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>@putrapermadafc</p>
            </div>
            <ExternalLink size={16} color="rgba(255,255,255,0.3)" style={{ position: 'relative', zIndex: 1 }} />
          </a>
        </div>
      </section>

      {/* Values Grid Section */}
      <section style={{ 
        background: '#0F172A', 
        border: '1px solid rgba(99,119,180,0.25)', 
        borderRadius: '24px', 
        padding: '32px',
        boxShadow: '0 10px 40px rgba(15,23,42,0.3)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
          
          <div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(37,211,102,0.15)', color: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <CheckCircle2 size={20} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Dukungan Booking</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
              Butuh bantuan dengan pembayaran, konfirmasi, atau pengajuan pembatalan sewa? Silakan chat admin via WhatsApp.
            </p>
          </div>

          <div>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(225,48,108,0.15)', color: '#e1306c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Bell size={20} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Info Lapangan</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
              Ikuti Instagram resmi kami untuk update ketersediaan lapangan, cuaca terkini, dan info perbaikan rutin.
            </p>
          </div>

        </div>
      </section>

    </div>
  )
}
