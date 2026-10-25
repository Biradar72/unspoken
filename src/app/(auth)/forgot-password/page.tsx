'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, ArrowLeft, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { toast.error('Please enter your email'); return }
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="card p-8 text-center animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-[var(--color-sage)]/20 flex items-center justify-center mx-auto mb-4">
          <Check size={28} className="text-[var(--color-sage)]" />
        </div>
        <h2 className="font-serif text-2xl font-bold mb-2">Reset link sent</h2>
        <p className="text-[var(--text-muted)] mb-6">
          Check <strong>{email}</strong> for a password reset link.
        </p>
        <Link href="/login" className="btn btn-secondary w-full">
          <ArrowLeft size={16} /> Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="card p-8 animate-fade-up">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-full bg-[var(--color-gold)]/20 flex items-center justify-center mx-auto mb-4">
          <Mail size={24} className="text-[var(--color-gold)]" />
        </div>
        <h1 className="font-serif text-2xl font-bold">Reset your password</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          We&apos;ll email you a link to reset it.
        </p>
      </div>

      <form onSubmit={handleReset} className="space-y-5" id="forgot-password-form">
        <div>
          <label htmlFor="reset-email" className="label">Email address</label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
            required
          />
        </div>

        <button
          type="submit"
          id="reset-submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center gap-1">
          <ArrowLeft size={14} /> Back to login
        </Link>
      </div>
    </div>
  )
}
