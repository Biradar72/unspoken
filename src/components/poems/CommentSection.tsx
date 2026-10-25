'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AvatarDisplay } from '@/components/ui/AvatarDisplay'
import { formatDistanceToNow } from 'date-fns'
import { Send, Trash2, Flag } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Comment {
  id: string
  body: string
  created_at: string
  author_id: string
  profiles: { username: string; display_name: string; avatar_url: string | null }
}

export function CommentSection({ poemId, currentUserId }: { poemId: string; currentUserId: string | null }) {
  const supabase = createClient()
  const [comments, setComments] = useState<Comment[]>([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(username, display_name, avatar_url)')
      .eq('poem_id', poemId)
      .order('created_at', { ascending: true })
    setComments((data as any) || [])
    setLoading(false)
  }

  useEffect(() => { fetchComments() }, [poemId])

  // Subscribe to new comments in real time
  useEffect(() => {
    const channel = supabase
      .channel(`comments-${poemId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `poem_id=eq.${poemId}`,
      }, () => fetchComments())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [poemId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUserId) { toast.error('Sign in to comment'); return }
    if (!body.trim()) return
    setSubmitting(true)
    const { error } = await supabase.from('comments').insert({
      poem_id: poemId,
      author_id: currentUserId,
      body: body.trim(),
    })
    if (error) {
      toast.error(error.message)
    } else {
      setBody('')
      toast.success('Comment posted!')
    }
    setSubmitting(false)
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return
    await supabase.from('comments').delete().eq('id', commentId).eq('author_id', currentUserId!)
    setComments(prev => prev.filter(c => c.id !== commentId))
    toast.success('Comment deleted')
  }

  return (
    <section id="comments" className="mt-8">
      <h2 className="font-serif text-xl font-semibold mb-6">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h2>

      {/* Comment Form */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-8" id="comment-form">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            className="input resize-none"
            style={{ minHeight: 'auto', height: '80px' }}
            placeholder="Share your thoughts..."
            maxLength={1000}
            id="comment-input"
          />
          <button
            type="submit"
            className="btn btn-rose self-end flex-shrink-0"
            disabled={submitting || !body.trim()}
            id="comment-submit"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </form>
      ) : (
        <div className="mb-8 p-4 rounded-xl bg-[var(--bg-secondary)] text-center text-sm text-[var(--text-muted)]">
          <Link href="/login" className="text-[var(--color-rose)] hover:underline">Sign in</Link>
          {' '}to leave a comment.
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-3">
              <div className="skeleton w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-24 rounded" />
                <div className="skeleton h-4 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-[var(--text-muted)] py-8 text-sm">
          No comments yet. Be the first to respond.
        </p>
      ) : (
        <div className="space-y-5">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3 animate-fade-up" id={`comment-${comment.id}`}>
              <Link href={`/profile/${comment.profiles?.username}`} className="flex-shrink-0">
                <AvatarDisplay
                  src={comment.profiles?.avatar_url}
                  name={comment.profiles?.display_name || 'U'}
                  size="sm"
                />
              </Link>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <Link
                    href={`/profile/${comment.profiles?.username}`}
                    className="font-medium text-sm hover:text-[var(--color-rose)] transition-colors"
                  >
                    {comment.profiles?.display_name}
                  </Link>
                  <span className="text-xs text-[var(--text-muted)]">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm leading-relaxed">{comment.body}</p>
              </div>
              <div className="flex items-start gap-1 flex-shrink-0">
                {comment.author_id === currentUserId && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="btn btn-ghost p-1.5 text-[var(--text-muted)] hover:text-red-400"
                    aria-label="Delete comment"
                    id={`delete-comment-${comment.id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                {comment.author_id !== currentUserId && currentUserId && (
                  <Link
                    href={`/report?comment=${comment.id}`}
                    className="btn btn-ghost p-1.5 text-[var(--text-muted)] hover:text-red-400 opacity-0 group-hover:opacity-100"
                    aria-label="Report comment"
                  >
                    <Flag size={14} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
