'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface FollowButtonProps {
  targetUserId: string
  initialFollowing: boolean
  currentUserId: string
}

export function FollowButton({ targetUserId, initialFollowing, currentUserId }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleToggle = async () => {
    setLoading(true)
    const newFollowing = !following
    setFollowing(newFollowing)

    if (newFollowing) {
      const { error } = await supabase.from('follows').insert({
        follower_id: currentUserId,
        following_id: targetUserId,
      })
      if (error) {
        setFollowing(!newFollowing)
        toast.error(error.message)
      } else {
        toast.success('Following!')
      }
    } else {
      await supabase.from('follows').delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
      toast.success('Unfollowed')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      id={`follow-btn-${targetUserId}`}
      className={`btn btn-sm transition-all ${
        following
          ? 'btn-secondary border-[var(--color-rose)] text-[var(--color-rose)]'
          : 'btn-rose'
      }`}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : following ? 'Following' : 'Follow'}
    </button>
  )
}
