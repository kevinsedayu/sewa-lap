import { createClient } from '@/lib/supabase/server'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 p-4 font-sans">
      {/* Center container for Auth Form */}
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-8 pt-8 pb-6 border-b border-zinc-100">
          <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          <div>
            <div className="text-sm font-bold text-zinc-900 leading-tight">Gelora Bumi Mintarsih</div>
            <div className="text-xs text-zinc-400">Sistem Booking Lapangan</div>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
