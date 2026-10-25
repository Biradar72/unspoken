import Link from 'next/link'
import { PenLine, Sparkles } from 'lucide-react'
import type { WritingPrompt } from '@/types/database'

export function WritingPromptBanner({ prompt }: { prompt: WritingPrompt }) {
  return (
    <div className="card p-5 mb-6 relative overflow-hidden border-l-4 border-[var(--color-gold)]">
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-gold)]/5 to-transparent pointer-events-none" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-[var(--color-gold)]" />
            <span className="text-xs font-semibold text-[var(--color-gold)] uppercase tracking-wide">
              Today&apos;s Writing Prompt
            </span>
          </div>
          <p className="font-serif italic text-[var(--text-primary)]">&ldquo;{prompt.body}&rdquo;</p>
        </div>
        <Link
          href={`/write?prompt=${prompt.id}`}
          className="btn btn-secondary btn-sm flex-shrink-0"
          id="respond-prompt-feed"
        >
          <PenLine size={14} />
          Respond
        </Link>
      </div>
    </div>
  )
}
