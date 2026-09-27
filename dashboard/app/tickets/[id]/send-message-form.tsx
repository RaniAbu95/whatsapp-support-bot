'use client'

import { useRef, useState, useTransition } from 'react'
import { sendAgentMessage } from '@/app/actions'

const MAX_HEIGHT = 160

export default function SendMessageForm({ ticketId }: { ticketId: string }) {
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // השדה גדל עם הטקסט עד גובה מקסימלי, ואז נגלל
  const resize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`
  }

  const handleSubmit = () => {
    const trimmed = content.trim()
    if (!trimmed || isPending) return
    setError(null)
    startTransition(async () => {
      try {
        await sendAgentMessage(ticketId, trimmed)
        setContent('')
        requestAnimationFrame(resize)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'שגיאה בשליחת התשובה')
      }
    })
  }

  // Enter שולח, Shift+Enter יורד שורה — כמו בוואטסאפ
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="bg-white/90 border-t border-gray-200/60 px-3 md:px-4 py-3">
      {error && (
        <div className="mb-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </div>
      )}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            resize()
          }}
          onKeyDown={handleKeyDown}
          placeholder="כתוב הודעה ללקוח…"
          rows={1}
          dir="auto"
          disabled={isPending}
          className="flex-1 rounded-3xl bg-gray-100/80 px-4 py-2.5 text-[15px] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:bg-white disabled:opacity-60 transition-colors"
          style={{ maxHeight: MAX_HEIGHT }}
        />
        <button
          onClick={handleSubmit}
          disabled={isPending || !content.trim()}
          aria-label="שלח"
          className="w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 shadow-lg shadow-purple-600/25"
        >
          {isPending ? (
            <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          ) : (
            // האייקון מופנה שמאלה — כיוון השליחה בממשק RTL
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 -scale-x-100" aria-hidden="true">
              <path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12.6 2-12.6 2z" />
            </svg>
          )}
        </button>
      </div>
      <p className="hidden md:block text-[11px] text-gray-400 mt-1.5 px-2">
        Enter לשליחה · Shift+Enter לשורה חדשה · שליחת תשובה סוגרת את הפנייה
      </p>
    </div>
  )
}
