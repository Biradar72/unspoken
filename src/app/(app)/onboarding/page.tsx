'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { Sparkles, Feather, ArrowRight, Heart, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const THEMES = [
  { id: 'love', label: 'Love & Romance', emoji: '❤️' },
  { id: 'heartbreak', label: 'Heartbreak & Longing', emoji: '💔' },
  { id: 'healing', label: 'Healing & Growth', emoji: '🌱' },
  { id: 'sadness', label: 'Melancholy & Sorrow', emoji: '🌧️' },
  { id: 'loneliness', label: 'Solitude & Quiet', emoji: '🌙' },
  { id: 'hope', label: 'Hope & Dawn', emoji: '✨' },
  { id: 'self_discovery', label: 'Identity & Truth', emoji: '🪞' },
  { id: 'life', label: 'Life & Mortality', emoji: '⏳' },
  { id: 'gratitude', label: 'Gratitude & Peace', emoji: '🕊️' },
  { id: 'anger', label: 'Anger & Rebellion', emoji: '🔥' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [penName, setPenName] = useState('')
  const [bio, setBio] = useState('')
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])

  useEffect(() => {
    if (!user) return
    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setDisplayName(data.display_name || '')
        setPenName(data.pen_name || '')
        setBio(data.bio || '')
        if (data.poetry_interests && Array.isArray(data.poetry_interests)) {
          setSelectedThemes(data.poetry_interests)
        }
      }
      setLoading(false)
    }
    loadProfile()
  }, [user, supabase])

  const toggleTheme = (id: string) => {
    setSelectedThemes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim() || 'Anonymous Poet',
          pen_name: penName.trim() || null,
          bio: bio.trim() || null,
          poetry_interests: selectedThemes,
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Welcome to Unspoken!')
      router.push('/feed')
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete profile')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mx-auto mb-4 border border-[var(--color-primary)]/20 shadow-sm">
          <Feather size={26} />
        </div>
        <h1 className="font-serif text-3xl font-bold mb-2">Welcome to Unspoken</h1>
        <p className="text-[var(--text-muted)] text-sm max-w-md mx-auto">
          Every word you leave here is a sanctuary. Set up your writing identity and choose the themes that speak to your heart.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Display Name
          </label>
          <input
            type="text"
            className="input-field"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Your name or public alias"
            maxLength={50}
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium">
              Pen Name / Pseudonym
            </label>
            <span className="text-xs text-[var(--text-muted)]">Optional</span>
          </div>
          <input
            type="text"
            className="input-field"
            value={penName}
            onChange={e => setPenName(e.target.value)}
            placeholder="e.g. The Midnight Raven, A Whispering Shade"
            maxLength={50}
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">
            A literary identity you can write under when you want quiet anonymity.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium">
              A line about your inner world (Bio)
            </label>
            <span className="text-xs text-[var(--text-muted)]">{bio.length}/160</span>
          </div>
          <textarea
            className="input-field min-h-[90px] resize-none"
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="I write what I cannot say out loud..."
            maxLength={160}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Themes you resonate with most
          </label>
          <p className="text-xs text-[var(--text-muted)] mb-3">
            Pick topics you enjoy reading or writing about to tailor your discovery feed.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
            {THEMES.map(theme => {
              const isSelected = selectedThemes.includes(theme.id)
              return (
                <button
                  type="button"
                  key={theme.id}
                  onClick={() => toggleTheme(theme.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-all text-left ${
                    isSelected
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm'
                      : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--color-primary)]/40'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{theme.emoji}</span>
                    <span className="font-medium text-xs sm:text-sm">{theme.label}</span>
                  </span>
                  {isSelected && <Check size={14} />}
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-4"
          id="finish-onboarding-btn"
        >
          {submitting ? 'Setting up your space...' : 'Step into the Sanctuary'}
          {!submitting && <ArrowRight size={16} />}
        </button>
      </form>
    </div>
  )
}
