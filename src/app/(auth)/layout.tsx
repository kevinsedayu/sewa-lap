import { createClient } from '@/lib/supabase/server'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-4 font-sans relative overflow-hidden">
      {/* Background glow effects for aesthetics */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Center container for Auth Form */}
      <div className="w-full max-w-md bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col">
        {children}
      </div>
    </div>
  )
}
