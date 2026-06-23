import { createClient } from '@/lib/supabase/server'
import ProfileForm from '@/components/user/ProfileForm'

export default async function UserProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Harap login terlebih dahulu.</div>
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="page-content" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#09090b', letterSpacing: '-0.025em', margin: '0 0 8px' }}>
          Profil Saya
        </h1>
        <p style={{ fontSize: '14px', color: '#71717a', margin: 0 }}>
          Kelola informasi pribadi dan data kontak Anda.
        </p>
      </div>

      <ProfileForm 
        initialProfile={profile || { id: user.id, full_name: '', phone: '' }} 
        email={user.email || ''} 
      />
    </div>
  )
}
