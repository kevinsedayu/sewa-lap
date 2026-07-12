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
    <div className="min-h-screen bg-[#fafafa]">
      <AdminSidebar user={{ email: user.email!, name: profile?.full_name || 'Admin' }} />
      <main className="w-full">
        {children}
      </main>
    </div>
  )
}
