'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Login gagal. Coba lagi.' }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError && profileError.code !== 'PGRST116') {
    return { error: 'Database error: ' + profileError.message }
  }

  revalidatePath('/', 'layout')

  let role = profile?.role || 'user'
  if (user.email === 'admin@sewa.com') {
    role = 'admin'
  }
  
  if (role === 'admin') {
    redirect('/admin/dashboard')
  } else {
    redirect('/user/dashboard')
  }
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const phone = formData.get('phone') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: fullName,
      phone,
      role: 'user',
    })
  }

  revalidatePath('/', 'layout')
  redirect('/user/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string

  // Deteksi URL (Gunakan Vercel URL jika ada, jika tidak gunakan localhost)
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'http://localhost:3000'
  // VERCEL_URL biasanya tidak mengandung https://, jadi kita tambahkan jika perlu
  if (siteUrl && !siteUrl.startsWith('http')) {
    siteUrl = `https://${siteUrl}`
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/update-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Tautan reset password telah dikirim ke email Anda. Silakan periksa inbox atau folder spam.' }
}
