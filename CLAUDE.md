# WhatsApp Support Bot

## מה זה
מערכת תמיכת לקוחות: WhatsApp → Gemini → Supabase → Dashboard.

## כתובות פרודקשן
- **Dashboard (נציגים):** https://rani-support.com
- **Webhook Worker:** https://webhook-worker.rani-aburaia.workers.dev

## Tech Stack
- Cloudflare Workers (Webhook + API)
- Supabase (tickets, messages, knowledge_base)
- Vertex AI gemini-2.5-flash (Structured Output)
- Next.js + Tailwind (Dashboard)

## עלות תפעול — 100 בקשות ביום

| רכיב | חישוב | יום | חודש |
|------|-------|-----|------|
| Gemini Input | 100 בקשות × 500 טוקנים × $0.075/מיליון | $0.00375 | $0.11 |
| Gemini Output | 100 בקשות × 200 טוקנים × $0.30/מיליון | $0.006 | $0.18 |
| Cloudflare Workers | עד 100K בקשות/יום | חינם | חינם |
| Supabase | Free tier (500MB) | חינם | חינם |
| **סה"כ** | | **~$0.01** | **~$0.29** |

הנחות: Knowledge Base ~300 טוקנים, שאלת לקוח ~50 טוקנים, prompt ~150 טוקנים, תשובה ~200 טוקנים.

## Conventions
- environment variables ב-.env (לא בקוד)
- כל קריאת API עטופה ב-try/catch
