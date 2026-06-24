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
  ChevronLeft,
  ChevronRight,
  Shield,
  Wallet,
  BookOpen,
} from 'lucide-react'

interface AdminSidebarProps {
  user: { email: string; name: string }
}

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/booking', label: 'Kelola Booking', icon: BookOpen },
  { href: '/admin/kalender', label: 'Kalender', icon: CalendarDays },
  { href: '/admin/lokasi', label: 'Lokasi Lapangan', icon: MapPin },
  { href: '/admin/users', label: 'Pengguna', icon: Users },
  { href: '/admin/keuangan', label: 'Laporan Keuangan', icon: Wallet },
]

const bottomNavItems = [
  { href: '/admin/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/admin/booking', label: 'Booking', icon: BookOpen },
  { href: '/admin/kalender', label: 'Kalender', icon: CalendarDays },
  { href: '/admin/lokasi', label: 'Lokasi', icon: MapPin },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/keuangan', label: 'Keuangan', icon: Wallet },
]

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar-desktop" style={{
        width: collapsed ? '64px' : '220px',
        minHeight: '100vh',
        background: '#ffffff',
        borderRight: '1px solid #e4e4e7',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Brand */}
        <div style={{
          padding: collapsed ? '20px 0' : '20px 18px',
          borderBottom: '1px solid #e4e4e7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: '64px',
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', overflow: 'hidden' }}>
              <div style={{
                width: '30px', height: '30px', background: '#09090b',
                borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fafafa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" />
                </svg>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#09090b', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                BumiMintarsih
              </span>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: '30px', height: '30px', background: '#09090b',
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fafafa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" />
              </svg>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'none', border: '1px solid #e4e4e7', borderRadius: '6px',
              width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#a1a1aa', flexShrink: 0,
              marginLeft: collapsed ? '0' : '4px',
            }}
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        {/* Admin Badge */}
        {!collapsed && (
          <div style={{ padding: '10px 18px', borderBottom: '1px solid #e4e4e7' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              background: '#f4f4f5', borderRadius: '5px', padding: '3px 8px',
            }}>
              <Shield size={11} color="#52525b" />
              <span style={{ fontSize: '11px', color: '#52525b', fontWeight: 600, letterSpacing: '0.04em' }}>ADMIN</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: collapsed ? '12px 0' : '12px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: collapsed ? '10px 0' : '9px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: active ? 600 : 400,
                color: active ? '#09090b' : '#71717a',
                background: active ? '#f4f4f5' : 'transparent',
                transition: 'background 0.12s, color 0.12s',
                whiteSpace: 'nowrap',
              }}
                title={collapsed ? label : undefined}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User & Logout */}
        <div style={{ borderTop: '1px solid #e4e4e7', padding: collapsed ? '12px 0' : '12px 10px' }}>
          {!collapsed && (
            <div style={{ padding: '8px 10px', marginBottom: '4px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#09090b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '11px', color: '#a1a1aa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title={collapsed ? 'Keluar' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              width: '100%', padding: collapsed ? '10px 0' : '9px 10px',
              background: 'none', border: 'none', borderRadius: '8px',
              fontSize: '13px', color: '#ef4444', cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 500,
              transition: 'background 0.12s',
              opacity: loggingOut ? 0.5 : 1,
            }}
          >
            <LogOut size={15} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{loggingOut ? 'Keluar...' : 'Keluar'}</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        {bottomNavItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} className={`bottom-nav-item${active ? ' active' : ''}`}>
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          )
        })}
        <button
          className="bottom-nav-item"
          onClick={handleLogout}
          disabled={loggingOut}
          style={{ color: '#ef4444' }}
        >
          <LogOut size={20} />
          <span>{loggingOut ? '...' : 'Keluar'}</span>
        </button>
      </nav>
    </>
  )
}
