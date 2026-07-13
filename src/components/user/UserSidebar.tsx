'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/(auth)/actions'
import {
  LayoutDashboard,
  CalendarDays,
  History,
  User,
  MapPin,
  LogOut,
  Wallet,
  Menu,
  X,
} from 'lucide-react'

interface UserSidebarProps {
  user: { email: string; name: string }
}

const navItems = [
  { href: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/user/booking', label: 'Booking', icon: CalendarDays },
  { href: '/user/kalender', label: 'Kalender', icon: CalendarDays },
  { href: '/user/lokasi', label: 'Lokasi', icon: MapPin },
  { href: '/user/riwayat', label: 'Riwayat', icon: History },
  { href: '/user/keuangan', label: 'Keuangan', icon: Wallet },
  { href: '/user/profil', label: 'Profil', icon: User },
]

export default function UserSidebar({ user }: UserSidebarProps) {
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
            <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full object-cover bg-white shrink-0 shadow-sm" />
            <span className="text-sm font-bold text-zinc-900 tracking-tight">BumiMintarsih</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <X size={16} />
          </button>
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
