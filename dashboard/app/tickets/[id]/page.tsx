import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseClient, type Message, type TicketStatus } from '@/app/lib/supabase'
import { dayKey, formatDayLabel, formatPhone, formatTime } from '@/app/lib/format'
import { STATUS_BADGE, STATUS_DOT, STATUS_LABELS } from '@/app/lib/status'
import Avatar from '@/app/components/avatar'
import SendMessageForm from './send-message-form'

const ROLE_BUBBLE: Record<Message['role'], string> = {
  user: 'bg-white text-gray-900',
  assistant: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white',
  agent: 'bg-[#d9fdd3] text-gray-900',
}

const ROLE_LABEL: Record<Message['role'], string> = {
  user: 'לקוח',
  assistant: '🤖 בוט',
  agent: '🧑‍💼 נציג',
}

const LANGUAGE_NAMES: Record<string, string> = {
  he: 'עברית',
  en: 'English',
  ar: 'العربية',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ru: 'Русский',
  pt: 'Português',
  it: 'Italiano',
  ja: '日本語',
}

export default async function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createSupabaseClient()

  const [{ data: ticket }, { data: messages }] = await Promise.all([
    supabase.from('tickets').select('*').eq('id', id).single(),
    supabase
      .from('messages')
      .select('*')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true }),
  ])

  if (!ticket) notFound()

  const status = ticket.status as TicketStatus
  const list: Message[] = messages ?? []

  return (
    <div className="max-w-3xl mx-auto h-dvh md:px-4 md:py-6 flex flex-col">
      <div className="flex-1 min-h-0 flex flex-col glass-panel md:rounded-3xl overflow-hidden shadow-xl shadow-purple-500/10">
        {/* Header */}
        <header className="flex items-center gap-3 px-3 md:px-4 py-3 bg-white/90 border-b border-gray-200/60">
          <Link
            href="/"
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors shrink-0"
            aria-label="חזור לרשימה"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
          <Avatar phone={ticket.wa_phone} size="sm" dotClassName={STATUS_DOT[status] ?? 'bg-gray-400'} />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <h1 dir="ltr" className="font-bold text-gray-900 truncate">
                {formatPhone(ticket.wa_phone)}
              </h1>
              <span className="text-xs text-gray-400 shrink-0">#{ticket.id}</span>
            </div>
            <div className="text-xs text-gray-500 truncate">
              נפתחה {formatDayLabel(ticket.created_at)}, {formatTime(ticket.created_at)} · {list.length} הודעות
            </div>
          </div>
          <span
            className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
              STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-800'
            }`}
          >
            {STATUS_LABELS[status] ?? ticket.status}
          </span>
        </header>

        {/* Messages — flex-col-reverse שומר את הגלילה צמודה להודעה האחרונה בלי JS */}
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col-reverse chat-wallpaper">
          <div className="px-3 md:px-6 py-4">
            {list.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">אין הודעות בפנייה זו</div>
            ) : (
              list.map((msg, i) => {
                const prev = list[i - 1]
                const newDay = !prev || dayKey(prev.created_at) !== dayKey(msg.created_at)
                const startsGroup = newDay || prev.role !== msg.role
                return (
                  <div key={msg.id}>
                    {newDay && <DaySeparator date={msg.created_at} />}
                    <MessageBubble message={msg} startsGroup={startsGroup} />
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Composer */}
        <SendMessageForm ticketId={id} />
      </div>
    </div>
  )
}

function DaySeparator({ date }: { date: string }) {
  return (
    <div className="flex justify-center my-3">
      <span className="px-3 py-1 rounded-lg bg-white/90 text-[11px] font-medium text-gray-500 shadow-sm">
        {formatDayLabel(date)}
      </span>
    </div>
  )
}

function MessageBubble({ message, startsGroup }: { message: Message; startsGroup: boolean }) {
  const isUser = message.role === 'user'
  const onColor = message.role === 'assistant'
  const showLanguage = message.language && message.role !== 'agent'

  return (
    <div className={`flex flex-col ${isUser ? 'items-start' : 'items-end'} ${startsGroup ? 'mt-3' : 'mt-0.5'}`}>
      {startsGroup && !isUser && (
        <span className="text-[11px] font-semibold text-gray-500 mb-1 px-1">{ROLE_LABEL[message.role]}</span>
      )}
      <div
        className={`max-w-[80%] md:max-w-[70%] flex flex-wrap items-end gap-x-3 rounded-2xl px-3.5 pt-2 pb-1.5 shadow-sm ${ROLE_BUBBLE[message.role]} ${
          startsGroup ? (isUser ? 'rounded-tr-sm' : 'rounded-tl-sm') : ''
        }`}
      >
        <p dir="auto" className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <div
          className={`ms-auto flex items-center gap-1.5 translate-y-0.5 text-[11px] ${
            onColor ? 'text-white/70' : 'text-gray-400'
          }`}
        >
          {showLanguage && (
            <span className={`px-1.5 rounded ${onColor ? 'bg-white/15' : 'bg-gray-100'}`}>
              {LANGUAGE_NAMES[message.language!] || message.language}
            </span>
          )}
          {message.role === 'assistant' && message.confidence != null && (
            <ConfidenceBadge score={message.confidence} />
          )}
          <time dateTime={message.created_at}>
            {formatTime(message.created_at)}
          </time>
        </div>
      </div>
    </div>
  )
}

function ConfidenceBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const dot = pct >= 80 ? 'bg-green-300' : pct >= 50 ? 'bg-yellow-300' : 'bg-red-300'
  return (
    <span className="inline-flex items-center gap-1 px-1.5 rounded bg-white/15 font-semibold" title="רמת ביטחון של הבוט">
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {pct}%
    </span>
  )
}
