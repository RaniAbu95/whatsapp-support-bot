export interface Env {
  GEMINI_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  VERIFY_TOKEN: string;
  WA_TOKEN: string;
  WA_PHONE_NUMBER_ID: string;
}

async function supabase(env: Env, path: string, method = 'GET', body?: object) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=representation' : ''
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}


async function getOrCreateTicket(env: Env, phone: string): Promise<number> {
  // חפש כרטיס פתוח קיים
  const existing = await supabase(env, `tickets?wa_phone=eq.${phone}&status=eq.open&limit=1`) as any[];
  if (existing.length > 0) return existing[0].id;

  // צור כרטיס חדש
  const created = await supabase(env, 'tickets', 'POST', { wa_phone: phone, status: 'open' }) as any[];
  return created[0].id;
}

async function saveMessage(env: Env, ticketId: number, role: string, content: string, confidence?: number) {
  await supabase(env, 'messages', 'POST', { ticket_id: ticketId, role, content, confidence });
}

async function getKnowledgeBase(env: Env): Promise<string> {
  const rows = await supabase(env, 'knowledge_base?select=question,answer') as any[];
  return rows.map(r => `ש: ${r.question}\nת: ${r.answer}`).join('\n\n');
}

async function sendWhatsAppMessage(env: Env, to: string, text: string) {
  const res = await fetch(`https://graph.facebook.com/v19.0/${env.WA_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.WA_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });
  const data = await res.json();
  console.log('WhatsApp API response:', JSON.stringify(data));
}

async function askGemini(message: string, knowledgeBase: string, apiKey: string): Promise<{answer: string, confidence: number}> {
  const prompt = `אתה עוזר תמיכת לקוחות. ענה בעברית בלבד.

ספר התשובות שלך:
${knowledgeBase}

שאלת הלקוח: "${message}"

החזר JSON בלבד עם שדות:
- answer: התשובה לשאלה
- confidence: מספר בין 0 ל-1 כמה אתה בטוח בתשובה

אם השאלה לא קיימת בספר התשובות — תן confidence נמוך מ-0.7`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    }
  );
  const data = await res.json() as any;
  return JSON.parse(data.candidates[0].content.parts[0].text);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {

    if (request.method === 'GET') {
      const url = new URL(request.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');
      if (mode === 'subscribe' && token === env.VERIFY_TOKEN) {
        return new Response(challenge, { status: 200 });
      }
      return new Response('Forbidden', { status: 403 });
    }

    if (request.method === 'POST') {
      const body = await request.json() as any;
      const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;
      const phone = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from || 'test-user';
      if (!message) return new Response('OK', { status: 200 });

      // שמור כרטיס + הודעת לקוח
      const ticketId = await getOrCreateTicket(env, phone);
      await saveMessage(env, ticketId, 'user', message);

      // שאל את Gemini
      const knowledgeBase = await getKnowledgeBase(env);
      const result = await askGemini(message, knowledgeBase, env.GEMINI_API_KEY);

      // שמור תשובה ושלח בחזרה ב-WhatsApp
      await saveMessage(env, ticketId, 'assistant', result.answer, result.confidence);
      await sendWhatsAppMessage(env, phone, result.answer);

      // אם confidence נמוך — העבר לנציג
      if (result.confidence < 0.7) {
        await supabase(env, `tickets?id=eq.${ticketId}`, 'PATCH', { status: 'escalated' });
        console.log(`Ticket ${ticketId} escalated — confidence: ${result.confidence}`);
      } else {
        await supabase(env, `tickets?id=eq.${ticketId}`, 'PATCH', { status: 'auto_resolved' });
      }

      return new Response(JSON.stringify({ ...result, ticketId }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response('Method not allowed', { status: 405 });
  }
};
