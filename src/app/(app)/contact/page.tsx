'use client'

import { Mail, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mx-auto mb-4 border border-[var(--color-primary)]/20 shadow-sm">
          <Mail size={26} />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">Get in Touch</h1>
        <p className="text-[var(--text-muted)] text-sm max-w-md mx-auto">
          Whether you have feedback, community suggestions, or a story to share, we are always listening.
        </p>
      </div>

      <div className="card p-6 md:p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1.5">Your Name</label>
          <input type="text" className="input-field" placeholder="Poet or Reader" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Email Address</label>
          <input type="email" className="input-field" placeholder="you@domain.com" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Message</label>
          <textarea
            className="input-field min-h-[140px] resize-none"
            placeholder="Share your thoughts, suggestions, or questions..."
          />
        </div>

        <button
          type="button"
          onClick={() => {
            toast.success('Thank you for reaching out! We will respond shortly.')
          }}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          <MessageSquare size={16} />
          Send Message
        </button>

        <p className="text-xs text-center text-[var(--text-muted)]">
          You can also reach us directly at <span className="text-[var(--color-primary)]">support@unspoken.app</span>
        </p>
      </div>
    </div>
  )
}
