# WhatsApp Support Bot

## מה זה
מערכת תמיכת לקוחות end-to-end:
- לקוח שולח הודעה ← Worker מקבל ← Gemini עונה אוטומטית
- confidence < 70% ← escalation לנציג אנושי ב-Dashboard

## Tech Stack
- **Webhook:** Cloudflare Workers (webhook-worker.rani-aburaia.workers.dev)
- **AI:** Gemini 2.5 Flash (Google AI Studio API)
- **Database:** Supabase — tickets, messages, knowledge_base
- **Dashboard:** Next.js 16 + Tailwind (Vercel)

## מבנה הפרויקט
