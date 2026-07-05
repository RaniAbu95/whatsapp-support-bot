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
  open: 'bg-blue-100 text-blue-800',
  escalated: 'bg-red-100 text-red-800',
  auto_resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

const ROLE_BUBBLE: Record<Message['role'], string> = {
  user: 'bg-gray-100 text-gray-900',
  assistant: 'bg-indigo-100 text-indigo-900',
  agent: 'bg-green-100 text-green-900',
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/"
          className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
          aria-label="חזור לרשימה"
        >
          ←
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{ticket.wa_phone}</h1>
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
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4 min-h-[300px]">
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
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${ROLE_BUBBLE[message.role]}`}>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-xs font-semibold opacity-60">{ROLE_LABEL[message.role]}</span>
          <span className="text-xs opacity-40">
            {new Date(message.created_at).toLocaleTimeString('he-IL', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {message.language && (isUser || message.role === 'assistant') && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-opacity-50 bg-purple-200 text-purple-800">
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
    pct >= 80 ? 'bg-green-200 text-green-800' : pct >= 50 ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${color}`}>
      {pct}%
    </span>
  )
}
