'use client'

import { useState } from 'react'
import { MoreHorizontal, Flag, Ban } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import toast from 'react-hot-toast'

interface ProfileActionsProps {
  targetUserId: string
  targetUsername: string
}

export function ProfileActions({ targetUserId, targetUsername }: ProfileActionsProps) {
  const [open, setOpen] = useState(false)
  const [blocking, setBlocking] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const handleBlock = async () => {
    if (!user || !confirm(`Block @${targetUsername}? They won't be able to see your content.`)) return
    setBlocking(true)
    const { error } = await supabase.from('blocked_users').insert({
      blocker_id: user.id,
      blocked_id: targetUserId,
    })
    if (error) {
      toast.error('Could not block user')
    } else {
      toast.success(`@${targetUsername} has been blocked`)
    }
    setBlocking(false)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-ghost p-2"
        id={`profile-options-${targetUserId}`}
        aria-label="Profile options"
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-10 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-lg py-1 z-10">
          <Link
            href={`/report?user=${targetUserId}`}
            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[var(--bg-tertiary)] transition-colors"
            onClick={() => setOpen(false)}
          >
            <Flag size={15} />
            Report @{targetUsername}
          </Link>
          <button
            onClick={handleBlock}
            disabled={blocking}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            <Ban size={15} />
            Block @{targetUsername}
          </button>
        </div>
      )}
    </div>
  )
}
