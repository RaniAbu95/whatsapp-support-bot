import Link from 'next/link'
import { createSupabaseClient, type Ticket, type TicketStatus } from './lib/supabase'

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'פתוח',
  escalated: 'לא נפתר',
  auto_resolved: 'נפתר אוטומטית',
  closed: 'סגור',
}

const STATUS_BADGE: Record<TicketStatus, string> = {
  open: 'bg-blue-100 text-blue-800',
  escalated: 'bg-red-100 text-red-800',
  auto_resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">פניות תמיכה</h1>
        <span className="text-sm text-gray-500">{tickets?.length ?? 0} פניות</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === 'all' ? '/' : `/?status=${f.value}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              currentStatus === f.value
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
          שגיאה בטעינת פניות
        </div>
      ) : !tickets || tickets.length === 0 ? (
        <div className="text-center py-16 text-gray-400">אין פניות להצגה</div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket: Ticket) => (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                  {ticket.wa_phone.slice(-2)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{ticket.wa_phone}</div>
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
