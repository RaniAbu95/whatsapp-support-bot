import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseClient, type Message, type TicketStatus } from '@/app/lib/supabase'
import SendMessageForm from './send-message-form'

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'פתוח',
  escalated: 'הסלמה',
  auto_resolved: 'נפתר אוטומטית',
  closed: 'סגור',
}

const STATUS_BADGE: Record<TicketStatus, string> = {
  open: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
  escalated: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
  auto_resolved: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  closed: 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200',
}

const ROLE_BUBBLE: Record<Message['role'], string> = {
  user: 'bg-white/80 text-gray-900',
  assistant: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white',
  agent: 'bg-gradient-to-br from-green-500 to-emerald-600 text-white',
}

const ROLE_LABEL: Record<Message['role'], string> = {
  user: 'לקוח',
  assistant: 'בוט',
  agent: 'נציג',
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/"
          className="w-9 h-9 flex items-center justify-center rounded-xl glass-panel text-gray-400 hover:text-indigo-600 hover:shadow-md transition-all shrink-0"
          aria-label="חזור לרשימה"
        >
          ←
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-extrabold bg-gradient-to-l from-indigo-700 via-purple-700 to-pink-600 bg-clip-text text-transparent">
              {ticket.wa_phone}
            </h1>
            <span
              className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold ${
                STATUS_BADGE[ticket.status as TicketStatus] ?? 'bg-gray-100 text-gray-800'
              }`}
            >
              {STATUS_LABELS[ticket.status as TicketStatus] ?? ticket.status}
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            נפתח: {new Date(ticket.created_at).toLocaleString('he-IL')}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="glass-panel rounded-2xl p-4 space-y-4 min-h-[300px]">
        {!messages || messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">אין הודעות בפנייה זו</div>
        ) : (
          messages.map((msg: Message) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
      </div>

      {/* Send form */}
      <SendMessageForm ticketId={id} />
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  const languageNames: Record<string, string> = {
    'he': 'עברית',
    'en': 'English',
    'ar': 'العربية',
    'es': 'Español',
    'fr': 'Français',
    'de': 'Deutsch',
    'ru': 'Русский',
    'pt': 'Português',
    'it': 'Italiano',
    'ja': '日本語',
  }

  return (
    <div className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser ? 'rounded-tr-md' : 'rounded-tl-md'
        } ${ROLE_BUBBLE[message.role]}`}
      >
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-semibold opacity-70">{ROLE_LABEL[message.role]}</span>
          <span className="text-xs opacity-50">
            {new Date(message.created_at).toLocaleTimeString('he-IL', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {message.language && (isUser || message.role === 'assistant') && (
            <span className="text-xs px-1.5 py-0.5 rounded-md bg-black/10 font-medium">
              {languageNames[message.language] || message.language}
            </span>
          )}
          {message.role === 'assistant' && message.confidence != null && (
            <ConfidenceBadge score={message.confidence} />
          )}
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}

function ConfidenceBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const color =
    pct >= 80
      ? 'bg-green-400/25 text-green-50'
      : pct >= 50
        ? 'bg-yellow-400/25 text-yellow-50'
        : 'bg-red-400/25 text-red-50'
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold ${color}`}>
      {pct}%
    </span>
  )
}
