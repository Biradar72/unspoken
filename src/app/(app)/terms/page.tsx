import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Unspoken',
  description: 'Terms governing the use of the Unspoken poetry platform.',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">Terms of Service</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">Last updated: October 2026</p>

      <div className="card p-6 md:p-8 space-y-6 text-sm text-[var(--text-muted)] leading-relaxed">
        <section>
          <h2 className="font-serif text-lg font-bold text-[var(--text-primary)] mb-2">1. Intellectual Property & Ownership</h2>
          <p>
            <strong>You own 100% of the poetry, words, and art you publish on Unspoken.</strong> By posting content on Unspoken, you grant us a non-exclusive license only to host, store, display, and format your work to other users according to the privacy and visibility settings you specify. We do not claim ownership of your writing.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-bold text-[var(--text-primary)] mb-2">2. Acceptable Conduct</h2>
          <p>
            By using Unspoken, you agree to comply with our Community Guidelines. You agree not to post abusive, harassing, infringing, or illegal material, and not to compromise the security or integrity of our infrastructure.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-bold text-[var(--text-primary)] mb-2">3. Moderation & Termination</h2>
          <p>
            We reserve the right to remove any content that violates our Community Guidelines or terms, and to suspend or terminate accounts that engage in persistent harassment or abuse.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-bold text-[var(--text-primary)] mb-2">4. Disclaimers</h2>
          <p>
            Unspoken is provided on an &ldquo;as is&rdquo; basis. While we strive to maintain uninterrupted service and reliable data preservation, we encourage writers to maintain personal backups of their creative literary work.
          </p>
        </section>
      </div>
    </div>
  )
}
