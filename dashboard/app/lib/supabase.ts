import { createClient } from '@supabase/supabase-js'

export function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
  created_at: string
}
