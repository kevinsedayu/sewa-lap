'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { login } from '../actions'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="auth-form-container">
      <div className="auth-form-card">
        <div className="auth-form-header">
          <h2 className="auth-title">Masuk ke akun</h2>
          <p className="auth-subtitle">Belum punya akun?{' '}
            <Link href="/register" className="auth-link">Daftar sekarang</Link>
          </p>
        </div>

        {error && (
          <div className="alert-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label className="field-label" htmlFor="email">Email</label>
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

          <div className="field-group">
            <div className="field-label-row">
              <label className="field-label" htmlFor="password">Password</label>
              <Link href="#" className="forgot-link">Lupa password?</Link>
            </div>
            <div className="field-wrapper">
              <Lock className="field-icon" size={16} />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="field-input field-input-padded"
                placeholder="Masukkan password"
                required
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

          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending ? (
              <><Loader2 size={16} className="spin" /><span>Memproses...</span></>
            ) : (
              <span>Masuk</span>
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
        }
        .auth-form-header {
          margin-bottom: 28px;
        }
        .auth-title {
          font-size: 22px;
          font-weight: 700;
          color: #fafafa;
          letter-spacing: -0.03em;
          margin-bottom: 6px;
        }
        .auth-subtitle {
          font-size: 14px;
          color: #a1a1aa;
        }
        .auth-link {
          color: #fafafa;
          font-weight: 500;
          text-decoration: none;
          border-bottom: 1px solid #fafafa;
          padding-bottom: 1px;
        }
        .auth-link:hover { opacity: 0.6; }
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
          font-weight: 500;
          color: #d4d4d8;
        }
        .field-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .forgot-link {
          font-size: 12px;
          color: #a1a1aa;
          text-decoration: none;
        }
        .forgot-link:hover { color: #fafafa; }
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
          border: 1px solid #27272a;
          border-radius: 8px;
          font-size: 14px;
          color: #fafafa;
          background: #18181b;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .field-input::placeholder { color: #71717a; }
        .field-input:focus {
          border-color: #fafafa;
          box-shadow: 0 0 0 3px rgba(250,250,250,0.1);
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
        .field-eye:hover { color: #52525b; }
        .btn-primary {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 20px;
          background: #fafafa;
          color: #09090b;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s;
          margin-top: 4px;
        }
        .btn-primary:hover:not(:disabled) { opacity: 0.85; }
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
