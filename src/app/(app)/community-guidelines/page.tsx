import { ShieldCheck, Heart, AlertCircle, Ban, MessageSquare } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Community Guidelines — Unspoken',
  description: 'Our principles for keeping Unspoken a safe, gentle, and respectful poetry sanctuary.',
}

export default function CommunityGuidelinesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4">
          <ShieldCheck size={14} />
          Safety & Sanctuary
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">Community Guidelines</h1>
        <p className="text-[var(--text-muted)] text-sm max-w-lg mx-auto">
          Unspoken is a home for raw feelings and fragile truths. We protect this space together.
        </p>
      </div>

      <div className="space-y-8">
        <section className="card p-6 md:p-8">
          <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Heart size={20} />
            1. Lead with Kindness and Empathy
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            People come to Unspoken during heartbreak, grief, solitude, and deep transformation. Treat every poem and author with gentle respect. Even if a style or perspective differs from your own, acknowledge the courage it takes to share.
          </p>
        </section>

        <section className="card p-6 md:p-8">
          <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2 text-[var(--color-primary)]">
            <MessageSquare size={20} />
            2. Thoughtful & Supportive Feedback
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Comments should offer resonance, encouragement, or constructive thoughts when requested. Mockery, sarcasm, cruelty, or dismissive remarks have no place here and will be removed.
          </p>
        </section>

        <section className="card p-6 md:p-8">
          <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2 text-amber-500">
            <AlertCircle size={20} />
            3. Content Warnings & Heavy Themes
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Poetry touches upon the darkest corners of human experience. When writing about grief, loss, or heavy emotional distress, please use mood indicators or note themes in your title or tags to let sensitive readers prepare themselves.
          </p>
        </section>

        <section className="card p-6 md:p-8">
          <h2 className="font-serif text-xl font-bold mb-3 flex items-center gap-2 text-rose-500">
            <Ban size={20} />
            4. Absolute Zero Tolerance
          </h2>
          <ul className="text-sm text-[var(--text-muted)] space-y-2 list-disc list-inside leading-relaxed">
            <li>Hate speech, racism, misogyny, homophobia, transphobia, or religious discrimination.</li>
            <li>Harassment, stalking, doxxing, or personal threats toward any user.</li>
            <li>Encouraging or glorifying self-harm or violence.</li>
            <li>Spam, commercial advertising, scams, or automated bot postings.</li>
            <li>Plagiarism — only post poems you personally wrote, or clearly credit the source if adapting folklore.</li>
          </ul>
        </section>

        <section className="card p-6 md:p-8 bg-[var(--bg-card)] border-zinc-500/20">
          <h2 className="font-serif text-xl font-bold mb-3">5. Moderation & Reporting</h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            If you encounter any content or comment that breaches these guidelines, please use the three-dot menu on the poem or profile to report it immediately. Our moderation team reviews all flagged items.
          </p>
        </section>
      </div>
    </div>
  )
}
