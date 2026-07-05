import Link from 'next/link'
import { getMonthlyReport } from '@/app/actions'

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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none mb-4 inline-block"
          aria-label="חזור לרשימה"
        >
          ←
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">דוח חודשי</h1>
        <p className="text-gray-500 mt-2">{report?.month}</p>
      </div>

      {!report ? (
        <div className="text-center py-12 text-gray-400">אין נתונים לתקופה זו</div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <Card label="בקשות כולל" value={report.totalMessages} icon="📨" />
            <Card label="קיבלו תשובה" value={report.respondedMessages} icon="💬" />
            <Card label="נפתרו אוטומטית" value={report.autoResolved} icon="✅" />
            <Card label="Escalated" value={report.escalated} icon="🔄" />
            <Card label="ללא תשובה" value={report.unanswered} icon="❓" />
          </div>

          {/* Confidence Score */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-semibold text-gray-900">ממוצע Confidence</h3>
                <p className="text-sm text-gray-500">כמה בטוח הבוט בתשובותיו</p>
              </div>
            </div>
            <div className="text-4xl font-bold text-blue-600">{report.avgConfidence}%</div>
          </div>

          {/* Languages Distribution */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🌍</span> התפלגות שפות
            </h3>
            <div className="space-y-3">
              {Object.entries(report.languages).map(([lang, count]) => (
                <div key={lang} className="flex items-center justify-between">
                  <span className="text-gray-600">{LANGUAGE_NAMES[lang] || lang}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${(count / report.totalMessages) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-400 text-center pt-4 border-t">
            עדכון אחרון: {new Date(report.timestamp).toLocaleString('he-IL')}
          </div>
        </div>
      )}
    </div>
  )
}

function Card({ label, value, icon }: { label: string; value: any; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
