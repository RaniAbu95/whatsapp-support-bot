import type { TicketStatus } from './supabase'

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'פתוח',
  escalated: 'לא נפתר',
  auto_resolved: 'נפתר אוטומטית',
  closed: 'סגור',
}

export const STATUS_BADGE: Record<TicketStatus, string> = {
  open: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
  escalated: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
  auto_resolved: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  closed: 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200',
}

export const STATUS_DOT: Record<TicketStatus, string> = {
  open: 'bg-blue-500',
  escalated: 'bg-red-500',
  auto_resolved: 'bg-green-500',
  closed: 'bg-gray-400',
}

// פניות שמחכות לתגובה של נציג — מודגשות ברשימה
export function needsAgent(status: TicketStatus) {
  return status === 'escalated' || status === 'open'
}
