import { createClient } from '@supabase/supabase-js'

// רץ בצד שרת בלבד (Server Components / Server Actions) — המפתח עוקף RLS ואסור שיגיע לדפדפן
export function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
}

export type TicketStatus = 'open' | 'auto_resolved' | 'escalated' | 'closed'

export type Ticket = {
  id: string
  wa_phone: string
  status: TicketStatus
  created_at: string
}

export type Message = {
  id: string
  ticket_id: string
  role: 'user' | 'assistant' | 'agent'
  content: string
  confidence: number | null
  language?: string
  created_at: string
}
