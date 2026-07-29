'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { login, resetPassword } from '../actions'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isForgotPassword, setIsForgotPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      if (isForgotPassword) {
        const result = await resetPassword(formData)
        if (result?.error) setError(result.error)
        if (result?.success) setSuccess(result.success)
      } else {
        const result = await login(formData)
        if (result?.error) setError(result.error)
      }
    })
  }

  return (
    <div className="auth-form-container">
      <div className="auth-form-card">
        <div className="auth-form-header">
          <h2 className="auth-title">{isForgotPassword ? 'Lupa Password' : 'Masuk ke akun'}</h2>
          <p className="auth-subtitle">
            {isForgotPassword ? (
              <>Ingat password Anda? <button type="button" onClick={() => { setIsForgotPassword(false); setError(null); setSuccess(null); }} className="auth-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 'inherit' }}>Masuk di sini</button></>
            ) : (
              <>Belum punya akun? <Link href="/register" className="auth-link">Daftar sekarang</Link></>
            )}
          </p>
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
            <label className="field-label" htmlFor="email">Email terdaftar</label>
            <div className="field-wrapper">
              <Mail className="field-icon" size={16} />
              <input
                id="email"
                name="email"
                type="email"
                className="field-input"
                placeholder="nama@email.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {!isForgotPassword && (
            <div className="field-group">
              <div className="field-label-row">
                <label className="field-label" htmlFor="password">Password</label>
                <button type="button" onClick={() => { setIsForgotPassword(true); setError(null); setSuccess(null); }} className="forgot-link" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '13px' }}>Lupa password?</button>
              </div>
              <div className="field-wrapper">
                <Lock className="field-icon" size={16} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="field-input field-input-padded"
                  placeholder="Masukkan password"
                  required={!isForgotPassword}
                  autoComplete="current-password"
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
          )}

          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending ? (
              <><Loader2 size={16} className="spin" /><span>Memproses...</span></>
            ) : (
              <span>{isForgotPassword ? 'Kirim Link Reset' : 'Masuk'}</span>
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
          padding: 28px 32px 32px;
        }
        .auth-form-card {
          width: 100%;
          max-width: 400px;
        }
        .auth-form-header {
          margin-bottom: 24px;
        }
        .auth-title {
          font-size: 20px;
          font-weight: 700;
          color: #09090b;
          letter-spacing: -0.03em;
          margin-bottom: 4px;
        }
        .auth-subtitle {
          font-size: 13px;
          color: #71717a;
        }
        .auth-link {
          color: #18181b;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .auth-link:hover { color: #52525b; }
        .alert-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 12px 14px;
          color: #dc2626;
          font-size: 13px;
          margin-bottom: 20px;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field-label {
          font-size: 13px;
          font-weight: 600;
          color: #18181b;
        }
        .field-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .forgot-link {
          font-size: 12px;
          color: #71717a;
          text-decoration: none;
        }
        .forgot-link:hover { color: #18181b; }
        .field-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .field-icon {
          position: absolute;
          left: 13px;
          color: #a1a1aa;
          pointer-events: none;
        }
        .field-input {
          width: 100%;
          padding: 10px 13px 10px 38px;
          border: 1px solid #d4d4d8;
          border-radius: 8px;
          font-size: 14px;
          color: #09090b;
          background: #fff;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .field-input::placeholder { color: #a1a1aa; }
        .field-input:focus {
          border-color: #09090b;
          box-shadow: 0 0 0 3px rgba(9,9,11,0.08);
        }
        .field-input-padded { padding-right: 40px; }
        .field-eye {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #a1a1aa;
          display: flex;
          align-items: center;
          padding: 4px;
          cursor: pointer;
        }
        .field-eye:hover { color: #18181b; }
        .btn-primary {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 20px;
          background: #09090b;
          color: #fafafa;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s;
          margin-top: 4px;
        }
        .btn-primary:hover:not(:disabled) { background: #27272a; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .spin { animation: spin 0.8s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
