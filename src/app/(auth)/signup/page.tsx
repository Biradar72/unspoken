'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, UserPlus, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'One number', ok: /\d/.test(password) },
  ]
  if (!password) return null
  return (
    <div className="mt-2 space-y-1">
      {checks.map(({ label, ok }) => (
        <div key={label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-[var(--color-sage)]' : 'text-[var(--text-muted)]'}`}>
          {ok ? <Check size={12} /> : <X size={12} />}
          {label}
        </div>
      ))}
    </div>
  )
}

export default function SignupPage() {
  const [form, setForm] = useState({
    username: '',
    displayName: '',
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const { username, displayName, email, password } = form

    if (!username || !displayName || !email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      toast.error('Username: 3–30 chars, letters, numbers, underscores only')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')) {
        toast.error('Supabase is not configured yet! Please update .env.local with your Supabase credentials.')
        setLoading(false)
        return
      }

      // Check username availability
      try {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username.toLowerCase())
          .maybeSingle()

        if (existing) {
          toast.error('That username is already taken')
          setLoading(false)
          return
        }
      } catch {
        // Continue if profile check has network issue
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.toLowerCase(),
            display_name: displayName,
          },
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      })

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }

      if (data?.session) {
        toast.success('Welcome to Unspoken!')
        router.push('/onboarding')
        router.refresh()
      } else {
        setSuccess(true)
      }
    } catch (err: any) {
      toast.error(err.message || 'Unable to connect to database')
      setLoading(false)
    }
  }

  const isConfigured = !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

  if (success) {
    return (
      <div className="card p-8 text-center animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-[var(--color-sage)]/20 flex items-center justify-center mx-auto mb-4">
          <Check size={28} className="text-[var(--color-sage)]" />
        </div>
        <h2 className="font-serif text-2xl font-bold mb-2">Check your email</h2>
        <p className="text-[var(--text-muted)] mb-6">
          We sent a verification link to <strong>{form.email}</strong>.
          Click it to activate your account.
        </p>
        <Link href="/login" className="btn btn-primary w-full" id="go-to-login-after-signup">
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="card p-8 animate-fade-up">
      {!isConfigured && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs leading-relaxed">
          <strong>Database setup needed:</strong> Your <code className="font-mono bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">.env.local</code> currently has placeholder Supabase credentials. Paste your Supabase Project URL and Anon Key into <code className="font-mono bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded">.env.local</code> to activate live sign up.
        </div>
      )}

      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-rose)] to-[var(--color-gold)] flex items-center justify-center text-white text-xl font-bold font-serif mx-auto mb-4">
          U
        </div>
        <h1 className="font-serif text-2xl font-bold">Start writing today</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Join thousands of poets on Unspoken</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4" id="signup-form">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="signup-username" className="label">Username</label>
            <input
              id="signup-username"
              type="text"
              value={form.username}
              onChange={e => update('username', e.target.value)}
              className="input"
              placeholder="poetname"
              autoComplete="username"
              required
              maxLength={30}
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">Letters, numbers, _</p>
          </div>
          <div>
            <label htmlFor="signup-display-name" className="label">Display name</label>
            <input
              id="signup-display-name"
              type="text"
              value={form.displayName}
              onChange={e => update('displayName', e.target.value)}
              className="input"
              placeholder="Your name"
              autoComplete="name"
              required
              maxLength={60}
            />
          </div>
        </div>

        <div>
          <label htmlFor="signup-email" className="label">Email address</label>
          <input
            id="signup-email"
            type="email"
            value={form.email}
            onChange={e => update('email', e.target.value)}
            className="input"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label htmlFor="signup-password" className="label">Password</label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={e => update('password', e.target.value)}
              className="input pr-12"
              placeholder="Create a password"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <PasswordStrength password={form.password} />
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-[var(--color-rose)] hover:underline">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-[var(--color-rose)] hover:underline">Privacy Policy</Link>.
        </p>

        <button
          type="submit"
          id="signup-submit"
          className="btn btn-rose w-full"
          disabled={loading}
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus size={16} />
              Create account
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-[var(--text-muted)]">
        Already have an account?{' '}
        <Link href="/login" className="text-[var(--color-rose)] font-medium hover:underline" id="go-to-login">
          Sign in
        </Link>
      </div>
    </div>
  )
}
