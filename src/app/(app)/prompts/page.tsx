import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Sparkles, PenLine, Calendar, ChevronRight, MessageSquareQuote } from 'lucide-react'
import { format } from 'date-fns'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Daily Writing Prompts — Unspoken',
  description: 'Spark your poetic inspiration with daily reflective prompts and explore responses from fellow writers.',
}

export default async function PromptsPage() {
  const supabase = await createClient()

  // Fetch active prompt and past prompts
  const { data: prompts } = await supabase
    .from('writing_prompts')
    .select('*')
    .order('created_at', { ascending: false })

  const activePrompt = (prompts || []).find(p => p.is_active)
  const pastPrompts = (prompts || []).filter(p => !p.is_active || p.id !== activePrompt?.id)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)] text-xs font-medium mb-3 border border-[var(--color-gold)]/20">
          <Sparkles size={14} />
          <span>Daily Sparks</span>
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">Writing Prompts</h1>
        <p className="text-[var(--text-muted)] text-sm">
          A fresh spark of inspiration every day. Step beyond the silence and turn feeling into verse.
        </p>
      </div>

      {/* Featured / Today's Active Prompt */}
      {activePrompt && (
        <div className="card p-6 md:p-8 mb-12 bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-[var(--color-primary)]/5 border-[var(--color-primary)]/20 shadow-md">
          <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--color-primary)] text-white">
              <Sparkles size={12} /> Today&apos;s Prompt
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <Calendar size={13} />
              <span>{format(new Date(activePrompt.created_at), 'MMMM d, yyyy')}</span>
            </div>
          </div>

          <blockquote className="font-serif text-2xl md:text-3xl text-[var(--text-primary)] leading-relaxed italic mb-6">
            &ldquo;{activePrompt.body}&rdquo;
          </blockquote>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href={`/write?promptId=${activePrompt.id}`}
              className="btn-primary inline-flex items-center gap-2"
              id="respond-today-prompt-btn"
            >
              <PenLine size={16} />
              Write in Response
            </Link>
            <Link
              href={`/prompts/${activePrompt.id}`}
              className="btn-secondary inline-flex items-center gap-2"
            >
              Explore Responses
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Past Prompts Archive */}
      <div>
        <h2 className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
          <MessageSquareQuote size={18} className="text-[var(--color-primary)]" />
          Prompt Archive
        </h2>

        {pastPrompts.length === 0 && !activePrompt && (
          <div className="card p-12 text-center text-[var(--text-muted)]">
            <Sparkles size={32} className="mx-auto mb-3 opacity-40" />
            <p className="font-serif text-lg">No prompts available yet.</p>
            <p className="text-sm mt-1">Check back soon for new reflective writing sparks.</p>
          </div>
        )}

        <div className="space-y-4">
          {pastPrompts.map(prompt => (
            <div
              key={prompt.id}
              className="card p-5 md:p-6 transition-all hover:border-[var(--color-primary)]/40 hover:shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-2">
                    <Calendar size={12} />
                    <span>{format(new Date(prompt.created_at), 'MMM d, yyyy')}</span>
                  </div>
                  <p className="font-serif text-lg italic text-[var(--text-primary)]">
                    &ldquo;{prompt.body}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/write?promptId=${prompt.id}`}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-medium hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-1.5"
                  >
                    <PenLine size={13} />
                    Write
                  </Link>
                  <Link
                    href={`/prompts/${prompt.id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-xs font-medium hover:bg-[var(--color-primary)] hover:text-white transition-colors flex items-center gap-1"
                  >
                    Poems
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
