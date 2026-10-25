import { createClient } from '@/lib/supabase/server'
import { PoemCard } from '@/components/poems/PoemCard'
import { FeedTabs } from '@/components/feed/FeedTabs'
import { WritingPromptBanner } from '@/components/feed/WritingPromptBanner'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home Feed',
  description: 'Read and discover the latest poems from writers you follow and the Unspoken community.',
}

interface FeedPageProps {
  searchParams: { tab?: string }
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirectTo=/feed')

  const tab = searchParams.tab || 'latest'

  let poems: any[] = []

  if (tab === 'following') {
    // Get poems from followed authors
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', user.id)

    const followingIds = (follows || []).map(f => f.following_id)

    if (followingIds.length > 0) {
      const { data } = await supabase
        .from('public_poems_with_stats')
        .select('*')
        .in('author_id', followingIds)
        .order('published_at', { ascending: false })
        .limit(20)
      poems = data || []
    }
  } else if (tab === 'popular') {
    // Ranked by (likes * 3 + comments * 2) within last 30 days
    const { data } = await supabase
      .from('public_poems_with_stats')
      .select('*')
      .gte('published_at', new Date(Date.now() - 30 * 86400000).toISOString())
      .order('like_count', { ascending: false })
      .limit(20)
    poems = data || []
  } else {
    // Latest
    const { data } = await supabase
      .from('public_poems_with_stats')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(20)
    poems = data || []
  }

  // Get user likes and bookmarks for the displayed poems
  const poemIds = poems.map(p => p.id)
  let likedIds = new Set<string>()
  let bookmarkedIds = new Set<string>()

  if (poemIds.length > 0) {
    const [{ data: likes }, { data: bookmarks }] = await Promise.all([
      supabase.from('poem_likes').select('poem_id').eq('user_id', user.id).in('poem_id', poemIds),
      supabase.from('bookmarks').select('poem_id').eq('user_id', user.id).in('poem_id', poemIds),
    ])
    likedIds = new Set((likes || []).map(l => l.poem_id))
    bookmarkedIds = new Set((bookmarks || []).map(b => b.poem_id))
  }

  // Fetch today's prompt
  const { data: todayPrompt } = await supabase
    .from('writing_prompts')
    .select('*')
    .eq('is_active', true)
    .single()

  const enrichedPoems = poems.map(p => ({
    ...p,
    tags: Array.isArray(p.tags) ? p.tags : [],
    is_liked: likedIds.has(p.id),
    is_bookmarked: bookmarkedIds.has(p.id),
  }))

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {todayPrompt && <WritingPromptBanner prompt={todayPrompt} />}

      <FeedTabs activeTab={tab} />

      {enrichedPoems.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">
            {tab === 'following' ? '👥' : '📝'}
          </div>
          <h3 className="font-serif text-xl font-semibold mb-2">
            {tab === 'following' ? 'Nothing from your following list yet' : 'No poems yet'}
          </h3>
          <p className="text-[var(--text-muted)] text-sm">
            {tab === 'following'
              ? 'Follow some writers to see their poems here.'
              : 'Be the first to publish a poem!'}
          </p>
        </div>
      ) : (
        <div className="space-y-5 stagger-children">
          {enrichedPoems.map(poem => (
            <PoemCard key={poem.id} poem={poem} />
          ))}
        </div>
      )}
    </div>
  )
}
