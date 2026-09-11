import Link from 'next/link'
import { getMonthlyReport } from '@/app/actions'

// הדוח חייב להיות מחושב בכל בקשה — לא בזמן build
export const dynamic = 'force-dynamic'

const LANGUAGE_NAMES: Record<string, string> = {
  'he': '🇮🇱 עברית',
  'en': '🇺🇸 English',
  'ar': '🇸🇦 العربية',
  'es': '🇪🇸 Español',
  'fr': '🇫🇷 Français',
  'de': '🇩🇪 Deutsch',
  'ru': '🇷🇺 Русский',
  'pt': '🇵🇹 Português',
  'it': '🇮🇹 Italiano',
  'ja': '🇯🇵 日本語',
}

export default async function ReportsPage() {
  const report = await getMonthlyReport()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="w-9 h-9 flex items-center justify-center rounded-xl glass-panel text-gray-400 hover:text-indigo-600 hover:shadow-md transition-all mb-4"
          aria-label="חזור לרשימה"
        >
          ←
        </Link>
        <h1 className="text-3xl font-extrabold bg-gradient-to-l from-indigo-700 via-purple-700 to-pink-600 bg-clip-text text-transparent">
          דוח חודשי
        </h1>
        <p className="text-gray-500 mt-2">{report?.month}</p>
      </div>

      {!report ? (
        <div className="text-center py-16 text-gray-400 glass-panel rounded-2xl border-dashed">
          אין נתונים לתקופה זו
        </div>
      ) : (
        <div className="space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <Card label="בקשות כולל" value={report.totalMessages} icon="📨" color="from-indigo-500 to-purple-500" />
            <Card label="קיבלו תשובה" value={report.respondedMessages} icon="💬" color="from-blue-500 to-indigo-500" />
            <Card label="נפתרו אוטומטית" value={report.autoResolved} icon="✅" color="from-green-500 to-emerald-500" />
            <Card label="Escalated" value={report.escalated} icon="🔄" color="from-orange-500 to-pink-500" />
            <Card label="ללא תשובה" value={report.unanswered} icon="❓" color="from-gray-400 to-gray-500" />
          </div>

          {/* Confidence Score */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl shrink-0 shadow-sm shadow-indigo-500/25">
                🎯
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">ממוצע Confidence</h3>
                <p className="text-sm text-gray-500">כמה בטוח הבוט בתשובותיו</p>
              </div>
            </div>
            <div className="text-4xl font-bold bg-gradient-to-l from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              {report.avgConfidence}%
            </div>
          </div>

          {/* Languages Distribution */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-base shadow-sm shadow-purple-500/25">
                🌍
              </span>
              התפלגות שפות
            </h3>
            <div className="space-y-3.5">
              {Object.entries(report.languages).map(([lang, count]) => (
                <div key={lang} className="flex items-center justify-between gap-4">
                  <span className="text-gray-600 text-sm shrink-0">{LANGUAGE_NAMES[lang] || lang}</span>
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <div className="w-full max-w-32 h-2 bg-white/70 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-l from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${(count / report.totalMessages) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-400 text-center pt-4 border-t border-gray-100/60">
            עדכון אחרון: {new Date(report.timestamp).toLocaleString('he-IL')}
          </div>
        </div>
      )}
    </div>
  )
}

function Card({ label, value, icon, color }: { label: string; value: any; icon: string; color: string }) {
  return (
    <div className="glass-panel rounded-2xl p-4">
      <div
        className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-base mb-3 shadow-sm`}
      >
        {icon}
      </div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
