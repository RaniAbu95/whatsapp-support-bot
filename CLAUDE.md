# WhatsApp Support Bot

## מה זה
מערכת תמיכת לקוחות: WhatsApp → Gemini → Supabase → Dashboard.

## Tech Stack
- Cloudflare Workers (Webhook + API)
- Supabase (tickets, messages, knowledge_base)
- Vertex AI gemini-2.5-flash (Structured Output)
- Next.js + Tailwind (Dashboard)

## Conventions
- Python לכל ה-Workers
- environment variables ב-.env (לא בקוד)
- כל קריאת API עטופה ב-try/except
