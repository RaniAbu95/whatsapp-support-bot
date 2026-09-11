'use client'

import { useState, useTransition } from 'react'
import { sendAgentMessage } from '@/app/actions'

export default function SendMessageForm({ ticketId }: { ticketId: string }) {
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = () => {
    const trimmed = content.trim()
    if (!trimmed) return
    setError(null)
    startTransition(async () => {
      try {
        await sendAgentMessage(ticketId, trimmed)
        setContent('')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'שגיאה בשליחת התשובה')
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit()
    }
  }

  return (
    <div className="mt-4">
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </div>
      )}
      <div className="flex gap-3 items-end glass-panel rounded-2xl p-2 pr-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="הקלד תשובה... (Ctrl+Enter לשליחה)"
          rows={3}
          disabled={isPending}
          className="flex-1 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none disabled:opacity-60 bg-transparent"
        />
        <button
          onClick={handleSubmit}
          disabled={isPending || !content.trim()}
          className="px-5 py-3 bg-gradient-to-l from-indigo-600 via-purple-600 to-pink-500 text-white text-sm font-medium rounded-xl hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 shadow-lg shadow-purple-600/20"
        >
          {isPending ? 'שולח...' : 'שלח תשובה'}
        </button>
      </div>
    </div>
  )
}
