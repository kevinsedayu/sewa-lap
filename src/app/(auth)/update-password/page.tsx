'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react'

export default function UpdatePasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string

    startTransition(async () => {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Password berhasil diperbarui. Silakan login dengan password baru.')
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    })
  }

  return (
    <div className="auth-form-container">
      <div className="auth-form-card">
        <div className="auth-form-header">
          <h2 className="auth-title">Buat Password Baru</h2>
          <p className="auth-subtitle">Masukkan password baru untuk akun Anda.</p>
        </div>

        {error && (
          <div className="alert-error">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert-error" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label className="field-label" htmlFor="password">Password Baru</label>
            <div className="field-wrapper">
              <Lock className="field-icon" size={16} />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="field-input field-input-padded"
                placeholder="Masukkan password baru"
                required
                minLength={6}
              />
              <button
                type="button"
                className="field-eye"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={isPending || !!success}>
            {isPending ? (
              <><Loader2 size={16} className="spin" /><span>Memproses...</span></>
            ) : (
              <span>Simpan Password Baru</span>
            )}
          </button>
        </form>
      </div>

      <style>{`
        .auth-form-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 24px;
          min-height: 100vh;
        }
        .auth-form-card {
          width: 100%;
          max-width: 400px;
          background: #ffffff;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.04);
          border: 1px solid #e4e4e7;
        }
        .auth-form-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .auth-title {
          font-size: 24px;
          font-weight: 700;
          color: #09090b;
          margin: 0 0 8px;
          letter-spacing: -0.02em;
        }
        .auth-subtitle {
          font-size: 14px;
          color: #71717a;
          margin: 0;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field-label {
          font-size: 13px;
          font-weight: 600;
          color: #09090b;
        }
        .field-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .field-icon {
          position: absolute;
          left: 12px;
          color: #71717a;
        }
        .field-eye {
          position: absolute;
          right: 12px;
          color: #71717a;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .field-input {
          width: 100%;
          height: 44px;
          padding: 0 12px 0 40px;
          border: 1px solid #e4e4e7;
          border-radius: 10px;
          font-size: 14px;
          color: #09090b;
          background: #ffffff;
          transition: all 0.2s;
        }
        .field-input-padded {
          padding-right: 40px;
        }
        .field-input:focus {
          outline: none;
          border-color: #09090b;
          box-shadow: 0 0 0 1px #09090b;
        }
        .field-input::placeholder {
          color: #a1a1aa;
        }
        .btn-primary {
          height: 44px;
          width: 100%;
          background: #09090b;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
        }
        .btn-primary:hover:not(:disabled) {
          background: #27272a;
        }
        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .alert-error {
          background: #fee2e2;
          color: #b91c1c;
          padding: 12px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 24px;
          border: 1px solid #fecaca;
        }
        @media (max-width: 480px) {
          .auth-form-card {
            padding: 32px 24px;
            border-radius: 16px;
          }
        }
      `}</style>
    </div>
  )
}
