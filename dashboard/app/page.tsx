import Link from 'next/link'
import { createSupabaseClient, type Ticket, type TicketStatus } from './lib/supabase'
import { logout } from './login/actions'

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'פתוח',
  escalated: 'לא נפתר',
  auto_resolved: 'נפתר אוטומטית',
  closed: 'סגור',
}

const STATUS_BADGE: Record<TicketStatus, string> = {
  open: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
  escalated: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
  auto_resolved: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  closed: 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200',
}

const STATUS_DOT: Record<TicketStatus, string> = {
  open: 'bg-blue-500',
  escalated: 'bg-red-500',
  auto_resolved: 'bg-green-500',
  closed: 'bg-gray-400',
}

const FILTERS = [
  { value: 'all', label: 'הכל' },
  { value: 'open', label: 'פתוח' },
  { value: 'escalated', label: 'לא נפתר' },
  { value: 'auto_resolved', label: 'נפתר אוטומטית' },
  { value: 'closed', label: 'סגור' },
]

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const currentStatus = status || 'all'
  const supabase = createSupabaseClient()

  let query = supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false })

  if (currentStatus !== 'all') {
    query = query.eq('status', currentStatus)
  }

  const { data: tickets, error } = await query

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-10">
      <div className="flex items-center justify-between gap-3 mb-7 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-lg shadow-sm shadow-indigo-500/25">
            💬
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">פניות תמיכה</h1>
            <p className="text-xs text-gray-400">{tickets?.length ?? 0} פניות בסה&quot;כ</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/reports"
            className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors text-sm font-medium ring-1 ring-inset ring-purple-100"
          >
            📊 דוח חודשי
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            >
              התנתק
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6 bg-white/60 backdrop-blur-sm border border-gray-100 rounded-2xl p-1.5 w-fit shadow-sm">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === 'all' ? '/' : `/?status=${f.value}`}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
              currentStatus === f.value
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                : 'text-gray-500 hover:bg-white hover:text-gray-800'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {error ? (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-red-700">
          שגיאה בטעינת פניות
        </div>
      ) : !tickets || tickets.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white/60 rounded-2xl border border-dashed border-gray-200">
          <div className="text-3xl mb-2">🗂️</div>
          אין פניות להצגה
        </div>
      ) : (
        <div className="space-y-2.5">
          {tickets.map((ticket: Ticket) => (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              className="group flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-5 py-4 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0 ring-1 ring-indigo-100">
                  {ticket.wa_phone.slice(-2)}
                  <span
                    className={`absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full ring-2 ring-white ${
                      STATUS_DOT[ticket.status as TicketStatus] ?? 'bg-gray-400'
                    }`}
                  />
                </div>
                <div>
                  <div className="font-medium text-gray-900 group-hover:text-indigo-700 transition-colors">
                    {ticket.wa_phone}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {new Date(ticket.created_at).toLocaleString('he-IL')}
                  </div>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  STATUS_BADGE[ticket.status as TicketStatus] ?? 'bg-gray-100 text-gray-800'
                }`}
              >
                {STATUS_LABELS[ticket.status as TicketStatus] ?? ticket.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
