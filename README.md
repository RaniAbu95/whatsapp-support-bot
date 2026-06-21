# WhatsApp Support Bot

מערכת תמיכת לקוחות אוטומטית: WhatsApp → Gemini → Supabase → Dashboard.

## ארכיטקטורה

```
לקוח (WhatsApp) → Meta API → Cloudflare Worker → Gemini AI → Supabase
                                                              ↓
                                                         Next.js Dashboard
```

- confidence ≥ 70% → תשובה אוטומטית
- confidence < 70% → escalation לנציג אנושי ב-Dashboard

## Tech Stack

| רכיב | טכנולוגיה |
|------|-----------|
| Webhook | Cloudflare Workers (TypeScript) |
| AI | Google Gemini 2.5 Flash |
| Database | Supabase (PostgreSQL) |
| Dashboard | Next.js + Tailwind CSS |
| Deploy | Cloudflare Workers + Vercel |

---

## הרצה מקומית

### דרישות
- Node.js 18+
- Wrangler CLI (`npm install -g wrangler`)

### Webhook Worker

```bash
cd webhook-worker
npm install
```

צור קובץ `.dev.vars`:
```
GEMINI_API_KEY=...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=...
VERIFY_TOKEN=my-secret-verify-token
WA_TOKEN=...
WA_PHONE_NUMBER_ID=...
```

הרץ:
```bash
wrangler dev
```

Worker יעלה על `http://localhost:8787`.

### Dashboard

```bash
cd dashboard
npm install
```

צור קובץ `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

הרץ:
```bash
npm run dev
```

Dashboard יעלה על `http://localhost:3000`.

---

## Deploy

### Worker
```bash
cd webhook-worker
wrangler deploy
```

הגדר secrets ב-Cloudflare:
```bash
wrangler secret put GEMINI_API_KEY
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_KEY
wrangler secret put VERIFY_TOKEN
wrangler secret put WA_TOKEN
wrangler secret put WA_PHONE_NUMBER_ID
```

### Dashboard
מחובר ל-Vercel — כל push ל-`main` מפרסם אוטומטית.

---

## בדיקת Webhook

```bash
# אימות
curl "https://webhook-worker.rani-aburaia.workers.dev?hub.mode=subscribe&hub.verify_token=my-secret-verify-token&hub.challenge=test123"

# סימולציית הודעה
curl -X POST https://webhook-worker.rani-aburaia.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "messages": [{
            "from": "972501234567",
            "text": { "body": "מה שעות הפתיחה?" }
          }]
        }
      }]
    }]
  }'
```

---

## מבנה הנתונים

```sql
tickets:        id, wa_phone, status (open/auto_resolved/escalated/closed), created_at
messages:       id, ticket_id, role (user/assistant/agent), content, confidence, created_at
knowledge_base: id, category, question, answer
```
