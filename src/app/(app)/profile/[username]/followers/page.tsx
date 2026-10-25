import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AvatarDisplay } from '@/components/ui/AvatarDisplay'
import { ArrowLeft, Users } from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  params: { username: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Followers of @${params.username} — Unspoken`,
  }
}

export default async function FollowersPage({ params }: Props) {
  const supabase = await createClient()

  // Get target user profile
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('id, username, display_name')
    .eq('username', params.username)
    .single()

  if (!targetProfile) notFound()

  // Fetch followers
  const { data: follows } = await supabase
    .from('follows')
    .select('follower_id, profiles!follower_id(id, username, display_name, pen_name, avatar_url, bio)')
    .eq('following_id', targetProfile.id)

  const followers = (follows || []).map((f: any) => f.profiles).filter(Boolean)

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link
        href={`/profile/${params.username}`}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to @{params.username}
      </Link>

      <div className="flex items-center gap-2 mb-6">
        <Users size={20} className="text-[var(--color-primary)]" />
        <h1 className="font-serif text-2xl font-bold">
          Followers of {targetProfile.display_name}
        </h1>
      </div>

      {followers.length === 0 ? (
        <div className="card p-12 text-center text-[var(--text-muted)]">
          <p className="font-serif text-base">No followers yet.</p>
        </div>
      ) : (
        <div className="card divide-y divide-[var(--border-color)]">
          {followers.map((author: any) => (
            <div key={author.id} className="p-4 flex items-center justify-between gap-4">
              <Link
                href={`/profile/${author.username}`}
                className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
              >
                <AvatarDisplay src={author.avatar_url} name={author.display_name} size="md" />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{author.display_name}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    @{author.username}
                    {author.pen_name && (
                      <span className="italic text-[var(--color-rose)] ml-1">· {author.pen_name}</span>
                    )}
                  </p>
                  {author.bio && (
                    <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{author.bio}</p>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
