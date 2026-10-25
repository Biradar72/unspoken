'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useTheme } from '@/components/providers/ThemeProvider'
import { AvatarDisplay } from '@/components/ui/AvatarDisplay'
import {
  Home, Compass, PenSquare, Bell, BookOpen, Moon, Sun,
  LogIn, UserPlus, X, Menu, Search, Sparkles, ShieldAlert
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface NavbarProps {
  unreadCount?: number
}

export function Navbar({ unreadCount = 0 }: NavbarProps) {
  const { user, profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [notifications, setNotifications] = useState(unreadCount)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Subscribe to notification count
  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    const channel = supabase
      .channel('notification-count')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => setNotifications(prev => prev + 1))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user])

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/')

  const navItems = user
    ? [
        { href: '/feed', label: 'Feed', icon: Home },
        { href: '/explore', label: 'Explore', icon: Compass },
        { href: '/prompts', label: 'Prompts', icon: Sparkles },
        { href: '/write', label: 'Write', icon: PenSquare },
        { href: '/notifications', label: 'Notifications', icon: Bell, badge: notifications },
        { href: '/bookmarks', label: 'Bookmarks', icon: BookOpen },
        ...(profile?.is_admin ? [{ href: '/admin', label: 'Admin', icon: ShieldAlert }] : []),
      ]
    : [
        { href: '/', label: 'Home', icon: Home },
        { href: '/explore', label: 'Explore', icon: Compass },
        { href: '/prompts', label: 'Prompts', icon: Sparkles },
      ]

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass shadow-md' : 'bg-transparent'
        }`}
      >
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href={user ? '/feed' : '/'} className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-gold-400 flex items-center justify-center text-white font-bold text-sm font-serif">
              U
            </div>
            <span className="font-serif text-xl font-semibold text-gradient hidden sm:block">
              Unspoken
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon, badge }) => (
              <Link
                key={href}
                href={href}
                className={`nav-link relative ${isActive(href) ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{label}</span>
                {badge != null && badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-DEFAULT text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-ghost p-2 rounded-full"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              id="theme-toggle"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {user ? (
              <>
                <Link
                  href={`/profile/${profile?.username}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                  id="profile-nav-link"
                >
                  <AvatarDisplay
                    src={profile?.avatar_url}
                    name={profile?.display_name || 'U'}
                    size="sm"
                  />
                </Link>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="btn btn-secondary btn-sm" id="nav-login">
                  <LogIn size={16} />
                  Login
                </Link>
                <Link href="/signup" className="btn btn-rose btn-sm" id="nav-signup">
                  <UserPlus size={16} />
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="btn btn-ghost p-2 md:hidden"
              aria-label="Toggle menu"
              id="mobile-menu-toggle"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute right-0 top-0 h-full w-72 bg-[var(--bg-secondary)] shadow-xl p-6 animate-slide-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="font-serif text-xl font-semibold text-gradient">Unspoken</span>
              <button onClick={() => setMobileOpen(false)} className="btn btn-ghost p-1">
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map(({ href, label, icon: Icon, badge }) => (
                <Link
                  key={href}
                  href={href}
                  className={`nav-link w-full justify-start ${isActive(href) ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                  {badge != null && badge > 0 && (
                    <span className="ml-auto bg-rose-DEFAULT text-white text-xs px-1.5 rounded-full">
                      {badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            <div className="absolute bottom-6 left-6 right-6">
              {user ? (
                <div className="space-y-3">
                  <Link
                    href={`/profile/${profile?.username}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    <AvatarDisplay src={profile?.avatar_url} name={profile?.display_name || 'U'} size="sm" />
                    <div>
                      <p className="font-medium text-sm">{profile?.display_name}</p>
                      <p className="text-xs text-[var(--text-muted)]">@{profile?.username}</p>
                    </div>
                  </Link>
                  <button
                    onClick={async () => { await signOut(); setMobileOpen(false) }}
                    className="btn btn-secondary w-full"
                    id="mobile-sign-out"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/login" className="btn btn-secondary w-full" onClick={() => setMobileOpen(false)}>
                    <LogIn size={16} /> Login
                  </Link>
                  <Link href="/signup" className="btn btn-rose w-full" onClick={() => setMobileOpen(false)}>
                    <UserPlus size={16} /> Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
