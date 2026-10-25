import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminDashboardClient } from './AdminDashboardClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin & Moderation — Unspoken',
  description: 'Unspoken platform management and content moderation.',
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/admin')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.is_admin) {
    redirect('/feed')
  }

  // Fetch metrics
  const [
    { count: totalUsers },
    { count: totalPoems },
    { count: totalComments },
    { count: pendingReportsCount },
    { data: reports },
    { data: prompts },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('poems').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase
      .from('reports')
      .select('*, profiles!reporter_id(username, display_name)')
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('writing_prompts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <AdminDashboardClient
        currentUserId={user.id}
        stats={{
          totalUsers: totalUsers || 0,
          totalPoems: totalPoems || 0,
          totalComments: totalComments || 0,
          pendingReports: pendingReportsCount || 0,
        }}
        initialReports={reports || []}
        initialPrompts={prompts || []}
      />
    </div>
  )
}
