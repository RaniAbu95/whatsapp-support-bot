import Link from 'next/link'
import { createSupabaseClient, type Message, type Ticket, type TicketStatus } from './lib/supabase'
import { logout } from './login/actions'
import { dayKey, formatDayLabel, formatListTime, formatPhone } from './lib/format'
import { STATUS_BADGE, STATUS_DOT, STATUS_LABELS, needsAgent } from './lib/status'
import Avatar from './components/avatar'

const TICKETS_LIMIT = 200
// מספיק הודעות אחרונות כדי למצוא את ההודעה האחרונה של הלקוח לתצוגה מקדימה
const PREVIEW_MESSAGES = 4

const FILTERS = [
  { value: 'all', label: 'הכל' },
  { value: 'open', label: 'פתוח' },
  { value: 'escalated', label: 'לא נפתר' },
  { value: 'auto_resolved', label: 'נפתר אוטומטית' },
  { value: 'closed', label: 'סגור' },
]

const ROLE_PREFIX: Record<Message['role'], string> = {
  user: '',
  assistant: 'בוט: ',
  agent: 'נציג: ',
}

type TicketRow = Ticket & {
  messages: Pick<Message, 'role' | 'content' | 'created_at'>[]
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const currentStatus = status || 'all'
  const supabase = createSupabaseClient()

  // רק העמודות שמוצגות + הגבלת כמות, כדי שהעמוד לא יאט ככל שהטבלה גדלה.
  // ההודעות האחרונות של כל פנייה נשלפות באותה שאילתה לתצוגה המקדימה
  let query = supabase
    .from('tickets')
    .select('id, wa_phone, status, created_at, messages(role, content, created_at)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('created_at', { referencedTable: 'messages', ascending: false })
    .limit(PREVIEW_MESSAGES, { referencedTable: 'messages' })
    .limit(TICKETS_LIMIT)

  if (currentStatus !== 'all') {
    query = query.eq('status', currentStatus)
  }

  const { data, count, error } = await query
  const tickets = (data ?? []) as TicketRow[]

  // קיבוץ לפי יום, כמו מפרידי התאריכים בצ'אט
  const groups: { key: string; label: string; tickets: TicketRow[] }[] = []
  for (const ticket of tickets) {
    const key = dayKey(ticket.created_at)
    const last = groups[groups.length - 1]
    if (last?.key === key) last.tickets.push(ticket)
    else groups.push({ key, label: formatDayLabel(ticket.created_at), tickets: [ticket] })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-10">
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-lg shadow-lg shadow-purple-500/25 ring-4 ring-white/50">
            💬
          </div>
          <div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-l from-indigo-700 via-purple-700 to-pink-600 bg-clip-text text-transparent leading-tight">
              פניות תמיכה
            </h1>
            <p className="text-xs text-gray-500">{count ?? tickets.length} פניות בסה&quot;כ</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/reports"
            className="px-4 py-2 rounded-xl glass-panel text-purple-700 hover:shadow-md transition-all text-sm font-semibold"
          >
            📊 דוח חודשי
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl text-sm text-gray-500 hover:bg-white/60 transition-colors"
            >
              התנתק
            </button>
          </form>
        </div>
      </div>

      <div className="glass-panel rounded-3xl shadow-xl shadow-purple-500/5 overflow-clip">
        {/* סינון לפי סטטוס */}
        <div className="flex gap-1.5 p-3 border-b border-gray-200/60 overflow-x-auto">
          {FILTERS.map((f) => (
            <Link
              key={f.value}
              href={f.value === 'all' ? '/' : `/?status=${f.value}`}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                currentStatus === f.value
                  ? 'bg-gradient-to-l from-indigo-600 to-purple-600 text-white shadow-md shadow-purple-600/25'
                  : 'bg-white/60 text-gray-600 hover:bg-white hover:text-gray-900'
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {error ? (
          <div className="m-4 rounded-xl bg-red-50/80 border border-red-100 p-4 text-red-700">
            שגיאה בטעינת פניות
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-3xl mb-2">🗂️</div>
            אין פניות להצגה
          </div>
        ) : (
          groups.map((group) => (
            <section key={group.key}>
              <div className="sticky top-0 z-10 px-5 py-1.5 text-xs font-semibold text-gray-500 bg-white/85 border-b border-gray-200/50">
                {group.label}
              </div>
              <ul className="divide-y divide-gray-200/50">
                {group.tickets.map((ticket) => (
                  <li key={ticket.id}>
                    <ConversationRow ticket={ticket} />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  )
}

function ConversationRow({ ticket }: { ticket: TicketRow }) {
  const status = ticket.status as TicketStatus
  const lastMessage = ticket.messages[0]
  // עדיפות להודעה של הלקוח — היא מסבירה על מה הפנייה
  const preview = ticket.messages.find((m) => m.role === 'user') ?? lastMessage
  const urgent = needsAgent(status)

  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className="group flex items-center gap-3.5 px-4 md:px-5 hover:bg-indigo-50/60 transition-colors"
    >
      <Avatar phone={ticket.wa_phone} dotClassName={STATUS_DOT[status] ?? 'bg-gray-400'} />

      <div className="flex-1 min-w-0 py-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex items-baseline gap-2 min-w-0">
            <span dir="ltr" className="font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
              {formatPhone(ticket.wa_phone)}
            </span>
            <span className="text-xs text-gray-400 shrink-0">#{ticket.id}</span>
          </div>
          <span className={`text-xs shrink-0 ${urgent ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
            {formatListTime(lastMessage?.created_at ?? ticket.created_at)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 mt-1">
          <p className={`text-sm truncate ${urgent ? 'text-gray-800' : 'text-gray-500'}`}>
            {preview ? (
              <>
                {preview.role !== 'user' && (
                  <span className="text-gray-400">{ROLE_PREFIX[preview.role]}</span>
                )}
                <bdi>{preview.content}</bdi>
              </>
            ) : (
              <span className="italic text-gray-400">אין הודעות</span>
            )}
          </p>
          <span
            className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
              STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-800'
            }`}
          >
            {STATUS_LABELS[status] ?? ticket.status}
          </span>
        </div>
      </div>
    </Link>
  )
}
