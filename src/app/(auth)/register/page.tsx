'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from 'lucide-react'
import { register } from '../actions'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirm = formData.get('confirm_password') as string
    if (password !== confirm) {
      setError('Password dan konfirmasi password tidak cocok.')
      return
    }
    startTransition(async () => {
      const result = await register(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="auth-form-container">
      <div className="auth-form-card">
        <div className="auth-form-header">
          <h2 className="auth-title">Buat akun baru</h2>
          <p className="auth-subtitle">Sudah punya akun?{' '}
            <Link href="/login" className="auth-link">Masuk di sini</Link>
          </p>
        </div>

        {error && (
          <div className="alert-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label className="field-label" htmlFor="full_name">Nama Lengkap</label>
            <div className="field-wrapper">
              <User className="field-icon" size={16} />
              <input
                id="full_name"
                name="full_name"
                type="text"
                className="field-input"
                placeholder="Nama lengkap Anda"
                required
                autoComplete="name"
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label" htmlFor="phone">Nomor Telepon</label>
            <div className="field-wrapper">
              <Phone className="field-icon" size={16} />
              <input
                id="phone"
                name="phone"
                type="tel"
                className="field-input"
                placeholder="08xxxxxxxxxx"
                required
                autoComplete="tel"
              />
            </div>
          </div>

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

          <div className="field-row">
            <div className="field-group">
              <label className="field-label" htmlFor="password">Password</label>
              <div className="field-wrapper">
                <Lock className="field-icon" size={16} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="field-input field-input-padded"
                  placeholder="Min. 8 karakter"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button type="button" className="field-eye" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label" htmlFor="confirm_password">Konfirmasi Password</label>
              <div className="field-wrapper">
                <Lock className="field-icon" size={16} />
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirm ? 'text' : 'password'}
                  className="field-input field-input-padded"
                  placeholder="Ulangi password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <button type="button" className="field-eye" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          <p className="terms-text">
            Dengan mendaftar, Anda menyetujui{' '}
            <Link href="#" className="terms-link">Syarat & Ketentuan</Link>
            {' '}dan{' '}
            <Link href="#" className="terms-link">Kebijakan Privasi</Link>.
          </p>

          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending ? (
              <><Loader2 size={16} className="spin" /><span>Mendaftarkan...</span></>
            ) : (
              <span>Buat Akun</span>
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
          max-width: 440px;
        }
        .auth-form-header { margin-bottom: 28px; }
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
        .field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 500px) {
          .field-row { grid-template-columns: 1fr; }
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
        .terms-text {
          font-size: 12px;
          color: #a1a1aa;
          line-height: 1.6;
        }
        .terms-link {
          color: #fafafa;
          text-decoration: none;
          border-bottom: 1px solid #3f3f46;
        }
        .terms-link:hover { border-color: #fafafa; }
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
