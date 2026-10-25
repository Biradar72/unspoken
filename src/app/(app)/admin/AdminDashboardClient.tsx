'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  ShieldAlert,
  Users,
  BookOpen,
  MessageCircle,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Stats {
  totalUsers: number
  totalPoems: number
  totalComments: number
  pendingReports: number
}

interface ReportItem {
  id: string
  reporter_id: string
  poem_id: string | null
  comment_id: string | null
  reported_user_id: string | null
  reason: string
  description: string | null
  status: string
  created_at: string
  profiles?: {
    username: string
    display_name: string
  }
}

interface PromptItem {
  id: string
  body: string
  is_active: boolean
  active_date: string | null
  created_at: string
}

interface AdminDashboardClientProps {
  currentUserId: string
  stats: Stats
  initialReports: any[]
  initialPrompts: PromptItem[]
}

export function AdminDashboardClient({
  currentUserId,
  stats: initialStats,
  initialReports,
  initialPrompts,
}: AdminDashboardClientProps) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'reports' | 'prompts'>('reports')
  const [reports, setReports] = useState<ReportItem[]>(initialReports)
  const [prompts, setPrompts] = useState<PromptItem[]>(initialPrompts)
  const [stats, setStats] = useState(initialStats)

  // New prompt form state
  const [newPromptText, setNewPromptText] = useState('')
  const [creatingPrompt, setCreatingPrompt] = useState(false)

  // Report actions
  const handleUpdateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus })
        .eq('id', reportId)

      if (error) throw error

      setReports(prev =>
        prev.map(r => (r.id === reportId ? { ...r, status: newStatus } : r))
      )
      if (newStatus !== 'pending') {
        setStats(s => ({ ...s, pendingReports: Math.max(0, s.pendingReports - 1) }))
      }
      toast.success(`Report marked as ${newStatus}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update report')
    }
  }

  // Take moderation action on reported poem
  const handleArchivePoem = async (poemId: string, reportId: string) => {
    try {
      const { error } = await supabase
        .from('poems')
        .update({ status: 'archived', visibility: 'private' })
        .eq('id', poemId)

      if (error) throw error

      await handleUpdateReportStatus(reportId, 'action_taken')
      toast.success('Poem archived and removed from public feeds')
    } catch (err: any) {
      toast.error(err.message || 'Failed to archive poem')
    }
  }

  // Create prompt
  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPromptText.trim()) return

    setCreatingPrompt(true)
    try {
      // First, deactivate any currently active prompt if this one is made active
      await supabase
        .from('writing_prompts')
        .update({ is_active: false })
        .eq('is_active', true)

      const { data, error } = await supabase
        .from('writing_prompts')
        .insert({
          body: newPromptText.trim(),
          is_active: true,
          created_by: currentUserId,
          active_date: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      setPrompts(prev => [data, ...prev.map(p => ({ ...p, is_active: false }))])
      setNewPromptText('')
      toast.success('New daily prompt published and set active!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to create prompt')
    } finally {
      setCreatingPrompt(false)
    }
  }

  // Toggle prompt active
  const handleTogglePromptActive = async (promptId: string, currentActive: boolean) => {
    try {
      if (!currentActive) {
        // Set all others inactive
        await supabase.from('writing_prompts').update({ is_active: false }).neq('id', promptId)
      }
      const { error } = await supabase
        .from('writing_prompts')
        .update({ is_active: !currentActive })
        .eq('id', promptId)

      if (error) throw error

      setPrompts(prev =>
        prev.map(p => {
          if (p.id === promptId) return { ...p, is_active: !currentActive }
          if (!currentActive) return { ...p, is_active: false }
          return p
        })
      )
      toast.success(`Prompt ${!currentActive ? 'activated' : 'deactivated'}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update prompt')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-semibold mb-2">
            <ShieldAlert size={13} />
            Platform Moderation
          </div>
          <h1 className="font-serif text-3xl font-bold">Admin Sanctuary</h1>
          <p className="text-[var(--text-muted)] text-sm">
            Guard community safety, resolve user reports, and curate writing sparks.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Writers</span>
            <Users size={16} className="text-[var(--color-primary)]" />
          </div>
          <p className="font-serif text-2xl font-bold">{stats.totalUsers}</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Poems Written</span>
            <BookOpen size={16} className="text-[var(--color-gold)]" />
          </div>
          <p className="font-serif text-2xl font-bold">{stats.totalPoems}</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Comments</span>
            <MessageCircle size={16} className="text-emerald-500" />
          </div>
          <p className="font-serif text-2xl font-bold">{stats.totalComments}</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Reports</span>
            <AlertTriangle size={16} className="text-amber-500" />
          </div>
          <p className="font-serif text-2xl font-bold text-amber-500">{stats.pendingReports}</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-[var(--border-color)] mb-6 gap-6">
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <ShieldAlert size={16} />
          Reports Queue ({reports.filter(r => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('prompts')}
          className={`pb-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'prompts'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Sparkles size={16} />
          Writing Prompts Manager ({prompts.length})
        </button>
      </div>

      {/* Reports Tab Content */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="card p-12 text-center text-[var(--text-muted)]">
              <CheckCircle size={36} className="mx-auto mb-3 text-emerald-500 opacity-60" />
              <p className="font-serif text-lg font-medium text-[var(--text-primary)]">Clean Horizon</p>
              <p className="text-sm mt-1">There are no reports requiring review at this time.</p>
            </div>
          ) : (
            reports.map(report => (
              <div
                key={report.id}
                className={`card p-5 transition-all ${
                  report.status === 'pending'
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : 'opacity-80'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          report.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : report.status === 'action_taken'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}
                      >
                        {report.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        Reported {format(new Date(report.created_at), 'MMM d, yyyy · HH:mm')}
                      </span>
                    </div>

                    <div className="text-sm font-semibold">
                      Reason: <span className="font-normal text-[var(--text-primary)]">{report.reason}</span>
                    </div>

                    {report.description && (
                      <p className="text-xs text-[var(--text-muted)] italic bg-[var(--bg-tertiary)] p-2.5 rounded-md">
                        &ldquo;{report.description}&rdquo;
                      </p>
                    )}

                    <div className="text-xs text-[var(--text-muted)] flex items-center gap-3">
                      {report.poem_id && (
                        <Link
                          href={`/poem/${report.poem_id}`}
                          target="_blank"
                          className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
                        >
                          View Target Poem <ExternalLink size={12} />
                        </Link>
                      )}
                      {report.reported_user_id && (
                        <span>Target User ID: {report.reported_user_id}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {report.status === 'pending' && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {report.poem_id && (
                        <button
                          onClick={() => handleArchivePoem(report.poem_id!, report.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-medium flex items-center gap-1"
                        >
                          <Trash2 size={13} />
                          Archive Poem
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateReportStatus(report.id, 'dismissed')}
                        className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-medium hover:bg-[var(--bg-tertiary)] flex items-center gap-1"
                      >
                        <XCircle size={13} />
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleUpdateReportStatus(report.id, 'reviewed')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-medium flex items-center gap-1"
                      >
                        <CheckCircle size={13} />
                        Mark Reviewed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Prompts Tab Content */}
      {activeTab === 'prompts' && (
        <div className="space-y-6">
          {/* Create Prompt Form */}
          <form onSubmit={handleCreatePrompt} className="card p-6 border-[var(--color-primary)]/30">
            <h3 className="font-serif text-lg font-bold mb-2 flex items-center gap-2">
              <Plus size={18} className="text-[var(--color-primary)]" />
              Publish New Daily Prompt
            </h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Enter a reflective, evocative question or poetic premise. Submitting will set this prompt as active for all writers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                className="input-field flex-1"
                placeholder="e.g. Write about a door you closed, but never truly locked..."
                value={newPromptText}
                onChange={e => setNewPromptText(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={creatingPrompt || !newPromptText.trim()}
                className="btn-primary flex items-center justify-center gap-2 flex-shrink-0"
              >
                <Sparkles size={15} />
                {creatingPrompt ? 'Publishing...' : 'Set as Active Prompt'}
              </button>
            </div>
          </form>

          {/* Prompts List */}
          <div className="space-y-3">
            {prompts.map(prompt => (
              <div
                key={prompt.id}
                className={`card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  prompt.is_active ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {prompt.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-[var(--color-gold)] text-black">
                        Active Today
                      </span>
                    )}
                    <span className="text-xs text-[var(--text-muted)]">
                      {format(new Date(prompt.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="font-serif text-base italic text-[var(--text-primary)]">
                    &ldquo;{prompt.body}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/prompts/${prompt.id}`}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-medium hover:bg-[var(--bg-tertiary)]"
                  >
                    View Responses
                  </Link>
                  <button
                    onClick={() => handleTogglePromptActive(prompt.id, prompt.is_active)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      prompt.is_active
                        ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        : 'bg-[var(--color-primary)] text-white hover:opacity-90'
                    }`}
                  >
                    {prompt.is_active ? 'Deactivate' : 'Make Active'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
