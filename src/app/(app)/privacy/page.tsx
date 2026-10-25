import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Unspoken',
  description: 'How Unspoken protects your data, personal identity, and privacy.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">Last updated: October 2026</p>

      <div className="card p-6 md:p-8 space-y-6 text-sm text-[var(--text-muted)] leading-relaxed">
        <section>
          <h2 className="font-serif text-lg font-bold text-[var(--text-primary)] mb-2">1. Overview</h2>
          <p>
            At Unspoken, we understand that writing is deeply personal and often vulnerable. Your trust is the foundation of this sanctuary. We do not sell your personal data or your poetry to advertisers or third-party data brokers.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-bold text-[var(--text-primary)] mb-2">2. Information We Collect</h2>
          <p>
            When you register, we collect your email address and username to manage authentication and security. Any profile information you choose to provide (display name, pen name, bio, website) is stored to present your author identity as you direct.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-lg font-bold text-[var(--text-primary)] mb-2">3. Visibility & Control</h2>
          <p>
            You have full control over the visibility of your poems:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Public:</strong> Visible on the feed, explore page, and your author profile.</li>
            <li><strong>Unlisted:</strong> Only accessible to people who possess the direct link.</li>
            <li><strong>Private:</strong> Visible strictly to you when signed into your account.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-lg font-bold text-[var(--text-primary)] mb-2">4. Your Right to Delete</h2>
          <p>
            You can delete your poems, comments, or your entire Unspoken account at any time via your Settings page. Deletion is irreversible and purges your content from our active database.
          </p>
        </section>
      </div>
    </div>
  )
}
