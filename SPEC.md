# WhatsApp Support Bot — Spec

## מה המערכת עושה
לקוח שולח הודעה ב-WhatsApp → Gemini קורא Knowledge Base → עונה אוטומטית.
אם confidence < 70% → עובר לנציג אנושי ב-Dashboard.

## מודל הנתונים

```
tickets:        id, wa_phone, status (open/auto_resolved/escalated/closed), created_at
messages:       id, ticket_id, role (user/assistant/agent), content, confidence, created_at
knowledge_base: id, category, question, answer
```

## Tech Stack
- Webhook: Cloudflare Workers
- AI: Vertex AI (gemini-2.5-flash)
- DB: Supabase
- Dashboard: Next.js + Tailwind
- Deploy: Cloudflare Pages
