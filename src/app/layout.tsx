import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://unspoken.vercel.app'),
  title: {
    default: 'Unspoken — For everything you couldn\'t say out loud',
    template: '%s | Unspoken',
  },
  description:
    'Unspoken is a social poetry platform where you can write poems, express your emotions, share your experiences, discover other writers, and connect through words.',
  keywords: [
    'poetry',
    'poems',
    'creative writing',
    'emotional expression',
    'writing platform',
    'poetry community',
    'writers',
    'literature',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://unspoken.vercel.app',
    siteName: 'Unspoken',
    title: 'Unspoken — For everything you couldn\'t say out loud',
    description:
      'A social poetry platform where feelings become words, and words become connection.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Unspoken — Poetry Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unspoken — For everything you couldn\'t say out loud',
    description: 'A social poetry platform where feelings become words.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.875rem',
                  boxShadow: 'var(--shadow-md)',
                },
                success: {
                  iconTheme: { primary: '#A8B5A0', secondary: 'white' },
                },
                error: {
                  iconTheme: { primary: '#C58F98', secondary: 'white' },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
