import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  let role = profile?.role || 'user'
  if (user.email === 'admin@sewa.com') {
    role = 'admin'
  }

  if (role !== 'admin') redirect('/user/dashboard')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafafa', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <AdminSidebar user={{ email: user.email!, name: profile?.full_name || 'Admin' }} />
      <main style={{ flex: 1, marginLeft: 0, minWidth: 0 }}>
        {children}
      </main>
    </div>
  )
}
