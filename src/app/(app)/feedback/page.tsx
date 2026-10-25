'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import {
  Star,
  MessageSquareHeart,
  Send,
  Sparkles,
  CheckCircle2,
  Lightbulb,
  Palette,
  Feather,
  Bug,
  Heart,
  ArrowRight,
} from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { id: 'feature', label: 'Feature Suggestion', icon: Lightbulb, color: 'text-amber-500' },
  { id: 'design', label: 'Design & Aesthetics', icon: Palette, color: 'text-purple-500' },
  { id: 'writing', label: 'Writing Experience', icon: Feather, color: 'text-rose-500' },
  { id: 'bug', label: 'Bug or Issue', icon: Bug, color: 'text-emerald-500' },
  { id: 'praise', label: 'Words of Love', icon: Heart, color: 'text-pink-500' },
]

const RATING_LABELS = [
  '',
  'Needs Improvement 🌧️',
  'Fair Experience ☁️',
  'Good & Enjoyable 🌱',
  'Very Inspiring 🌅',
  'A Magical Sanctuary ✨',
]

export default function FeedbackPage() {
  const { user, profile } = useAuth()
  const supabase = createClient()

  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [category, setCategory] = useState<string>('feature')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      toast.error('Please share a few words in your feedback')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase.from('feedback').insert({
        user_id: user?.id || null,
        rating,
        category,
        message: message.trim(),
        email: email.trim() || null,
      })

      if (error) throw error

      setSubmitted(true)
      toast.success('Thank you for sharing your thoughts!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center animate-fade-up">
        <div className="card p-8 sm:p-12 space-y-5">
          <div className="w-16 h-16 rounded-full bg-[var(--color-sage)]/20 text-[var(--color-sage)] flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 size={36} />
          </div>
          <h1 className="font-serif text-3xl font-bold">Your Words Have Been Heard</h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-md mx-auto">
            Thank you for helping us nurture Unspoken. Every thought, critique, and suggestion helps us make this sanctuary warmer and more inspiring for poets everywhere.
          </p>

          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setSubmitted(false)
                setMessage('')
              }}
              className="btn-secondary text-sm"
            >
              Send Another Note
            </button>
            <Link href="/feed" className="btn-primary text-sm inline-flex items-center gap-2">
              Back to Feed
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-semibold mb-3 border border-[var(--color-primary)]/20 shadow-sm">
          <MessageSquareHeart size={14} />
          Shape the Sanctuary
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3">
          We&apos;re Listening
        </h1>
        <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
          How can we make Unspoken a better home for your emotions and poetry? Share your ideas, report bugs, or let us know how your experience feels.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-7 animate-fade-in">
        {/* Star Rating */}
        <div className="text-center pb-2">
          <label className="block text-xs sm:text-sm font-medium mb-3">
            How has your experience on Unspoken been?
          </label>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map(star => {
              const active = (hoverRating || rating) >= star
              return (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  aria-label={`${star} star`}
                >
                  <Star
                    size={28}
                    className={`transition-colors ${
                      active
                        ? 'text-[var(--color-gold)] fill-[var(--color-gold)]'
                        : 'text-zinc-300 dark:text-zinc-700'
                    }`}
                  />
                </button>
              )
            })}
          </div>
          <p className="text-xs font-medium text-[var(--color-gold)] mt-2 min-h-[18px]">
            {RATING_LABELS[hoverRating || rating]}
          </p>
        </div>

        {/* Category Picker */}
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-2.5">
            What is your feedback about?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon
              const isSelected = category === cat.id
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all text-left ${
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--text-primary)] shadow-sm'
                      : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-zinc-400'
                  }`}
                >
                  <Icon size={15} className={cat.color} />
                  <span className="truncate">{cat.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Feedback Message */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs sm:text-sm font-medium">Your Thoughts & Suggestions</label>
            <span className="text-xs text-[var(--text-muted)]">{message.length}/1000</span>
          </div>
          <textarea
            className="input-field min-h-[130px] resize-none text-sm leading-relaxed"
            placeholder="Tell us what you loved, what felt confusing, or a feature you'd love to see in the studio..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            maxLength={1000}
            required
          />
        </div>

        {/* Contact Email (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs sm:text-sm font-medium">Email Address (Optional)</label>
            <span className="text-xs text-[var(--text-muted)]">If you&apos;d like a response</span>
          </div>
          <input
            type="email"
            className="input-field text-sm"
            placeholder="you@domain.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !message.trim()}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm"
          id="submit-feedback-btn"
        >
          {submitting ? (
            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            <>
              <Send size={16} />
              Submit Feedback
            </>
          )}
        </button>
      </form>
    </div>
  )
}
