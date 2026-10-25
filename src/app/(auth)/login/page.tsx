'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Eye,
  EyeOff,
  LogIn,
  KeyRound,
  Mail,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'

type LoginMethod = 'password' | 'otp'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/feed'
  const supabase = createClient()

  // Active Method: 'password' or 'otp'
  const [method, setMethod] = useState<LoginMethod>('password')

  // Password Login State
  const [passwordEmail, setPasswordEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  // OTP Login State
  const [otpEmail, setOtpEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Resend Countdown Timer
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown(c => c - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  // 1. Password Login Handler
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordEmail.trim() || !password) {
      toast.error('Please enter both your email and password')
      return
    }

    setPasswordLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: passwordEmail.trim(),
        password,
      })

      if (error) {
        toast.error(error.message)
        setPasswordLoading(false)
        return
      }

      toast.success('Welcome back!')
      router.push(redirectTo)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
      setPasswordLoading(false)
    }
  }

  // 2. Request OTP Code Handler
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otpEmail.trim()) {
      toast.error('Please enter your email address')
      return
    }

    setOtpLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: otpEmail.trim(),
        options: {
          shouldCreateUser: true, // allows existing and new poets
        },
      })

      if (error) {
        toast.error(error.message)
        setOtpLoading(false)
        return
      }

      setOtpSent(true)
      setCountdown(60) // 60s cooldown for resend
      toast.success('One-time code sent to your email!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to send verification code')
    } finally {
      setOtpLoading(false)
    }
  }

  // 3. Verify OTP Code Handler
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanToken = otpCode.trim().replace(/\s+/g, '')

    if (!cleanToken) {
      toast.error('Please enter the 6-digit code')
      return
    }

    setOtpLoading(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: otpEmail.trim(),
        token: cleanToken,
        type: 'email',
      })

      if (error) {
        toast.error(error.message || 'Invalid or expired code')
        setOtpLoading(false)
        return
      }

      toast.success('Successfully authenticated!')
      router.push(redirectTo)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Verification failed')
      setOtpLoading(false)
    }
  }

  return (
    <div className="card p-6 sm:p-8 animate-fade-up max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-rose)] to-[var(--color-gold)] flex items-center justify-center text-white text-xl font-bold font-serif mx-auto mb-3 shadow-sm">
          U
        </div>
        <h1 className="font-serif text-2xl font-bold">Welcome back</h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
          Choose your preferred way to enter the sanctuary
        </p>
      </div>

      {/* Method Tabs (Password vs OTP) */}
      <div className="grid grid-cols-2 p-1 bg-[var(--bg-secondary)] rounded-xl mb-6 border border-[var(--border-color)] text-xs sm:text-sm font-medium">
        <button
          type="button"
          onClick={() => setMethod('password')}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
            method === 'password'
              ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
          id="tab-password-login"
        >
          <KeyRound size={15} />
          <span>Password</span>
        </button>

        <button
          type="button"
          onClick={() => setMethod('otp')}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
            method === 'otp'
              ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
          id="tab-otp-login"
        >
          <Mail size={15} />
          <span>Email OTP</span>
        </button>
      </div>

      {/* ========================================= */}
      {/* 1. PASSWORD BASED LOGIN                   */}
      {/* ========================================= */}
      {method === 'password' && (
        <form onSubmit={handlePasswordLogin} className="space-y-4 animate-fade-in">
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1.5" htmlFor="pwd-email">
              Email Address
            </label>
            <input
              id="pwd-email"
              type="email"
              className="input-field"
              value={passwordEmail}
              onChange={e => setPasswordEmail(e.target.value)}
              placeholder="you@domain.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-medium" htmlFor="pwd-pass">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[var(--color-rose)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="pwd-pass"
                type={showPassword ? 'text' : 'password'}
                className="input-field pr-10"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-4"
            id="password-login-submit"
          >
            {passwordLoading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <LogIn size={18} />
                Sign in with Password
              </>
            )}
          </button>
        </form>
      )}

      {/* ========================================= */}
      {/* 2. OTP BASED LOGIN (EMAIL 6-DIGIT CODE)   */}
      {/* ========================================= */}
      {method === 'otp' && (
        <div className="space-y-4 animate-fade-in">
          {!otpSent ? (
            // Step 2A: Enter Email to Send Code
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5" htmlFor="otp-email">
                  Email Address
                </label>
                <input
                  id="otp-email"
                  type="email"
                  className="input-field"
                  value={otpEmail}
                  onChange={e => setOtpEmail(e.target.value)}
                  placeholder="you@domain.com"
                  required
                  autoComplete="email"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1.5 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-[var(--color-gold)] flex-shrink-0" />
                  We&apos;ll send a secure 6-digit one-time code to your inbox.
                </p>
              </div>

              <button
                type="submit"
                disabled={otpLoading || !otpEmail.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
                id="send-otp-btn"
              >
                {otpLoading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <Mail size={17} />
                    Send One-Time Code
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          ) : (
            // Step 2B: Enter 6-Digit OTP Code
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)] truncate max-w-[200px]">
                  Sent to <strong className="text-[var(--text-primary)]">{otpEmail}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false)
                    setOtpCode('')
                  }}
                  className="text-[var(--color-rose)] hover:underline font-medium"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1.5" htmlFor="otp-code">
                  6-Digit Verification Code
                </label>
                <input
                  id="otp-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="input-field text-center font-mono text-2xl tracking-[0.4em] font-semibold"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
                  placeholder="123456"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={otpLoading || otpCode.trim().length < 6}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                id="verify-otp-btn"
              >
                {otpLoading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Verify & Sign in
                  </>
                )}
              </button>

              {/* Resend Action */}
              <div className="text-center pt-2">
                {countdown > 0 ? (
                  <span className="text-xs text-[var(--text-muted)]">
                    Resend code in <strong className="text-[var(--text-primary)]">{countdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading}
                    className="inline-flex items-center gap-1.5 text-xs text-[var(--color-primary)] hover:underline font-medium"
                  >
                    <RotateCcw size={12} />
                    Resend code to email
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}

      {/* Footer link to sign up */}
      <p className="text-center text-xs sm:text-sm text-[var(--text-muted)] mt-6 pt-4 border-t border-[var(--border-color)]">
        Don&apos;t have an account yet?{' '}
        <Link href="/signup" className="text-[var(--color-rose)] font-medium hover:underline">
          Create one now
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="card p-8 min-h-[340px] flex items-center justify-center">
          <div className="w-7 h-7 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
