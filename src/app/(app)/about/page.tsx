import Link from 'next/link'
import { Feather, Heart, Sparkles, BookOpen, ShieldCheck, PenLine } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Unspoken — For everything you couldn’t say out loud',
  description: 'Learn about the philosophy, mission, and heart behind Unspoken, the social poetry sanctuary.',
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mx-auto mb-6 border border-[var(--color-primary)]/20 shadow-sm">
          <Feather size={32} />
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
          For everything you couldn&apos;t say out loud.
        </h1>
        <p className="text-[var(--text-muted)] text-lg max-w-xl mx-auto leading-relaxed">
          Unspoken is a sanctuary for silent emotions, fleeting thoughts, heartbreak, hope, and vulnerability translated into poetry.
        </p>
      </div>

      {/* Main Philosophy */}
      <div className="space-y-12">
        <section className="card p-8">
          <h2 className="font-serif text-2xl font-bold mb-4 flex items-center gap-3">
            <Heart size={22} className="text-[var(--color-rose)]" />
            Why Unspoken Exists
          </h2>
          <p className="text-[var(--text-muted)] leading-relaxed mb-4">
            Modern social networks are built around curated spectacles, relentless algorithms, and visual performance.
            In the noise of short videos and polished highlights, the quietest, most poignant human experiences often have nowhere to live.
          </p>
          <p className="text-[var(--text-muted)] leading-relaxed">
            Unspoken was crafted to slow down time. Here, words take center stage.
            Whether it is grief you have never spoken to a friend, love you cannot confess, or a quiet revelation at 2:00 AM,
            this is a community that listens without judgment.
          </p>
        </section>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-gold)]/15 text-[var(--color-gold)] flex items-center justify-center mb-4">
              <Sparkles size={20} />
            </div>
            <h3 className="font-serif text-lg font-bold mb-2">Vulnerability First</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Use your name or an anonymous pen name. Write with raw honesty, shielded by a supportive and kind community.
            </p>
          </div>

          <div className="card p-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/15 text-[var(--color-primary)] flex items-center justify-center mb-4">
              <BookOpen size={20} />
            </div>
            <h3 className="font-serif text-lg font-bold mb-2">Typography & Mood</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Every poem is rendered with literary serif typography, emotional mood tags, and customizable card aesthetics.
            </p>
          </div>

          <div className="card p-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-serif text-lg font-bold mb-2">Gentle Social</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Meaningful connections over superficial metrics. Thoughtful discussions, respectful follows, and heartfelt bookmarks.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-8 border-t border-[var(--border-color)]">
          <h2 className="font-serif text-2xl font-bold mb-3">Your voice belongs here.</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-md mx-auto">
            Take a breath, choose your words, and leave a trace of your heart.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/write" className="btn-primary inline-flex items-center gap-2">
              <PenLine size={16} />
              Start Writing
            </Link>
            <Link href="/explore" className="btn-secondary">
              Explore Poems
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
