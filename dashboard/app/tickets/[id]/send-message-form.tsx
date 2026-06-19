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
    <div className="border-t border-gray-200 pt-4 mt-4">
      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <div className="flex gap-3 items-end">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="הקלד תשובה... (Ctrl+Enter לשליחה)"
          rows={3}
          disabled={isPending}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-60 bg-white"
        />
        <button
          onClick={handleSubmit}
          disabled={isPending || !content.trim()}
          className="px-5 py-3 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          {isPending ? 'שולח...' : 'שלח תשובה'}
        </button>
      </div>
    </div>
  )
}
