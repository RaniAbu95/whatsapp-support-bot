'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseClient } from './lib/supabase'

export async function sendAgentMessage(ticketId: string, content: string) {
  const supabase = createSupabaseClient()
  const { error } = await supabase.from('messages').insert({
    ticket_id: ticketId,
    role: 'agent',
    content,
  })
  if (error) throw new Error(error.message)
  revalidatePath(`/tickets/${ticketId}`)
}
