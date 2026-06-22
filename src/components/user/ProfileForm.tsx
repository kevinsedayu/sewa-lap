'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ProfileFormProps {
  initialProfile: {
    id: string
    full_name: string | null
    phone: string | null
  }
  email: string
}

export default function ProfileForm({ initialProfile, email }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialProfile.full_name || '')
  const [phone, setPhone] = useState(initialProfile.phone || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone,
      })
      .eq('id', initialProfile.id)

    setIsSubmitting(false)

    if (error) {
      setMessage({ type: 'error', text: 'Gagal memperbarui profil. Silakan coba lagi.' })
      console.error(error)
    } else {
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' })
    }
  }

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', padding: '32px', maxWidth: '600px' }}>
      
      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontSize: '13px', fontWeight: 500,
          background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#166534' : '#b91c1c',
          border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#3f3f46', marginBottom: '8px' }}>
            Alamat Email
          </label>
          <input 
            type="email" 
            value={email} 
            disabled 
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e4e4e7', background: '#f4f4f5', color: '#a1a1aa', fontSize: '14px', cursor: 'not-allowed' }}
          />
          <p style={{ fontSize: '11px', color: '#a1a1aa', margin: '6px 0 0' }}>Email tidak dapat diubah karena digunakan untuk otentikasi.</p>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#09090b', marginBottom: '8px' }}>
            Nama Lengkap
          </label>
          <input 
            type="text" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Masukkan nama lengkap Anda"
            required
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d4d4d8', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
            onFocus={(e) => e.target.style.borderColor = '#09090b'}
            onBlur={(e) => e.target.style.borderColor = '#d4d4d8'}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#09090b', marginBottom: '8px' }}>
            Nomor Telepon / WhatsApp
          </label>
          <input 
            type="tel" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Contoh: 081234567890"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d4d4d8', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
            onFocus={(e) => e.target.style.borderColor = '#09090b'}
            onBlur={(e) => e.target.style.borderColor = '#d4d4d8'}
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ 
            marginTop: '8px', padding: '12px', background: '#09090b', color: '#fff', 
            border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, 
            cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1,
            transition: 'opacity 0.2s'
          }}
        >
          {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>

      </form>
    </div>
  )
}
