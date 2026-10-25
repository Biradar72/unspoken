'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { MoodBadge, MOODS } from '@/components/ui/MoodBadge'
import {
  PenLine, Eye, EyeOff, Lock, Save, Globe, Link2, ChevronDown,
  X, Plus, Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { MoodType, VisibilityType } from '@/types/database'
import { redirect } from 'next/navigation'

const VISIBILITY_OPTIONS: { value: VisibilityType; label: string; desc: string; icon: React.ReactNode }[] = [
  { value: 'private', label: 'Private', desc: 'Only you can see this', icon: <Lock size={15} /> },
  { value: 'unlisted', label: 'Unlisted', desc: 'Anyone with the link', icon: <Link2 size={15} /> },
  { value: 'public', label: 'Public', desc: 'Visible to everyone', icon: <Globe size={15} /> },
]

function WriteContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const promptId = searchParams.get('prompt') || searchParams.get('promptId')
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [mood, setMood] = useState<MoodType | null>(null)
  const [visibility, setVisibility] = useState<VisibilityType>('private')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [poemId, setPoemId] = useState<string | null>(editId)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [preview, setPreview] = useState(false)
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false)
  const [promptText, setPromptText] = useState<string | null>(null)

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length
  const charCount = body.length

  // Load poem for editing
  useEffect(() => {
    if (!editId || !user) return
    const load = async () => {
      const { data } = await supabase
        .from('poems')
        .select('*, poem_tags(tag)')
        .eq('id', editId)
        .eq('author_id', user.id)
        .single()
      if (data) {
        setTitle(data.title)
        setBody(data.body)
        setMood(data.mood)
        setVisibility(data.visibility)
        setTags((data.poem_tags || []).map((t: any) => t.tag))
        setPoemId(data.id)
      }
    }
    load()
  }, [editId, user])

  // Load prompt if responding
  useEffect(() => {
    if (!promptId) return
    const load = async () => {
      const { data } = await supabase.from('writing_prompts').select('body').eq('id', promptId).single()
      if (data) setPromptText(data.body)
    }
    load()
  }, [promptId])

  const addTag = () => {
    const cleaned = tagInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
    if (cleaned && !tags.includes(cleaned) && tags.length < 5) {
      setTags(prev => [...prev, cleaned])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag))

  const saveDraft = useCallback(async (status: 'draft' | 'published' = 'draft', vis?: VisibilityType) => {
    if (!user) { toast.error('Sign in to save'); return }
    if (!title.trim()) { toast.error('Please add a title'); return }
    if (!body.trim()) { toast.error('Please write something'); return }

    const finalVisibility = vis || visibility
    const isPublishing = status === 'published'
    if (isPublishing) setPublishing(true)
    else setSaving(true)

    const poemData = {
      title: title.trim(),
      body: body.trim(),
      mood,
      visibility: finalVisibility,
      status,
      prompt_id: promptId || null,
      author_id: user.id,
      published_at: isPublishing ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    }

    let id = poemId

    if (id) {
      await supabase.from('poems').update(poemData).eq('id', id).eq('author_id', user.id)
    } else {
      const { data, error } = await supabase.from('poems').insert(poemData).select('id').single()
      if (error) {
        toast.error(error.message)
        setSaving(false)
        setPublishing(false)
        return
      }
      id = data!.id
      setPoemId(id)
    }

    // Sync tags
    await supabase.from('poem_tags').delete().eq('poem_id', id!)
    if (tags.length > 0) {
      await supabase.from('poem_tags').insert(tags.map(tag => ({ poem_id: id!, tag })))
    }

    setLastSaved(new Date())

    if (isPublishing) {
      toast.success('Poem published! ✨')
      router.push(`/poem/${id}`)
    } else {
      toast.success('Draft saved')
    }

    setSaving(false)
    setPublishing(false)
  }, [user, title, body, mood, visibility, tags, poemId, promptId, supabase, router])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!title || !body || !poemId) return
    const interval = setInterval(() => {
      saveDraft('draft')
    }, 30000)
    return () => clearInterval(interval)
  }, [title, body, poemId, saveDraft])

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <PenLine size={40} className="mx-auto mb-4 text-[var(--color-rose)] opacity-60" />
        <h2 className="font-serif text-2xl font-bold mb-2">Sign in to write</h2>
        <p className="text-[var(--text-muted)] mb-6">Your words are waiting.</p>
        <a href="/login?redirectTo=/write" className="btn btn-primary">Sign in</a>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold">
            {editId ? 'Edit poem' : 'Write a poem'}
          </h1>
          {lastSaved && (
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Saved {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className={`btn btn-secondary btn-sm ${preview ? 'border-[var(--color-rose)] text-[var(--color-rose)]' : ''}`}
            id="preview-toggle"
          >
            {preview ? <EyeOff size={15} /> : <Eye size={15} />}
            {preview ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      {/* Prompt Context */}
      {promptText && (
        <div className="card p-4 mb-6 border-l-4 border-[var(--color-gold)] bg-[var(--color-gold)]/5">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-[var(--color-gold)]" />
            <span className="text-xs font-semibold text-[var(--color-gold)]">Responding to prompt</span>
          </div>
          <p className="font-serif italic text-sm">&ldquo;{promptText}&rdquo;</p>
        </div>
      )}

      {preview ? (
        /* Preview Mode */
        <div className="card p-8 mb-6 animate-fade-in">
          <h2 className="font-serif text-3xl font-bold mb-6">
            {title || <span className="text-[var(--text-muted)]">Untitled</span>}
          </h2>
          <div className="poem-body whitespace-pre-line leading-relaxed">
            {body || <span className="text-[var(--text-muted)] italic">Your poem will appear here...</span>}
          </div>
          {(mood || tags.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-[var(--border-color)]">
              {mood && <MoodBadge mood={mood} />}
              {tags.map(tag => (
                <span key={tag} className="tag-pill">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="poem-title" className="label">Poem title</label>
            <input
              id="poem-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="input font-serif text-lg"
              placeholder="Give your poem a name..."
              maxLength={120}
            />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="poem-body" className="label mb-0">Your poem</label>
              <span className="text-xs text-[var(--text-muted)]">
                {wordCount} words · {charCount} chars
              </span>
            </div>
            <textarea
              id="poem-body"
              value={body}
              onChange={e => setBody(e.target.value)}
              className="textarea"
              placeholder="Start writing... Let the words find their shape."
              style={{ minHeight: '350px' }}
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Line breaks are preserved exactly as you type them.
            </p>
          </div>
        </div>
      )}

      {/* Mood Selection */}
      <div className="card p-5 mt-5">
        <label className="label mb-3">Mood (optional)</label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map(m => (
            <button key={m} onClick={() => setMood(mood === m ? null : m)} id={`mood-select-${m}`}>
              <MoodBadge
                mood={m}
                className={mood === m ? 'ring-2 ring-offset-1 ring-[var(--color-rose)]' : 'opacity-70 hover:opacity-100'}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="card p-5 mt-4">
        <label className="label mb-3">Tags (up to 5)</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map(tag => (
            <span key={tag} className="tag-pill">
              #{tag}
              <button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-400 transition-colors" aria-label={`Remove tag ${tag}`}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        {tags.length < 5 && (
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              className="input flex-1"
              placeholder="e.g. love, midnight, letters"
              maxLength={30}
              id="tag-input"
            />
            <button onClick={addTag} className="btn btn-secondary" id="add-tag-btn">
              <Plus size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Visibility + Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6">
        {/* Visibility Selector */}
        <div className="relative">
          <button
            onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
            className="btn btn-secondary flex items-center gap-2"
            id="visibility-selector"
          >
            {VISIBILITY_OPTIONS.find(v => v.value === visibility)?.icon}
            {VISIBILITY_OPTIONS.find(v => v.value === visibility)?.label}
            <ChevronDown size={14} />
          </button>
          {showVisibilityMenu && (
            <div className="absolute bottom-12 left-0 w-56 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-lg py-1 z-10">
              {VISIBILITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setVisibility(opt.value); setShowVisibilityMenu(false) }}
                  className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-[var(--bg-tertiary)] transition-colors text-left ${
                    visibility === opt.value ? 'text-[var(--color-rose)]' : ''
                  }`}
                  id={`visibility-${opt.value}`}
                >
                  <span className="mt-0.5">{opt.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{opt.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 sm:ml-auto">
          <button
            onClick={() => saveDraft('draft')}
            className="btn btn-secondary flex-1 sm:flex-none"
            disabled={saving}
            id="save-draft-btn"
          >
            {saving ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <Save size={16} />}
            Save draft
          </button>
          <button
            onClick={() => saveDraft('published', visibility === 'private' ? 'public' : visibility)}
            className="btn btn-rose flex-1 sm:flex-none"
            disabled={publishing}
            id="publish-btn"
          >
            {publishing ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Globe size={16} />}
            Publish
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WritePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--text-muted)]">Preparing writing studio...</p>
        </div>
      }
    >
      <WriteContent />
    </Suspense>
  )
}
