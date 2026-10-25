'use client'

import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export function MarkAllReadButton({ userId }: { userId: string }) {
  const supabase = createClient()
  const handleClick = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId)
    toast.success('All marked as read')
  }
  return (
    <button onClick={handleClick} className="btn btn-ghost text-sm text-[var(--text-muted)]" id="mark-all-read">
      Mark all read
    </button>
  )
}
