import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PoemCard } from '@/components/poems/PoemCard'
import { Bookmark } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Bookmarks' }

export default async function BookmarksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/bookmarks')

  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('poem_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const poemIds = (bookmarks || []).map(b => b.poem_id)

  let poems: any[] = []
  if (poemIds.length > 0) {
    const { data } = await supabase
      .from('public_poems_with_stats')
      .select('*')
      .in('id', poemIds)
    poems = (data || []).map(p => ({
      ...p,
      tags: Array.isArray(p.tags) ? p.tags : [],
      is_liked: false,
      is_bookmarked: true,
    }))
    // Preserve bookmark order
    poems.sort((a, b) => poemIds.indexOf(a.id) - poemIds.indexOf(b.id))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Bookmark size={24} className="text-[var(--color-gold)] fill-current" />
        <h1 className="font-serif text-2xl font-bold">Bookmarks</h1>
        <span className="text-sm text-[var(--text-muted)]">({poems.length})</span>
      </div>

      {poems.length === 0 ? (
        <div className="text-center py-20">
          <Bookmark size={40} className="mx-auto mb-4 text-[var(--text-muted)] opacity-40" />
          <h3 className="font-serif text-xl font-semibold mb-2">No bookmarks yet</h3>
          <p className="text-[var(--text-muted)] text-sm">
            Bookmark poems you love to find them here later.
          </p>
        </div>
      ) : (
        <div className="space-y-5 stagger-children">
          {poems.map(poem => (
            <PoemCard key={poem.id} poem={poem} />
          ))}
        </div>
      )}
    </div>
  )
}
