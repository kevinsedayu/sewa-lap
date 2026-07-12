'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/(auth)/actions'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MapPin,
  LogOut,
  Shield,
  Wallet,
  BookOpen,
  Settings,
  Menu,
  X,
} from 'lucide-react'

interface AdminSidebarProps {
  user: { email: string; name: string }
}

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/booking', label: 'Kelola Booking', icon: BookOpen },
  { href: '/admin/kalender', label: 'Kalender', icon: CalendarDays },
  { href: '/admin/info-lapangan', label: 'Info Lapangan', icon: Settings },
  { href: '/admin/lokasi', label: 'Lokasi Lapangan', icon: MapPin },
  { href: '/admin/users', label: 'Pengguna', icon: Users },
  { href: '/admin/keuangan', label: 'Laporan Keuangan', icon: Wallet },
]

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
  }

  return (
    <>
      {/* Hamburger Button — always visible top-left */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-900 text-white shadow-md hover:bg-zinc-700 transition-colors"
        aria-label="Buka menu"
      >
        <Menu size={20} />
      </button>

      {/* Overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 w-[260px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 min-h-[64px]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" />
              </svg>
            </div>
            <span className="text-sm font-bold text-zinc-900 tracking-tight">BumiMintarsih</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Admin Badge */}
        <div className="px-5 py-3 border-b border-zinc-200">
          <div className="inline-flex items-center gap-1.5 bg-zinc-100 rounded-md px-2 py-1">
            <Shield size={12} className="text-zinc-500" />
            <span className="text-[10px] font-bold text-zinc-600 tracking-wider">ADMIN</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 font-medium'
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User & Logout */}
        <div className="border-t border-zinc-200 px-3 py-4">
          <div className="px-3 pb-3 mb-2">
            <div className="text-sm font-bold text-zinc-900 truncate">{user.name}</div>
            <div className="text-xs text-zinc-500 truncate">{user.email}</div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            <LogOut size={18} className="shrink-0" />
            <span>{loggingOut ? 'Keluar...' : 'Keluar'}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
