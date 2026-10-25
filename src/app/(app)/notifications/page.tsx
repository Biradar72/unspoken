import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AvatarDisplay } from '@/components/ui/AvatarDisplay'
import { formatDistanceToNow } from 'date-fns'
import { Bell, Heart, MessageCircle, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { MarkAllReadButton } from '@/components/notifications/MarkAllReadButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notifications',
}

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  like: <Heart size={16} className="text-[var(--color-rose)]" />,
  comment: <MessageCircle size={16} className="text-[var(--color-sage)]" />,
  follow: <UserPlus size={16} className="text-[var(--color-gold)]" />,
}

const NOTIFICATION_TEXT: Record<string, string> = {
  like: 'liked your poem',
  comment: 'commented on your poem',
  follow: 'started following you',
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/notifications')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*, actor:profiles!actor_id(username, display_name, avatar_url), poems(title)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Mark all as read
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  const items = notifications || []

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Bell size={24} className="text-[var(--color-rose)]" />
          <h1 className="font-serif text-2xl font-bold">Notifications</h1>
        </div>
        {items.length > 0 && <MarkAllReadButton userId={user.id} />}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Bell size={40} className="mx-auto mb-4 text-[var(--text-muted)] opacity-40" />
          <h3 className="font-serif text-xl font-semibold mb-2">All caught up</h3>
          <p className="text-[var(--text-muted)] text-sm">
            When someone likes or comments on your poems, or follows you, it will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-2 stagger-children">
          {items.map((notif: any) => (
            <div
              key={notif.id}
              className={`card p-4 flex items-start gap-4 transition-all ${
                !notif.is_read ? 'border-[var(--color-rose)]/30 bg-[var(--color-rose)]/3' : ''
              }`}
              id={`notification-${notif.id}`}
            >
              <Link href={`/profile/${notif.actor?.username}`} className="flex-shrink-0">
                <AvatarDisplay
                  src={notif.actor?.avatar_url}
                  name={notif.actor?.display_name || 'Unknown'}
                  size="md"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <Link href={`/profile/${notif.actor?.username}`} className="font-medium hover:text-[var(--color-rose)] transition-colors">
                    {notif.actor?.display_name}
                  </Link>
                  {' '}
                  {NOTIFICATION_TEXT[notif.type] || notif.type}
                  {notif.poems?.title && (
                    <>
                      {': '}
                      <Link href={`/poem/${notif.poem_id}`} className="text-[var(--color-rose)] hover:underline font-medium">
                        &ldquo;{notif.poems.title}&rdquo;
                      </Link>
                    </>
                  )}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                </p>
              </div>
              <div className="flex-shrink-0">
                {NOTIFICATION_ICONS[notif.type] || <Bell size={16} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
