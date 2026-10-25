'use client'

import { useState, useRef } from 'react'
import { Heart, MessageCircle, Bookmark, Share2, Image as ImageIcon, Download, X, Sparkles } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface PoemActionsProps {
  poemId: string
  authorId: string
  initialLiked: boolean
  initialBookmarked: boolean
  likeCount: number
  commentCount: number
  poemTitle: string
  poemBody: string
  authorName: string
}

type CardTheme = 'midnight' | 'parchment' | 'rose' | 'emerald'

export function PoemActions({
  poemId,
  authorId,
  initialLiked,
  initialBookmarked,
  likeCount: initialLikeCount,
  commentCount,
  poemTitle,
  poemBody,
  authorName,
}: PoemActionsProps) {
  const { user } = useAuth()
  const supabase = createClient()
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [bookmarked, setBookmarked] = useState(initialBookmarked)

  // Card modal state
  const [cardModalOpen, setCardModalOpen] = useState(false)
  const [cardTheme, setCardTheme] = useState<CardTheme>('midnight')
  const [downloading, setDownloading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleLike = async () => {
    if (!user) {
      toast.error('Sign in to like')
      return
    }
    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount(c => (newLiked ? c + 1 : c - 1))
    if (newLiked) {
      await supabase.from('poem_likes').insert({ poem_id: poemId, user_id: user.id })
    } else {
      await supabase.from('poem_likes').delete().eq('poem_id', poemId).eq('user_id', user.id)
    }
  }

  const handleBookmark = async () => {
    if (!user) {
      toast.error('Sign in to bookmark')
      return
    }
    const nb = !bookmarked
    setBookmarked(nb)
    if (nb) {
      await supabase.from('bookmarks').insert({ poem_id: poemId, user_id: user.id })
      toast.success('Bookmarked!')
    } else {
      await supabase.from('bookmarks').delete().eq('poem_id', poemId).eq('user_id', user.id)
      toast.success('Bookmark removed')
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: poemTitle, text: `"${poemTitle}" by ${authorName}`, url })
      } catch {
        // user cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleDownloadCard = async () => {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      })
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `${poemTitle.replace(/\s+/g, '-').toLowerCase()}-unspoken.png`
      link.href = dataUrl
      link.click()
      toast.success('Poem card downloaded!')
      setCardModalOpen(false)
    } catch (err: any) {
      toast.error('Failed to generate image')
    } finally {
      setDownloading(false)
    }
  }

  // Theme styling for quote card
  const themeStyles: Record<CardTheme, { bg: string; text: string; sub: string; border: string }> = {
    midnight: {
      bg: 'bg-zinc-950',
      text: 'text-zinc-100',
      sub: 'text-amber-300/80',
      border: 'border-zinc-800',
    },
    parchment: {
      bg: 'bg-[#faf6ed]',
      text: 'text-[#2b2620]',
      sub: 'text-[#857463]',
      border: 'border-[#e4dcce]',
    },
    rose: {
      bg: 'bg-gradient-to-br from-[#2a131b] to-[#12080c]',
      text: 'text-rose-100',
      sub: 'text-rose-300/80',
      border: 'border-rose-900/40',
    },
    emerald: {
      bg: 'bg-gradient-to-br from-[#0c221a] to-[#050f0b]',
      text: 'text-emerald-100',
      sub: 'text-emerald-300/80',
      border: 'border-emerald-900/40',
    },
  }

  const currentTheme = themeStyles[cardTheme]

  return (
    <>
      <div className="flex items-center gap-2 py-4 border-t border-b border-[var(--border-color)] mb-8">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            liked
              ? 'bg-rose-50 text-[var(--color-rose)] dark:bg-rose-950/30'
              : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--color-rose)]'
          }`}
          id="poem-page-like-btn"
          aria-label={liked ? 'Unlike' : 'Like this poem'}
        >
          <Heart size={20} className={liked ? 'fill-current' : ''} />
          <span>{likeCount}</span>
          <span className="hidden sm:inline text-sm">{liked ? 'Liked' : 'Like'}</span>
        </button>

        <a
          href="#comments"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] transition-all"
          id="poem-page-comment-btn"
        >
          <MessageCircle size={20} />
          <span>{commentCount}</span>
          <span className="hidden sm:inline text-sm">Comments</span>
        </a>

        <div className="flex-1" />

        <button
          onClick={() => setCardModalOpen(true)}
          className="p-2.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--color-primary)] transition-all"
          id="poem-page-card-btn"
          title="Export Poem as Image"
        >
          <ImageIcon size={20} />
        </button>

        <button
          onClick={handleBookmark}
          className={`p-2.5 rounded-lg transition-all ${
            bookmarked
              ? 'text-[var(--color-gold)]'
              : 'text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]'
          }`}
          id="poem-page-bookmark-btn"
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark poem'}
        >
          <Bookmark size={20} className={bookmarked ? 'fill-current' : ''} />
        </button>

        <button
          onClick={handleShare}
          className="p-2.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] transition-all"
          id="poem-page-share-btn"
          aria-label="Share poem"
        >
          <Share2 size={20} />
        </button>
      </div>

      {/* Quote Card Export Modal */}
      {cardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[var(--color-gold)]" />
                <h3 className="font-serif text-lg font-bold">Poem Card Studio</h3>
              </div>
              <button
                onClick={() => setCardModalOpen(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Theme Picker */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)] font-medium">Style:</span>
              <div className="grid grid-cols-4 gap-2 flex-1">
                {(['midnight', 'parchment', 'rose', 'emerald'] as CardTheme[]).map(theme => (
                  <button
                    key={theme}
                    onClick={() => setCardTheme(theme)}
                    className={`py-1.5 text-xs rounded-md border font-medium capitalize transition-all ${
                      cardTheme === theme
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                        : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-zinc-400'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Render Card to Capture */}
            <div
              ref={cardRef}
              className={`p-8 rounded-2xl border ${currentTheme.border} ${currentTheme.bg} shadow-2xl transition-colors duration-300`}
            >
              <div className="text-center space-y-4">
                <h4 className={`font-serif text-xl font-bold tracking-tight ${currentTheme.text}`}>
                  {poemTitle}
                </h4>

                <div
                  className={`font-serif text-sm leading-relaxed whitespace-pre-wrap line-clamp-12 max-h-[280px] overflow-hidden italic ${currentTheme.text} opacity-90`}
                >
                  {poemBody}
                </div>

                <div className="pt-4 border-t border-current/10 flex items-center justify-between text-xs">
                  <span className={`font-medium ${currentTheme.sub}`}>— {authorName}</span>
                  <span className={`tracking-widest uppercase text-[10px] opacity-70 ${currentTheme.text}`}>
                    Unspoken
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCardModalOpen(false)}
                className="btn-secondary text-sm py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadCard}
                disabled={downloading}
                className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
                id="download-poem-card-btn"
              >
                <Download size={15} />
                {downloading ? 'Rendering Card...' : 'Save Poem Image'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
