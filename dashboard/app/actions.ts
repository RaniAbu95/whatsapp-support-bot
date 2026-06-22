'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseClient } from './lib/supabase'

export async function sendAgentMessage(ticketId: string, content: string) {
  const supabase = createSupabaseClient()

  // שמור הודעת נציג
  const { error } = await supabase.from('messages').insert({
    ticket_id: ticketId,
    role: 'agent',
    content,
  })
  if (error) throw new Error(error.message)

  // מצא את מספר הטלפון של הלקוח
  const { data: ticket } = await supabase
    .from('tickets')
    .select('wa_phone')
    .eq('id', ticketId)
    .single()

  if (ticket?.wa_phone) {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${process.env.WA_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WA_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: ticket.wa_phone,
          type: 'text',
          text: { body: content },
        }),
      }
    )
    if (!res.ok) {
      const data = await res.json()
      throw new Error(`WhatsApp API failed: ${JSON.stringify(data)}`)
    }

    // עדכן סטטוס ל-closed
    await supabase.from('tickets').update({ status: 'closed' }).eq('id', ticketId)
  }

  revalidatePath(`/tickets/${ticketId}`)
}
