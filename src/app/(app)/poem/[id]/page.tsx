import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AvatarDisplay } from '@/components/ui/AvatarDisplay'
import { MoodBadge } from '@/components/ui/MoodBadge'
import { PoemActions } from '@/components/poems/PoemActions'
import { CommentSection } from '@/components/poems/CommentSection'
import { formatDistanceToNow, format } from 'date-fns'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'

interface Props { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('poems').select('title, body').eq('id', params.id).single()
    if (!data) return { title: 'Poem not found' }
    return {
      title: data.title,
      description: data.body.slice(0, 160),
    }
  } catch {
    return { title: 'Poem' }
  }
}

export default async function PoemPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch poem with author
  const { data: poem } = await supabase
    .from('poems')
    .select('*, profiles(*), poem_tags(tag)')
    .eq('id', params.id)
    .single()

  if (!poem) notFound()

  // Visibility enforcement — server side
  const isOwner = user?.id === poem.author_id
  if (poem.visibility === 'private' && !isOwner) notFound()
  if (poem.status !== 'published' && !isOwner) notFound()

  // Get stats
  const [{ count: likeCount }, { count: commentCount }, { data: likeData }, { data: bookmarkData }] = await Promise.all([
    supabase.from('poem_likes').select('*', { count: 'exact', head: true }).eq('poem_id', poem.id),
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('poem_id', poem.id),
    user ? supabase.from('poem_likes').select('id').eq('poem_id', poem.id).eq('user_id', user.id).single() : Promise.resolve({ data: null }),
    user ? supabase.from('bookmarks').select('id').eq('poem_id', poem.id).eq('user_id', user.id).single() : Promise.resolve({ data: null }),
  ])

  const author = poem.profiles as any
  const tags = (poem.poem_tags || []).map((t: any) => t.tag)
  const publishedDate = poem.published_at || poem.created_at

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Back Button */}
      <Link href={user ? '/feed' : '/explore'} className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8 transition-colors">
        <ArrowLeft size={16} />
        Back
      </Link>

      <article className="animate-fade-up">
        {/* Author */}
        <header className="flex items-center gap-4 mb-8">
          <Link href={`/profile/${author?.username}`}>
            <AvatarDisplay src={author?.avatar_url} name={author?.display_name || 'Poet'} size="lg" />
          </Link>
          <div>
            <Link href={`/profile/${author?.username}`} className="font-semibold hover:text-[var(--color-rose)] transition-colors">
              {author?.display_name}
            </Link>
            <p className="text-sm text-[var(--text-muted)]">@{author?.username}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {format(new Date(publishedDate), 'MMMM d, yyyy')}
              {' · '}
              {formatDistanceToNow(new Date(publishedDate), { addSuffix: true })}
            </p>
          </div>
          {isOwner && (
            <div className="ml-auto">
              <Link
                href={`/write?edit=${poem.id}`}
                className="btn btn-secondary btn-sm"
                id="edit-poem-btn"
              >
                Edit poem
              </Link>
            </div>
          )}
        </header>

        {/* Poem */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8 leading-tight">
            {poem.title}
          </h1>
          <div className="poem-body">
            {poem.body}
          </div>
        </div>

        {/* Mood + Tags */}
        {(poem.mood || tags.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-[var(--border-color)]">
            {poem.mood && <MoodBadge mood={poem.mood} />}
            {tags.map((tag: string) => (
              <Link key={tag} href={`/explore?tag=${tag}`} className="tag-pill hover:border-[var(--color-rose)] hover:text-[var(--color-rose)] transition-colors">
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Visibility notice */}
        {poem.visibility === 'unlisted' && (
          <div className="mb-6 p-3 rounded-lg bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 text-sm text-[var(--color-gold)]">
            🔗 This poem is unlisted — it won&apos;t appear in feeds or search.
          </div>
        )}

        {/* Actions */}
        <PoemActions
          poemId={poem.id}
          authorId={poem.author_id}
          initialLiked={!!likeData}
          initialBookmarked={!!bookmarkData}
          likeCount={likeCount || 0}
          commentCount={commentCount || 0}
          poemTitle={poem.title}
          poemBody={poem.body}
          authorName={author?.display_name}
        />

        {/* Comments */}
        {poem.visibility === 'public' && poem.status === 'published' && (
          <CommentSection poemId={poem.id} currentUserId={user?.id || null} />
        )}
      </article>
    </div>
  )
}
