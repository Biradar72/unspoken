'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { AvatarDisplay } from '@/components/ui/AvatarDisplay'
import { User, Lock, Trash2, Upload, Shield, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function SettingsPage() {
  const { user, profile, signOut, refreshProfile } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'privacy'>('profile')
  const [form, setForm] = useState({
    display_name: '',
    pen_name: '',
    bio: '',
    website: '',
  })
  const [saving, setSaving] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || '',
        pen_name: profile.pen_name || '',
        bio: profile.bio || '',
        website: profile.website || '',
      })
    }
  }, [profile])

  if (!user || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-[var(--text-muted)]">Loading...</p>
      </div>
    )
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const saveProfile = async () => {
    if (!form.display_name.trim()) { toast.error('Display name is required'); return }
    setSaving(true)

    let avatarUrl = profile.avatar_url
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        avatarUrl = urlData.publicUrl
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: form.display_name.trim(),
        pen_name: form.pen_name.trim() || null,
        bio: form.bio.trim() || null,
        website: form.website.trim() || null,
        avatar_url: avatarUrl,
      })
      .eq('id', user.id)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Profile updated!')
      await refreshProfile()
    }
    setSaving(false)
  }

  const changePassword = async () => {
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password changed!')
      setNewPassword('')
      setConfirmPassword('')
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Delete your account? This action cannot be undone. All your poems and data will be permanently removed.')) return
    const { error } = await supabase.auth.admin.deleteUser(user.id).catch(() => ({ error: new Error('Contact support to delete your account') }))
    toast.error('Please contact support to delete your account: support@unspoken.app')
  }

  const TABS = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'account' as const, label: 'Account', icon: Lock },
    { id: 'privacy' as const, label: 'Privacy', icon: Shield },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-serif text-2xl font-bold mb-8">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[var(--bg-secondary)] rounded-xl mb-8 border border-[var(--border-color)]">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            id={`settings-tab-${id}`}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card p-6 space-y-6 animate-fade-in">
          {/* Avatar */}
          <div>
            <label className="label mb-3">Profile photo</label>
            <div className="flex items-center gap-4">
              <AvatarDisplay
                src={avatarPreview || profile.avatar_url}
                name={profile.display_name}
                size="xl"
              />
              <div>
                <label htmlFor="avatar-upload" className="btn btn-secondary btn-sm cursor-pointer">
                  <Upload size={14} />
                  Upload photo
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">JPG, PNG, GIF up to 5MB</p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="settings-display-name" className="label">Display name</label>
            <input
              id="settings-display-name"
              type="text"
              value={form.display_name}
              onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
              className="input"
              maxLength={60}
            />
          </div>

          <div>
            <label htmlFor="settings-pen-name" className="label">Pen name (optional)</label>
            <input
              id="settings-pen-name"
              type="text"
              value={form.pen_name}
              onChange={e => setForm(f => ({ ...f, pen_name: e.target.value }))}
              className="input"
              placeholder="The name you write under"
              maxLength={60}
            />
          </div>

          <div>
            <label htmlFor="settings-bio" className="label">Bio</label>
            <textarea
              id="settings-bio"
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              className="input resize-none"
              style={{ height: '100px' }}
              placeholder="Tell readers about yourself..."
              maxLength={300}
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">{form.bio.length}/300</p>
          </div>

          <div>
            <label htmlFor="settings-website" className="label">Website (optional)</label>
            <input
              id="settings-website"
              type="url"
              value={form.website}
              onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
              className="input"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="pt-2">
            <p className="text-sm text-[var(--text-muted)] mb-1">Username</p>
            <p className="font-mono text-sm bg-[var(--bg-tertiary)] px-3 py-2 rounded-lg">
              @{profile.username}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Usernames cannot be changed after registration.</p>
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="btn btn-primary w-full"
            id="save-profile-btn"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Save changes'}
          </button>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="space-y-6 animate-fade-in">
          <div className="card p-6">
            <h3 className="font-semibold mb-4">Change password</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="new-password-settings" className="label">New password</label>
                <input
                  id="new-password-settings"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="input"
                  placeholder="New password"
                />
              </div>
              <div>
                <label htmlFor="confirm-password-settings" className="label">Confirm password</label>
                <input
                  id="confirm-password-settings"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="input"
                  placeholder="Confirm new password"
                />
              </div>
              <button
                onClick={changePassword}
                disabled={saving}
                className="btn btn-primary"
                id="change-password-btn"
              >
                Update password
              </button>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-2">Sign out</h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">Sign out from all devices.</p>
            <button
              onClick={handleSignOut}
              className="btn btn-secondary"
              id="settings-sign-out"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>

          <div className="card p-6 border-red-200 dark:border-red-900">
            <h3 className="font-semibold text-red-500 mb-2">Delete account</h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Permanently delete your account and all your poems. This cannot be undone.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="btn border border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
              id="delete-account-btn"
            >
              <Trash2 size={16} />
              Delete account
            </button>
          </div>
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="card p-6 animate-fade-in space-y-5">
          <div className="space-y-4">
            <h3 className="font-semibold">Privacy settings</h3>
            <div className="space-y-2 text-sm text-[var(--text-secondary)]">
              <p>✓ Your email is never displayed publicly.</p>
              <p>✓ Private drafts are never visible to others or included in search.</p>
              <p>✓ Unlisted poems are accessible only via direct link.</p>
              <p>✓ You can block any user from your profile page.</p>
              <p>✓ You can report harmful content using the report button on any poem or comment.</p>
            </div>
          </div>
          <div className="border-t border-[var(--border-color)] pt-5 space-y-3">
            <Link href="/privacy" className="block text-sm text-[var(--color-rose)] hover:underline" id="view-privacy-policy">
              Privacy Policy →
            </Link>
            <Link href="/terms" className="block text-sm text-[var(--color-rose)] hover:underline" id="view-terms">
              Terms of Service →
            </Link>
            <Link href="/community-guidelines" className="block text-sm text-[var(--color-rose)] hover:underline" id="view-guidelines">
              Community Guidelines →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
