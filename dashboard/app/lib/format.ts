// השרת (Vercel) רץ ב-UTC, לכן כל תאריך מוצג מפורמט במפורש לפי שעון ישראל
const TZ = 'Asia/Jerusalem'

const dayKeyFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
const timeFormat = new Intl.DateTimeFormat('he-IL', { timeZone: TZ, hour: '2-digit', minute: '2-digit' })
const weekdayFormat = new Intl.DateTimeFormat('he-IL', { timeZone: TZ, weekday: 'long' })
const longDateFormat = new Intl.DateTimeFormat('he-IL', { timeZone: TZ, day: 'numeric', month: 'long', year: 'numeric' })
const shortDateFormat = new Intl.DateTimeFormat('he-IL', { timeZone: TZ, day: '2-digit', month: '2-digit', year: '2-digit' })

// מפתח יום (YYYY-MM-DD) בשעון ישראל — לקיבוץ הודעות ופניות לפי יום
export function dayKey(date: string | Date) {
  return dayKeyFormat.format(new Date(date))
}

function daysAgo(date: string | Date) {
  const toUtc = (key: string) => Date.parse(`${key}T00:00:00Z`)
  return Math.round((toUtc(dayKey(new Date())) - toUtc(dayKey(date))) / 86_400_000)
}

export function formatTime(date: string | Date) {
  return timeFormat.format(new Date(date))
}

// כותרת מפריד יום: "היום", "אתמול", שם היום בשבוע האחרון, אחרת תאריך מלא
export function formatDayLabel(date: string | Date) {
  const n = daysAgo(date)
  if (n === 0) return 'היום'
  if (n === 1) return 'אתמול'
  if (n > 1 && n < 7) return weekdayFormat.format(new Date(date))
  return longDateFormat.format(new Date(date))
}

// זמן קצר לרשימת השיחות, כמו בוואטסאפ
export function formatListTime(date: string | Date) {
  const n = daysAgo(date)
  if (n === 0) return formatTime(date)
  if (n === 1) return 'אתמול'
  if (n > 1 && n < 7) return weekdayFormat.format(new Date(date))
  return shortDateFormat.format(new Date(date))
}

// 972524847811 → 052-484-7811
export function formatPhone(phone: string) {
  if (/^972\d{9}$/.test(phone)) {
    return `0${phone.slice(3, 5)}-${phone.slice(5, 8)}-${phone.slice(8)}`
  }
  return `+${phone}`
}
