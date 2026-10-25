'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  UserPlus,
  Mail,
  Phone,
  User,
  AtSign,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'

function SignupForm() {
  const router = useRouter()
  const supabase = createClient()

  // Step 1: Details -> Step 2: OTP Verification
  const [step, setStep] = useState<'details' | 'verify'>('details')

  const [form, setForm] = useState({
    username: '',
    displayName: '',
    mobileNumber: '',
    email: '',
  })

  const [otpCode, setOtpCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Resend Countdown Timer
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown(c => c - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  // Step 1: Send OTP for Signup
  const handleSendSignupOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const { username, displayName, mobileNumber, email } = form

    if (!username.trim() || !displayName.trim() || !mobileNumber.trim() || !email.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.trim())) {
      toast.error('Username must be 3–30 characters (letters, numbers, and underscores only)')
      return
    }

    // Basic mobile validation (at least 7 to 15 digits/characters)
    const cleanPhone = mobileNumber.replace(/[^0-9+]/g, '')
    if (cleanPhone.length < 8 || cleanPhone.length > 16) {
      toast.error('Please enter a valid mobile number (e.g. +91 9876543210)')
      return
    }

    setLoading(true)

    try {
      // 1. Check if username is already taken in profiles table
      try {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username.toLowerCase().trim())
          .maybeSingle()

        if (existingUser) {
          toast.error(`@${username.toLowerCase().trim()} is already taken. Try another username.`)
          setLoading(false)
          return
        }
      } catch {
        // If check fails due to network, continue to auth
      }

      // 2. Send OTP with user metadata (username, display_name, phone_number)
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          data: {
            username: username.toLowerCase().trim(),
            display_name: displayName.trim(),
            phone_number: mobileNumber.trim(),
          },
          shouldCreateUser: true,
        },
      })

      if (error) {
        toast.error(error.message)
        setLoading(false)
        return
      }

      setStep('verify')
      setCountdown(60)
      toast.success('Verification code sent to your email!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to send verification code')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP and finalize Profile Creation
  const handleVerifySignupOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanToken = otpCode.trim().replace(/\s+/g, '')

    if (!cleanToken || cleanToken.length < 6) {
      toast.error('Please enter the 6-digit verification code')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: form.email.trim(),
        token: cleanToken,
        type: 'email',
      })

      if (error) {
        toast.error(error.message || 'Invalid or expired verification code')
        setLoading(false)
        return
      }

      // Ensure profile contains mobile number and details
      if (data?.user) {
        await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            username: form.username.toLowerCase().trim(),
            display_name: form.displayName.trim(),
            phone_number: form.mobileNumber.trim(),
          })
      }

      toast.success('Welcome to Unspoken! Account created.')
      router.push('/onboarding')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Verification failed')
      setLoading(false)
    }
  }

  return (
    <div className="card p-6 sm:p-8 animate-fade-up max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-rose)] to-[var(--color-gold)] flex items-center justify-center text-white text-xl font-bold font-serif mx-auto mb-3 shadow-sm">
          U
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold">Join the Sanctuary</h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
          {step === 'details'
            ? 'Sign up with OTP verification and start sharing your words'
            : 'Enter the code sent to your email to activate your account'}
        </p>
      </div>

      {/* ================================================= */}
      {/* STEP 1: Enter User Details (Username, Phone, etc) */}
      {/* ================================================= */}
      {step === 'details' ? (
        <form onSubmit={handleSendSignupOtp} className="space-y-4 animate-fade-in" id="otp-signup-form">
          {/* Username & Display Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="signup-username" className="block text-xs sm:text-sm font-medium mb-1 flex items-center gap-1.5">
                <AtSign size={13} className="text-[var(--color-primary)]" />
                Username
              </label>
              <input
                id="signup-username"
                type="text"
                value={form.username}
                onChange={e => update('username', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                className="input-field text-sm"
                placeholder="poet_soul"
                autoComplete="username"
                required
                maxLength={30}
              />
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Letters, numbers, _</p>
            </div>

            <div>
              <label htmlFor="signup-name" className="block text-xs sm:text-sm font-medium mb-1 flex items-center gap-1.5">
                <User size={13} className="text-[var(--color-primary)]" />
                Display Name
              </label>
              <input
                id="signup-name"
                type="text"
                value={form.displayName}
                onChange={e => update('displayName', e.target.value)}
                className="input-field text-sm"
                placeholder="Maya Angelou"
                required
                maxLength={50}
              />
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">How your name appears</p>
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label htmlFor="signup-mobile" className="block text-xs sm:text-sm font-medium mb-1 flex items-center gap-1.5">
              <Phone size={13} className="text-[var(--color-primary)]" />
              Mobile Number
            </label>
            <input
              id="signup-mobile"
              type="tel"
              value={form.mobileNumber}
              onChange={e => update('mobileNumber', e.target.value)}
              className="input-field text-sm"
              placeholder="+91 98765 43210"
              autoComplete="tel"
              required
            />
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Used for account security & verification</p>
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="signup-email" className="block text-xs sm:text-sm font-medium mb-1 flex items-center gap-1.5">
              <Mail size={13} className="text-[var(--color-primary)]" />
              Email Address
            </label>
            <input
              id="signup-email"
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              className="input-field text-sm"
              placeholder="you@domain.com"
              autoComplete="email"
              required
            />
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
              <Sparkles size={11} className="text-[var(--color-gold)]" />
              Your 6-digit one-time sign up code will be sent here
            </p>
          </div>

          {/* Terms info */}
          <p className="text-[11px] text-[var(--text-muted)] text-center leading-relaxed pt-1">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-[var(--color-rose)] hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/community-guidelines" className="text-[var(--color-rose)] hover:underline">
              Community Guidelines
            </Link>.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
            id="send-signup-otp-btn"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <UserPlus size={17} />
                Send Verification Code
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>
      ) : (
        /* ================================================= */
        /* STEP 2: Verify 6-Digit OTP Code                   */
        /* ================================================= */
        <form onSubmit={handleVerifySignupOtp} className="space-y-5 animate-fade-in" id="verify-signup-form">
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Registering as:</span>
              <span className="font-semibold text-[var(--text-primary)]">@{form.username}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-muted)]">Mobile:</span>
              <span className="font-medium text-[var(--text-primary)]">{form.mobileNumber}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-[var(--border-color)]">
              <span className="text-[var(--text-muted)]">Code sent to:</span>
              <span className="font-medium text-[var(--color-primary)]">{form.email}</span>
            </div>
            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="text-[var(--color-rose)] hover:underline font-medium text-xs"
              >
                ← Edit Information
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium mb-2 text-center" htmlFor="signup-otp-code">
              Enter 6-Digit One-Time Code
            </label>
            <input
              id="signup-otp-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="input-field text-center font-mono text-3xl tracking-[0.4em] font-bold py-3"
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
            disabled={loading || otpCode.trim().length < 6}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            id="verify-signup-btn"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <ShieldCheck size={18} />
                Verify & Create Account
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
                onClick={handleSendSignupOtp}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs text-[var(--color-primary)] hover:underline font-medium"
              >
                <RotateCcw size={13} />
                Resend code to email
              </button>
            )}
          </div>
        </form>
      )}

      {/* Footer link to login */}
      <p className="text-center text-xs sm:text-sm text-[var(--text-muted)] mt-6 pt-4 border-t border-[var(--border-color)]">
        Already have an account?{' '}
        <Link href="/login" className="text-[var(--color-rose)] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="card p-8 min-h-[380px] flex items-center justify-center max-w-lg mx-auto">
          <div className="w-7 h-7 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  )
}
