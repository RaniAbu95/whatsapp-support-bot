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

export async function getMonthlyReport() {
  const supabase = createSupabaseClient()
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .gte('created_at', monthStart.toISOString())
    .lt('created_at', monthEnd.toISOString())

  if (!messages) return null

  const userMessages = messages.filter((m: any) => m.role === 'user')
  const assistantMessages = messages.filter((m: any) => m.role === 'assistant')

  const autoResolved = assistantMessages.filter((m: any) => m.confidence && m.confidence > 0.7).length
  const totalAssistantMessages = assistantMessages.length
  const escalated = totalAssistantMessages - autoResolved

  const languageCounts: Record<string, number> = {}
  userMessages.forEach((m: any) => {
    if (m.language) {
      languageCounts[m.language] = (languageCounts[m.language] || 0) + 1
    }
  })

  const confidenceScores = assistantMessages
    .filter((m: any) => m.confidence !== null)
    .map((m: any) => m.confidence)
  const avgConfidence = confidenceScores.length > 0
    ? (confidenceScores.reduce((a: number, b: number) => a + b, 0) / confidenceScores.length * 100).toFixed(1)
    : 0

  return {
    month: monthStart.toLocaleString('he-IL', { month: 'long', year: 'numeric' }),
    totalMessages: userMessages.length,
    respondedMessages: totalAssistantMessages,
    autoResolved,
    escalated,
    unanswered: userMessages.length - totalAssistantMessages,
    resolutionRate: totalAssistantMessages > 0 ? ((autoResolved / totalAssistantMessages) * 100).toFixed(1) : 0,
    languages: languageCounts,
    avgConfidence,
    timestamp: new Date().toISOString()
  }
}
