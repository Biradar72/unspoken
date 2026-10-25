import Link from 'next/link'
import { Heart } from 'lucide-react'

export function Footer() {
  const year = new Date().getFullYear()

  const links = [
    { label: 'About', href: '/about' },
    { label: 'Community Guidelines', href: '/community-guidelines' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)] mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo + tagline */}
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-rose)] to-[var(--color-gold)] flex items-center justify-center text-white text-xs font-bold font-serif">
                U
              </div>
              <span className="font-serif text-lg font-semibold text-gradient">Unspoken</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] italic">
              For everything you couldn&apos;t say out loud.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {links.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-muted)]">
            &copy; {year} Unspoken. All rights reserved.
          </p>
          <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
            Made with <Heart size={12} className="text-[var(--color-rose)] fill-current" /> for writers everywhere.
          </p>
        </div>
      </div>
    </footer>
  )
}
