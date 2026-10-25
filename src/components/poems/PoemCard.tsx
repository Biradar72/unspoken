'use client'

import Link from 'next/link'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, Flag } from 'lucide-react'
import { AvatarDisplay } from '@/components/ui/AvatarDisplay'
import { MoodBadge } from '@/components/ui/MoodBadge'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { MoodType } from '@/types/database'

export interface PoemCardData {
  id: string
  title: string
  body: string
  mood: MoodType | null
  published_at: string | null
  created_at: string
  author_id: string
  tags: string[]
  like_count: number
  comment_count: number
  author_username: string
  author_display_name: string
  author_avatar_url: string | null
  is_liked?: boolean
  is_bookmarked?: boolean
}

interface PoemCardProps {
  poem: PoemCardData
  compact?: boolean
}

export function PoemCard({ poem, compact = false }: PoemCardProps) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(poem.is_liked ?? false)
  const [likeCount, setLikeCount] = useState(poem.like_count)
  const [bookmarked, setBookmarked] = useState(poem.is_bookmarked ?? false)
  const [showOptions, setShowOptions] = useState(false)
  const supabase = createClient()

  const date = poem.published_at || poem.created_at
  const timeAgo = formatDistanceToNow(new Date(date), { addSuffix: true })

  // Preview: first 6 lines
  const previewLines = poem.body.split('\n').slice(0, compact ? 4 : 8).join('\n')
  const hasMore = poem.body.split('\n').length > (compact ? 4 : 8)

  const handleLike = async () => {
    if (!user) { toast.error('Sign in to like poems'); return }
    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1)

    if (newLiked) {
      await supabase.from('poem_likes').insert({ poem_id: poem.id, user_id: user.id })
    } else {
      await supabase.from('poem_likes').delete()
        .eq('poem_id', poem.id).eq('user_id', user.id)
    }
  }

  const handleBookmark = async () => {
    if (!user) { toast.error('Sign in to bookmark poems'); return }
    const newBookmarked = !bookmarked
    setBookmarked(newBookmarked)

    if (newBookmarked) {
      await supabase.from('bookmarks').insert({ poem_id: poem.id, user_id: user.id })
      toast.success('Bookmarked!')
    } else {
      await supabase.from('bookmarks').delete()
        .eq('poem_id', poem.id).eq('user_id', user.id)
      toast.success('Bookmark removed')
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/poem/${poem.id}`
    if (navigator.share) {
      await navigator.share({ title: poem.title, url })
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied!')
    }
  }

  return (
    <article className="poem-card animate-fade-up" id={`poem-${poem.id}`}>
      {/* Author Header */}
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${poem.author_username}`} className="flex-shrink-0">
            <AvatarDisplay
              src={poem.author_avatar_url}
              name={poem.author_display_name}
              size="md"
            />
          </Link>
          <div>
            <Link
              href={`/profile/${poem.author_username}`}
              className="font-medium text-sm hover:text-[var(--color-rose)] transition-colors"
            >
              {poem.author_display_name}
            </Link>
            <p className="text-xs text-[var(--text-muted)]">
              @{poem.author_username} · {timeAgo}
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="btn btn-ghost p-1.5"
            id={`poem-options-${poem.id}`}
            aria-label="More options"
          >
            <MoreHorizontal size={16} />
          </button>
          {showOptions && (
            <div className="absolute right-0 top-8 w-44 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-lg py-1 z-10">
              <Link
                href={`/poem/${poem.id}`}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--bg-tertiary)] transition-colors"
                onClick={() => setShowOptions(false)}
              >
                View full poem
              </Link>
              <button
                onClick={() => { handleShare(); setShowOptions(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--bg-tertiary)] transition-colors text-left"
              >
                Share poem
              </button>
              {user && user.id !== poem.author_id && (
                <Link
                  href={`/report?poem=${poem.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-[var(--bg-tertiary)] transition-colors"
                  onClick={() => setShowOptions(false)}
                >
                  <Flag size={14} /> Report
                </Link>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Poem Content */}
      <Link href={`/poem/${poem.id}`} className="block group">
        <h2 className="font-serif text-lg font-semibold mb-3 group-hover:text-[var(--color-rose)] transition-colors">
          {poem.title}
        </h2>
        <div className="poem-body-preview mb-3">
          {previewLines}
          {hasMore && <span className="text-[var(--text-muted)] text-sm"> …read more</span>}
        </div>
      </Link>

      {/* Mood + Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {poem.mood && <MoodBadge mood={poem.mood} />}
        {poem.tags.slice(0, 3).map(tag => (
          <Link
            key={tag}
            href={`/explore?tag=${tag}`}
            className="tag-pill hover:border-[var(--color-rose)] hover:text-[var(--color-rose)] transition-colors"
          >
            #{tag}
          </Link>
        ))}
      </div>

      {/* Actions */}
      <footer className="flex items-center gap-1 pt-3 border-t border-[var(--border-color)]">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            liked
              ? 'text-[var(--color-rose)] bg-rose-50 dark:bg-rose-950/30'
              : 'text-[var(--text-muted)] hover:text-[var(--color-rose)] hover:bg-[var(--bg-tertiary)]'
          }`}
          id={`like-btn-${poem.id}`}
          aria-label={liked ? 'Unlike poem' : 'Like poem'}
        >
          <Heart size={16} className={liked ? 'fill-current' : ''} />
          <span>{likeCount}</span>
        </button>

        {/* Comments */}
        <Link
          href={`/poem/${poem.id}#comments`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
          id={`comment-btn-${poem.id}`}
        >
          <MessageCircle size={16} />
          <span>{poem.comment_count}</span>
        </Link>

        <div className="flex-1" />

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          className={`btn btn-ghost p-2 transition-all ${
            bookmarked ? 'text-[var(--color-gold)] fill-current' : 'text-[var(--text-muted)]'
          }`}
          id={`bookmark-btn-${poem.id}`}
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark poem'}
        >
          <Bookmark size={16} className={bookmarked ? 'fill-current' : ''} />
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="btn btn-ghost p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          id={`share-btn-${poem.id}`}
          aria-label="Share poem"
        >
          <Share2 size={16} />
        </button>
      </footer>
    </article>
  )
}
