import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { MoodBadge, MOODS } from '@/components/ui/MoodBadge'
import { createClient } from '@/lib/supabase/server'
import { PoemCard } from '@/components/poems/PoemCard'
import { ArrowRight, PenLine, Users, Sparkles } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Unspoken — For everything you couldn't say out loud",
  description: 'A social poetry platform where feelings become words, and words become connection.',
}

async function getFeaturedPoems() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('public_poems_with_stats')
      .select('*')
      .order('like_count', { ascending: false })
      .limit(6)
    return data || []
  } catch {
    return []
  }
}

async function getTodayPrompt() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('writing_prompts')
      .select('*')
      .eq('is_active', true)
      .single()
    return data
  } catch {
    return null
  }
}

const SAMPLE_POEMS = [
  {
    id: 'sample-1',
    title: 'Between the Lines',
    body: `I write the things I cannot say—
the words that catch inside my chest
like birds who've forgotten how to fly,
who only know the weight of rest.

Perhaps tomorrow I will speak.
Perhaps the sky will make more sense.
Until then, I leave you this:
a poem in your absence.`,
    mood: 'heartbreak' as const,
    tags: ['longing', 'unspoken'],
    author_display_name: 'Aria Voss',
    author_username: 'ariavoss',
    author_avatar_url: null,
    author_id: 'sample',
    like_count: 142,
    comment_count: 28,
    published_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    is_liked: false,
    is_bookmarked: false,
  },
  {
    id: 'sample-2',
    title: 'Soft Hours',
    body: `There are hours made of cotton—
soft, forgiving, slow—
where the clock forgets its purpose
and lets the quiet grow.

I live inside those hours
as often as I can.
The rest of time is borrowed.
Those hours are who I am.`,
    mood: 'healing' as const,
    tags: ['peace', 'stillness'],
    author_display_name: 'Elias Morrow',
    author_username: 'eliasmorrow',
    author_avatar_url: null,
    author_id: 'sample2',
    like_count: 89,
    comment_count: 14,
    published_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
    is_liked: false,
    is_bookmarked: false,
  },
  {
    id: 'sample-3',
    title: 'First Light',
    body: `Before the world remembers
it is supposed to be loud,
there is a moment—lavender and ash—
when everything is allowed.

I stand inside that threshold,
one foot in, one foot out.
The universe is breathing.
That is what hope is about.`,
    mood: 'hope' as const,
    tags: ['morning', 'beginning'],
    author_display_name: 'Nadia Kim',
    author_username: 'nadiakim',
    author_avatar_url: null,
    author_id: 'sample3',
    like_count: 203,
    comment_count: 41,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    is_liked: false,
    is_bookmarked: false,
  },
]

export default async function HomePage() {
  const [featuredPoems, todayPrompt] = await Promise.all([
    getFeaturedPoems(),
    getTodayPrompt(),
  ])

  const displayPoems = featuredPoems.length > 0
    ? featuredPoems.map(p => ({
        ...p,
        tags: Array.isArray(p.tags) ? p.tags : [],
        mood: p.mood,
        is_liked: false,
        is_bookmarked: false,
      }))
    : SAMPLE_POEMS

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="hero-gradient pt-24 pb-20 md:pt-32 md:pb-28 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-sm text-[var(--text-muted)] mb-8 animate-fade-in">
              <Sparkles size={14} className="text-[var(--color-gold)]" />
              A space for your unwritten words
            </div>

            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-up">
              Some feelings are{' '}
              <span className="text-gradient italic">better written</span>
              {' '}than spoken.
            </h1>

            <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Unspoken is a social platform for poetry and emotional expression.
              Write, share, and discover poems that speak the unspeakable.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <Link href="/signup" className="btn btn-primary btn-lg" id="hero-start-writing">
                <PenLine size={20} />
                Start writing
                <ArrowRight size={18} />
              </Link>
              <Link href="/explore" className="btn btn-secondary btn-lg" id="hero-explore">
                Explore poems
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-14 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              {[
                { label: 'Writers', value: '12K+' },
                { label: 'Poems', value: '84K+' },
                { label: 'Moods', value: '14' },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div className="font-serif text-2xl font-bold text-gradient">{value}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mood Discovery */}
        <section className="py-16 px-4 bg-[var(--bg-secondary)]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl font-bold mb-3">How are you feeling today?</h2>
              <p className="text-[var(--text-muted)]">Browse poems by what you&apos;re going through.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {MOODS.map(mood => (
                <Link key={mood} href={`/explore?mood=${mood}`} id={`mood-${mood}`}>
                  <MoodBadge mood={mood} interactive className="text-sm px-4 py-2" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Poems */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-serif text-3xl font-bold">Featured Poems</h2>
                {featuredPoems.length === 0 && (
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    ✦ Sample poems — be among the first to publish your own!
                  </p>
                )}
              </div>
              <Link href="/explore" className="btn btn-secondary btn-sm" id="view-all-poems">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-5">
              {displayPoems.slice(0, 3).map(poem => (
                <PoemCard key={poem.id} poem={poem} />
              ))}
            </div>
          </div>
        </section>

        {/* Daily Prompt */}
        {todayPrompt && (
          <section className="py-16 px-4 bg-[var(--bg-secondary)]">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-sm font-medium mb-6">
                ✦ Today&apos;s writing prompt
              </div>
              <blockquote className="font-serif text-2xl md:text-3xl font-medium italic mb-8 leading-relaxed">
                &ldquo;{todayPrompt.body}&rdquo;
              </blockquote>
              <Link href={`/prompts?prompt=${todayPrompt.id}`} className="btn btn-rose btn-lg" id="respond-to-prompt">
                <PenLine size={18} />
                Write a response
              </Link>
            </div>
          </section>
        )}

        {/* CTA — Join Community */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="card p-10 md:p-14 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-rose)]/5 via-transparent to-[var(--color-gold)]/5 pointer-events-none" />
              <Users size={36} className="mx-auto mb-4 text-[var(--color-rose)] opacity-80" />
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
                Your words have a home here.
              </h2>
              <p className="text-[var(--text-secondary)] mb-8 max-w-lg mx-auto">
                Join thousands of writers who share their love, grief, hope, and laughter
                through poetry. No judgment — just words.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup" className="btn btn-primary btn-lg" id="cta-join">
                  Join Unspoken
                  <ArrowRight size={18} />
                </Link>
                <Link href="/explore" className="btn btn-secondary btn-lg" id="cta-explore">
                  Read poetry first
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
