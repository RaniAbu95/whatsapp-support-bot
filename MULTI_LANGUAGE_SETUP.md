# Multi-Language Support — Setup Guide

## שינוי: תמיכה בשפות מרובות

המערכת כעת תומכת בתשובות באותה השפה בה הלקוח כתב את ההודעה.

### דוגמאות
- לקוח בעברית → תשובה בעברית
- לקוח באנגלית → תשובה באנגלית
- לקוח בערבית → תשובה בערבית
- וכו'

## What Changed (מה השתנה)

1. **Webhook Worker** (`webhook-worker/src/index.ts`)
   - הוספת `detectLanguage()` function — גילוי שפה באמצעות Gemini
   - עדכון `buildPrompt()` — נתינת הוראה ל-Gemini לענות בשפה של הלקוח
   - עדכון `askAI()` — קבלת שפה כפרמטר
   - עדכון webhook handler — גילוי שפה ושמירתה

2. **Database Schema** 
   - הוספת עמודה `language` בטבלת `messages`

3. **Dashboard** (`dashboard/`)
   - הוספת `language` field ב-`Message` type
   - הצגת אינדיקציה של השפה בדשבורד

## Database Migration

הוסף עמודה `language` לטבלת `messages` ב-Supabase:

```sql
ALTER TABLE messages 
ADD COLUMN language VARCHAR(2) DEFAULT 'he';
```

או דרך Supabase UI:
1. Go to "SQL Editor"
2. Run the command above
3. הטבלה מוכנה!

## Supported Languages

כרגע התומך בשפות:
- `he` — עברית (Hebrew)
- `en` — English
- `ar` — العربية (Arabic)
- `es` — Español (Spanish)
- `fr` — Français (French)
- `de` — Deutsch (German)
- `ru` — Русский (Russian)
- `pt` — Português (Portuguese)
- `it` — Italiano (Italian)
- `ja` — 日本語 (Japanese)

(ניתן להוסיף עוד בקלות — פשוט עדכן את `languageInstructions` בפונקציית `buildPrompt()`)

## Escalation Messages

כאשר confidence < 70%, המערכת שולחת הודעת escalation בשפה המתאימה:
- עברית: "מעביר אותך לנציג, ניצור קשר בקרוב."
- English: "Transferring you to an agent, we'll be in touch soon."

## Dashboard Feature

בדשבורד, כל הודעה של לקוח תציג את שפת ההודעה כתג סגול. זה עוזר לנציג אנושי לדעת באיזו שפה לענות.
