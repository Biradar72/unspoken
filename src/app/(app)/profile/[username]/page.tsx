import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AvatarDisplay } from '@/components/ui/AvatarDisplay'
import { PoemCard } from '@/components/poems/PoemCard'
import { FollowButton } from '@/components/profile/FollowButton'
import { ProfileActions } from '@/components/profile/ProfileActions'
import Link from 'next/link'
import { Globe, Calendar, PenLine, BookOpen } from 'lucide-react'
import { format } from 'date-fns'
import type { Metadata } from 'next'

interface Props { params: { username: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('profiles').select('display_name, bio').eq('username', params.username).single()
    return {
      title: data?.display_name ? `${data.display_name} (@${params.username})` : `@${params.username}`,
      description: data?.bio || `Poems by @${params.username} on Unspoken`,
    }
  } catch {
    return { title: `@${params.username}` }
  }
}

export default async function ProfilePage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!profile) notFound()

  const isOwnProfile = user?.id === profile.id

  const [
    { count: followerCount },
    { count: followingCount },
    { count: poemCount },
    { data: isFollowingData },
    { data: poems },
  ] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
    supabase.from('poems').select('*', { count: 'exact', head: true })
      .eq('author_id', profile.id).eq('visibility', 'public').eq('status', 'published'),
    user
      ? supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', profile.id).single()
      : Promise.resolve({ data: null }),
    supabase.from('public_poems_with_stats').select('*')
      .eq('author_id', profile.id)
      .order('published_at', { ascending: false })
      .limit(20),
  ])

  const enrichedPoems = (poems || []).map(p => ({
    ...p,
    tags: Array.isArray(p.tags) ? p.tags : [],
    is_liked: false,
    is_bookmarked: false,
  }))

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Profile Header */}
      <div className="card p-8 mb-8 animate-fade-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <AvatarDisplay src={profile.avatar_url} name={profile.display_name} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="font-serif text-2xl font-bold">{profile.display_name}</h1>
                <p className="text-[var(--text-muted)]">
                  @{profile.username}
                  {profile.pen_name && (
                    <span className="ml-2 text-sm italic text-[var(--color-rose)]">
                      · pen name: {profile.pen_name}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <Link href="/settings" className="btn btn-secondary btn-sm" id="edit-profile-btn">
                    Edit profile
                  </Link>
                ) : user ? (
                  <>
                    <FollowButton
                      targetUserId={profile.id}
                      initialFollowing={!!isFollowingData}
                      currentUserId={user.id}
                    />
                    <ProfileActions
                      targetUserId={profile.id}
                      targetUsername={profile.username}
                    />
                  </>
                ) : (
                  <Link href="/login" className="btn btn-rose btn-sm">
                    Follow
                  </Link>
                )}
              </div>
            </div>

            {profile.bio && (
              <p className="mt-4 text-[var(--text-secondary)] leading-relaxed">{profile.bio}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-[var(--text-muted)]">
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[var(--color-rose)] transition-colors">
                  <Globe size={14} />
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                Joined {format(new Date(profile.created_at), 'MMMM yyyy')}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-6 pt-6 border-t border-[var(--border-color)]">
          <Link href={`/profile/${profile.username}/followers`} className="text-center hover:opacity-70 transition-opacity" id="follower-count">
            <div className="font-bold text-lg">{followerCount || 0}</div>
            <div className="text-xs text-[var(--text-muted)]">Followers</div>
          </Link>
          <Link href={`/profile/${profile.username}/following`} className="text-center hover:opacity-70 transition-opacity" id="following-count">
            <div className="font-bold text-lg">{followingCount || 0}</div>
            <div className="text-xs text-[var(--text-muted)]">Following</div>
          </Link>
          <div className="text-center">
            <div className="font-bold text-lg">{poemCount || 0}</div>
            <div className="text-xs text-[var(--text-muted)]">Poems</div>
          </div>
        </div>
      </div>

      {/* Poems Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl font-semibold flex items-center gap-2">
          <BookOpen size={18} className="text-[var(--color-rose)]" />
          Poems
        </h2>
        {isOwnProfile && (
          <Link href="/write" className="btn btn-rose btn-sm" id="write-new-poem-btn">
            <PenLine size={14} />
            Write new
          </Link>
        )}
      </div>

      {enrichedPoems.length > 0 ? (
        <div className="space-y-5 stagger-children">
          {enrichedPoems.map(poem => (
            <PoemCard key={poem.id} poem={poem} />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <PenLine size={32} className="mx-auto mb-4 text-[var(--text-muted)] opacity-50" />
          <h3 className="font-serif text-lg font-semibold mb-2">
            {isOwnProfile ? 'Write your first poem' : 'No poems yet'}
          </h3>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            {isOwnProfile
              ? 'Your published poems will appear here.'
              : `${profile.display_name} hasn't published any poems yet.`}
          </p>
          {isOwnProfile && (
            <Link href="/write" className="btn btn-rose" id="write-first-poem-btn">
              Start writing
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
