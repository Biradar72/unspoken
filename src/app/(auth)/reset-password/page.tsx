'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Lock, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (password !== confirm) { toast.error('Passwords do not match'); return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('Password updated!')
      router.push('/feed')
    }
  }

  return (
    <div className="card p-8 animate-fade-up">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-full bg-[var(--color-sage)]/20 flex items-center justify-center mx-auto mb-4">
          <Lock size={24} className="text-[var(--color-sage)]" />
        </div>
        <h1 className="font-serif text-2xl font-bold">Set new password</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleReset} className="space-y-4" id="reset-password-form">
        <div>
          <label htmlFor="new-password" className="label">New password</label>
          <div className="relative">
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input pr-12"
              placeholder="New password (min. 8 characters)"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirm-password" className="label">Confirm password</label>
          <input
            id="confirm-password"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="input"
            placeholder="Repeat your new password"
            required
          />
          {confirm && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${confirm === password ? 'text-[var(--color-sage)]' : 'text-red-400'}`}>
              <Check size={12} />
              {confirm === password ? 'Passwords match' : 'Passwords do not match'}
            </p>
          )}
        </div>

        <button
          type="submit"
          id="reset-password-submit"
          className="btn btn-primary w-full mt-2"
          disabled={loading}
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Update password'
          )}
        </button>
      </form>
    </div>
  )
}
