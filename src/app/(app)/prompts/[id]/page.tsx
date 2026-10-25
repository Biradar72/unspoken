import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PoemCard } from '@/components/poems/PoemCard'
import { ArrowLeft, Sparkles, PenLine, Calendar, BookOpen } from 'lucide-react'
import { format } from 'date-fns'
import type { Metadata } from 'next'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient()
  const { data: prompt } = await supabase
    .from('writing_prompts')
    .select('body')
    .eq('id', params.id)
    .single()

  if (!prompt) return { title: 'Writing Prompt — Unspoken' }

  return {
    title: `Prompt: "${prompt.body}" — Unspoken`,
    description: `Read poems written in response to: "${prompt.body}"`,
  }
}

export default async function SinglePromptPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Fetch prompt details
  const { data: prompt } = await supabase
    .from('writing_prompts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!prompt) notFound()

  // 2. Fetch public published poems attached to this prompt
  const { data: poems } = await supabase
    .from('public_poems_with_stats')
    .select('*')
    .eq('prompt_id', params.id)
    .eq('status', 'published')
    .eq('visibility', 'public')
    .order('like_count', { ascending: false })

  // 3. User likes & bookmarks if logged in
  let likedIds = new Set<string>()
  let bookmarkedIds = new Set<string>()

  if (user && poems && poems.length > 0) {
    const poemIds = poems.map(p => p.id)
    const [{ data: likes }, { data: bookmarks }] = await Promise.all([
      supabase.from('poem_likes').select('poem_id').eq('user_id', user.id).in('poem_id', poemIds),
      supabase.from('bookmarks').select('poem_id').eq('user_id', user.id).in('poem_id', poemIds),
    ])

    likedIds = new Set((likes || []).map(l => l.poem_id))
    bookmarkedIds = new Set((bookmarks || []).map(b => b.poem_id))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Back button */}
      <Link
        href="/prompts"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        All Prompts
      </Link>

      {/* Prompt Card Banner */}
      <div className="card p-6 md:p-8 mb-10 bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-[var(--color-primary)]/5 border-[var(--color-primary)]/20 shadow-md">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-primary)] text-white">
            <Sparkles size={12} /> Writing Prompt
          </span>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Calendar size={13} />
            <span>{format(new Date(prompt.created_at), 'MMMM d, yyyy')}</span>
          </div>
        </div>

        <blockquote className="font-serif text-2xl md:text-3xl text-[var(--text-primary)] leading-relaxed italic mb-6">
          &ldquo;{prompt.body}&rdquo;
        </blockquote>

        <div className="flex items-center gap-4 flex-wrap">
          <Link
            href={`/write?promptId=${prompt.id}`}
            className="btn-primary inline-flex items-center gap-2"
          >
            <PenLine size={16} />
            Write your response
          </Link>
          <span className="text-xs text-[var(--text-muted)]">
            {poems?.length || 0} {(poems?.length || 0) === 1 ? 'poem written' : 'poems written'}
          </span>
        </div>
      </div>

      {/* Responses Grid */}
      <div>
        <h2 className="font-serif text-xl font-bold mb-6 flex items-center gap-2">
          <BookOpen size={20} className="text-[var(--color-primary)]" />
          Responses to this Prompt
        </h2>

        {(!poems || poems.length === 0) ? (
          <div className="card p-12 text-center text-[var(--text-muted)]">
            <PenLine size={32} className="mx-auto mb-3 opacity-40 text-[var(--color-primary)]" />
            <h3 className="font-serif text-lg font-medium text-[var(--text-primary)] mb-1">
              Be the first voice
            </h3>
            <p className="text-sm max-w-sm mx-auto mb-6">
              No one has published a poem in response to this prompt yet. The canvas is yours.
            </p>
            <Link href={`/write?promptId=${prompt.id}`} className="btn-primary inline-flex items-center gap-2 text-sm">
              <PenLine size={14} />
              Write First Response
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {poems.map(poem => (
              <PoemCard
                key={poem.id}
                poem={{
                  ...poem,
                  tags: Array.isArray(poem.tags) ? poem.tags : [],
                  mood: poem.mood,
                  is_liked: likedIds.has(poem.id),
                  is_bookmarked: bookmarkedIds.has(poem.id),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
