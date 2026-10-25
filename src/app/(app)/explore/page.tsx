'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PoemCard } from '@/components/poems/PoemCard'
import { MoodBadge, MOODS } from '@/components/ui/MoodBadge'
import { AvatarDisplay } from '@/components/ui/AvatarDisplay'
import { Search, X, SlidersHorizontal, Users, BookOpen } from 'lucide-react'
import Link from 'next/link'
import type { MoodType } from '@/types/database'

function ExploreContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(
    searchParams.get('mood') as MoodType | null
  )
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '')
  const [poems, setPoems] = useState<any[]>([])
  const [writers, setWriters] = useState<any[]>([])
  const [activeSection, setActiveSection] = useState<'poems' | 'writers'>('poems')
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string, mood: MoodType | null, tag: string) => {
    setLoading(true)
    try {
      // Search poems
      let poemQuery = supabase
        .from('public_poems_with_stats')
        .select('*')
        .order('like_count', { ascending: false })
        .limit(20)

      if (q) {
        poemQuery = poemQuery.or(`title.ilike.%${q}%,body.ilike.%${q}%`)
      }
      if (mood) {
        poemQuery = poemQuery.eq('mood', mood)
      }

      const { data: poemData } = await poemQuery
      let filteredPoems = poemData || []

      if (tag) {
        // Filter by tag via poem_tags
        const { data: taggedIds } = await supabase
          .from('poem_tags')
          .select('poem_id')
          .ilike('tag', `%${tag}%`)
        const ids = new Set((taggedIds || []).map(t => t.poem_id))
        filteredPoems = filteredPoems.filter(p => ids.has(p.id))
      }

      setPoems(filteredPoems.map(p => ({ ...p, tags: Array.isArray(p.tags) ? p.tags : [], is_liked: false, is_bookmarked: false })))

      // Search writers
      if (q) {
        const { data: writerData } = await supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
          .eq('is_suspended', false)
          .limit(10)
        setWriters(writerData || [])
      } else {
        // Show new writers
        const { data: newWriters } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_suspended', false)
          .order('created_at', { ascending: false })
          .limit(6)
        setWriters(newWriters || [])
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      search(query, selectedMood, selectedTag)
    }, 300)
  }, [query, selectedMood, selectedTag, search])

  const clearFilters = () => {
    setQuery('')
    setSelectedMood(null)
    setSelectedTag('')
  }

  const hasFilters = query || selectedMood || selectedTag

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold mb-2">Explore</h1>
        <p className="text-[var(--text-muted)]">Discover poems, writers, and moods.</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          id="explore-search"
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="input pl-12 pr-12"
          placeholder="Search poems, writers, topics..."
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Mood Filters */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal size={15} className="text-[var(--text-muted)]" />
          <span className="text-sm font-medium text-[var(--text-muted)]">Filter by mood</span>
          {hasFilters && (
            <button onClick={clearFilters} className="ml-auto text-xs text-[var(--color-rose)] hover:underline">
              Clear filters
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {MOODS.map(mood => (
            <button
              key={mood}
              onClick={() => setSelectedMood(selectedMood === mood ? null : mood)}
              id={`filter-mood-${mood}`}
            >
              <MoodBadge
                mood={mood}
                interactive
                className={selectedMood === mood ? 'ring-2 ring-[var(--color-rose)] ring-offset-1' : ''}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 p-1 bg-[var(--bg-secondary)] rounded-xl mb-6 border border-[var(--border-color)] w-fit">
        <button
          onClick={() => setActiveSection('poems')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSection === 'poems'
              ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
          id="explore-tab-poems"
        >
          <BookOpen size={15} />
          Poems
          {poems.length > 0 && <span className="text-xs opacity-60">({poems.length})</span>}
        </button>
        <button
          onClick={() => setActiveSection('writers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeSection === 'writers'
              ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
          id="explore-tab-writers"
        >
          <Users size={15} />
          Writers
          {writers.length > 0 && <span className="text-xs opacity-60">({writers.length})</span>}
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-6">
              <div className="flex gap-3 mb-4">
                <div className="skeleton w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-32 rounded" />
                  <div className="skeleton h-3 w-20 rounded" />
                </div>
              </div>
              <div className="skeleton h-5 w-48 rounded mb-3" />
              <div className="space-y-2">
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-3/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : activeSection === 'poems' ? (
        poems.length > 0 ? (
          <div className="space-y-5 stagger-children">
            {poems.map(poem => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-serif text-xl font-semibold mb-2">No poems found</h3>
            <p className="text-[var(--text-muted)] text-sm">
              Try different keywords or mood filters.
            </p>
          </div>
        )
      ) : (
        writers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
            {writers.map((writer: any) => (
              <Link
                key={writer.id}
                href={`/profile/${writer.username}`}
                className="card p-5 flex items-center gap-4 hover:shadow-poem-hover transition-all"
                id={`writer-card-${writer.username}`}
              >
                <AvatarDisplay src={writer.avatar_url} name={writer.display_name} size="lg" />
                <div className="min-w-0">
                  <p className="font-semibold truncate">{writer.display_name}</p>
                  <p className="text-sm text-[var(--text-muted)]">@{writer.username}</p>
                  {writer.bio && (
                    <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1">{writer.bio}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">👤</div>
            <h3 className="font-serif text-xl font-semibold mb-2">No writers found</h3>
            <p className="text-[var(--text-muted)] text-sm">Try a different search.</p>
          </div>
        )
      )}
    </div>
  )
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-[var(--text-muted)]">Opening the sanctuary...</p>
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  )
}
