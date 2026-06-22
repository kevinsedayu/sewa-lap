'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  role: string
  created_at: string
}

export default function UsersTable({ initialUsers, currentUserId }: { initialUsers: Profile[], currentUserId: string }) {
  const [users, setUsers] = useState(initialUsers)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const toggleRole = async (userId: string, currentRole: string) => {
    if (userId === currentUserId) {
      alert("Anda tidak dapat mengubah peran Anda sendiri.")
      return
    }

    setLoadingId(userId)
    setError(null)
    const newRole = currentRole === 'admin' ? 'user' : 'admin'

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      console.error(error)
      setError("Gagal mengubah peran. Pastikan Anda sudah mengupdate RLS Policy di Supabase.")
    } else {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    }
    setLoadingId(null)
  }

  const deleteUser = async (userId: string) => {
    if (userId === currentUserId) {
      alert("Anda tidak dapat menghapus akun Anda sendiri.")
      return
    }

    if (!confirm("Yakin ingin menghapus pengguna ini? (Penghapusan mungkin gagal jika pengguna memiliki riwayat booking aktif)")) {
      return
    }

    setLoadingId(userId)
    setError(null)

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error(error)
      setError("Gagal menghapus pengguna. Pastikan pengguna tidak terikat dengan data sewa/booking, atau update RLS Policy Anda.")
    } else {
      setUsers(prev => prev.filter(u => u.id !== userId))
    }
    setLoadingId(null)
  }

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e4e4e7', borderRadius: '12px', overflow: 'hidden' }}>
      {error && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#b91c1c', borderBottom: '1px solid #fecaca', fontSize: '13px' }}>
          {error}
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f4f4f5', background: '#fafafa' }}>
              {['Nama Pengguna', 'Telepon', 'Bergabung Sejak', 'Peran (Role)', 'Aksi'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontSize: '11px', fontWeight: 600,
                  color: '#71717a', letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid #f4f4f5' : 'none' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#09090b' }}>
                    {u.full_name || 'Tanpa Nama'}
                    {u.id === currentUserId && <span style={{ marginLeft: '8px', fontSize: '11px', color: '#a1a1aa', fontWeight: 500 }}>(Anda)</span>}
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '13px', color: '#52525b' }}>
                  {u.phone || '-'}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '13px', color: '#52525b' }}>
                  {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    display: 'inline-block', padding: '3px 10px',
                    borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                    background: u.role === 'admin' ? '#dcfce7' : '#f4f4f5',
                    color: u.role === 'admin' ? '#166534' : '#52525b',
                    textTransform: 'capitalize'
                  }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {u.id !== currentUserId && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => toggleRole(u.id, u.role)}
                        disabled={loadingId === u.id}
                        style={{
                          padding: '6px 12px', border: '1px solid #e4e4e7',
                          borderRadius: '6px', fontSize: '11px',
                          fontWeight: 600, cursor: 'pointer',
                          background: '#fff', color: '#09090b',
                          fontFamily: 'inherit',
                          opacity: loadingId === u.id ? 0.5 : 1,
                        }}
                      >
                        {loadingId === u.id ? '...' : (u.role === 'admin' ? 'Jadikan User' : 'Jadikan Admin')}
                      </button>
                      <button
                        onClick={() => deleteUser(u.id)}
                        disabled={loadingId === u.id}
                        style={{
                          padding: '6px 12px', border: '1px solid #fca5a5',
                          borderRadius: '6px', fontSize: '11px',
                          fontWeight: 600, cursor: 'pointer',
                          background: '#fee2e2', color: '#b91c1c',
                          fontFamily: 'inherit',
                          opacity: loadingId === u.id ? 0.5 : 1,
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '48px 24px', textAlign: 'center', color: '#a1a1aa' }}>
                  Belum ada pengguna.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
