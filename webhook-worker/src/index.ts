export interface Env {
  GEMINI_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  VERIFY_TOKEN: string;
  WA_TOKEN: string;
  WA_PHONE_NUMBER_ID: string;
  WA_APP_SECRET: string;          // Meta App Secret — לאימות HMAC
  AI_PROVIDER?: string;           // "google_ai_studio" | "vertex_ai" (default: google_ai_studio)
  VERTEX_PROJECT_ID?: string;
  VERTEX_LOCATION?: string;
  VERTEX_SERVICE_ACCOUNT_KEY?: string;
}

async function verifyHmac(request: Request, appSecret: string): Promise<boolean> {
  const signature = request.headers.get('x-hub-signature-256');
  if (!signature) return false;

  const body = await request.text();
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const sigHex = signature.startsWith('sha256=') ? signature.slice(7) : '';
  if (!sigHex) return false;
  const sigBytes = Uint8Array.from({ length: sigHex.length / 2 }, (_, i) =>
    parseInt(sigHex.slice(i * 2, i * 2 + 2), 16)
  );

  return crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(body));
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

async function saveMessage(env: Env, ticketId: number, role: string, content: string, confidence?: number, tokensUsed?: number) {
  const costUsd = tokensUsed ? tokensUsed * 0.000000075 : undefined;
  await supabase(env, 'messages', 'POST', { ticket_id: ticketId, role, content, confidence, tokens_used: tokensUsed, cost_usd: costUsd });
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
  if (!res.ok) {
    throw new Error(`WhatsApp API failed: ${res.status} ${JSON.stringify(data)}`);
  }
}

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    answer: { type: "string" },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    sources: { type: "array", items: { type: "string" } }
  },
  required: ["answer", "confidence", "sources"]
};

function buildPrompt(message: string, knowledgeBase: string): string {
  return `אתה עוזר תמיכת לקוחות. ענה בעברית בלבד.

ספר התשובות שלך:
${knowledgeBase}

שאלת הלקוח: "${message}"

החזר JSON עם שדות:
- answer: התשובה לשאלה
- confidence: מספר בין 0 ל-1 כמה אתה בטוח בתשובה
- sources: רשימת מקורות מספר התשובות ששימשו

אם השאלה לא קיימת בספר התשובות — תן confidence נמוך מ-0.7`;
}

async function askGoogleAIStudio(prompt: string, apiKey: string): Promise<{answer: string, confidence: number, sources: string[], tokensUsed: number}> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA
        }
      })
    }
  );
  const data = await res.json() as any;
  const tokensUsed = data.usageMetadata?.totalTokenCount ?? 0;
  return { ...JSON.parse(data.candidates[0].content.parts[0].text), tokensUsed };
}

async function askVertexAI(prompt: string, env: Env): Promise<{answer: string, confidence: number, sources: string[]}> {
  if (!env.VERTEX_SERVICE_ACCOUNT_KEY) throw new Error('VERTEX_SERVICE_ACCOUNT_KEY is not set');
  if (!env.VERTEX_PROJECT_ID) throw new Error('VERTEX_PROJECT_ID is not set');

  const location = env.VERTEX_LOCATION || 'us-central1';
  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${env.VERTEX_PROJECT_ID}/locations/${location}/publishers/google/models/gemini-2.5-flash:generateContent`;

  const serviceAccount = JSON.parse(env.VERTEX_SERVICE_ACCOUNT_KEY);
  const token = await getVertexToken(serviceAccount);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA
      }
    })
  });
  const data = await res.json() as any;
  return JSON.parse(data.candidates[0].content.parts[0].text);
}

let vertexTokenCache: { token: string; expiresAt: number } | null = null;

async function getVertexToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (vertexTokenCache && vertexTokenCache.expiresAt > now + 60) {
    return vertexTokenCache.token;
  }
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  }));

  const signingInput = `${header}.${payload}`;
  const pemKey = serviceAccount.private_key;
  const pemBody = pemKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, '');
  const keyBytes = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));

  const privateKey = await crypto.subtle.importKey(
    'pkcs8', keyBytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5', privateKey,
    new TextEncoder().encode(signingInput)
  );

  const jwt = `${signingInput}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  const tokenData = await tokenRes.json() as any;
  vertexTokenCache = { token: tokenData.access_token, expiresAt: now + 3600 };
  return tokenData.access_token;
}

async function askAI(message: string, knowledgeBase: string, env: Env): Promise<{answer: string, confidence: number, sources: string[], tokensUsed: number}> {
  const prompt = buildPrompt(message, knowledgeBase);
  const provider = env.AI_PROVIDER || 'google_ai_studio';

  if (provider === 'vertex_ai') {
    const result = await askVertexAI(prompt, env);
    return { ...result, tokensUsed: 0 };
  }
  return askGoogleAIStudio(prompt, env.GEMINI_API_KEY);
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
      const valid = await verifyHmac(request.clone(), env.WA_APP_SECRET);
      if (!valid) return new Response('Unauthorized', { status: 401 });

      const body = await request.json() as any;
      const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body;
      const phone = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from || 'test-user';
      if (!message) return new Response('OK', { status: 200 });

      // שמור כרטיס + הודעת לקוח
      const ticketId = await getOrCreateTicket(env, phone);
      await saveMessage(env, ticketId, 'user', message);

      // שאל את Gemini
      const knowledgeBase = await getKnowledgeBase(env);
      const result = await askAI(message, knowledgeBase, env);

      // שמור תשובה ושלח בחזרה ב-WhatsApp
      await saveMessage(env, ticketId, 'assistant', result.answer, result.confidence, result.tokensUsed);

      if (result.confidence < 0.7) {
        await sendWhatsAppMessage(env, phone, 'מעביר אותך לנציג, ניצור קשר בקרוב.');
        await supabase(env, `tickets?id=eq.${ticketId}`, 'PATCH', { status: 'escalated' });
        console.log(`Ticket ${ticketId} escalated — confidence: ${result.confidence}`);
      } else {
        await sendWhatsAppMessage(env, phone, result.answer);
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
