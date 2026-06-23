import { createClient } from '@/lib/supabase/server'
import UsersTable from '@/components/admin/UsersTable'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const adminCount = users?.filter(u => u.role === 'admin').length ?? 0
  const userCount = users?.filter(u => u.role === 'user').length ?? 0

  return (
    <div className="page-content" style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#09090b', letterSpacing: '-0.025em', margin: '0 0 4px' }}>
          Kelola Pengguna
        </h1>
        <p style={{ fontSize: '13px', color: '#71717a', margin: 0 }}>
          Kelola hak akses dan lihat daftar pengguna terdaftar
        </p>
      </div>

      {/* Summary cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '28px',
      }}>
        {[
          { label: 'Total Admin', value: adminCount, color: '#16a34a' },
          { label: 'Total User', value: userCount, color: '#09090b' },
          { label: 'Total Semua', value: adminCount + userCount, color: '#6366f1' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#ffffff',
            border: '1px solid #e4e4e7',
            borderRadius: '10px',
            padding: '16px 20px',
            borderTop: `3px solid ${s.color}`,
          }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#09090b', letterSpacing: '-0.03em' }}>
              {s.value}
            </div>
            <div style={{ fontSize: '12px', color: '#71717a', marginTop: '2px', fontWeight: 500 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <UsersTable initialUsers={users || []} currentUserId={user?.id || ''} />
    </div>
  )
}
