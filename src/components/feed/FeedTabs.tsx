'use client'

import Link from 'next/link'

const TABS = [
  { id: 'latest', label: 'Latest' },
  { id: 'following', label: 'Following' },
  { id: 'popular', label: 'Popular' },
]

export function FeedTabs({ activeTab }: { activeTab: string }) {
  return (
    <div className="flex gap-1 p-1 bg-[var(--bg-secondary)] rounded-xl mb-6 border border-[var(--border-color)]">
      {TABS.map(tab => (
        <Link
          key={tab.id}
          href={`/feed?tab=${tab.id}`}
          id={`feed-tab-${tab.id}`}
          className={`flex-1 text-center py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === tab.id
              ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
