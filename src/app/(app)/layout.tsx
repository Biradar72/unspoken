import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Get unread notification count for navbar badge
  let unreadCount = 0
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
      unreadCount = count || 0
    }
  } catch {}

  return (
    <>
      <Navbar unreadCount={unreadCount} />
      <main className="min-h-screen pt-16">
        {children}
      </main>
      <Footer />
    </>
  )
}
