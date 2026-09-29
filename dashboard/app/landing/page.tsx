import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Rani Support — תמיכת לקוחות חכמה ב-WhatsApp',
  description: 'בוט AI שעונה ללקוחות שלך ב-WhatsApp מתוך מאגר הידע שלך, ומעביר לנציג אנושי כשצריך.',
}

const FEATURES = [
  {
    icon: '⚡',
    title: 'מענה מיידי 24/7',
    text: 'הלקוח שואל ב-WhatsApp ומקבל תשובה תוך שניות — גם בלילה, גם בסופ"ש.',
  },
  {
    icon: '📚',
    title: 'עונה מתוך מאגר הידע שלך',
    text: 'הבוט מבוסס על Knowledge Base שאתה מגדיר, כך שהתשובות מדויקות ותואמות את העסק.',
  },
  {
    icon: '🧑‍💼',
    title: 'העברה חכמה לנציג',
    text: 'כשהבוט לא בטוח בתשובה (ביטחון מתחת ל-70%) — הפנייה עוברת אוטומטית לנציג אנושי.',
  },
  {
    icon: '🌍',
    title: 'מדבר בשפת הלקוח',
    text: 'זיהוי שפה אוטומטי — עברית, ערבית, אנגלית ועוד. כל לקוח מקבל תשובה בשפה שלו.',
  },
  {
    icon: '💬',
    title: 'דשבורד לנציגים',
    text: 'כל השיחות במקום אחד, בתצוגת צ\'אט מוכרת. הנציג עונה ישירות ללקוח מהדשבורד.',
  },
  {
    icon: '📊',
    title: 'דוחות ותובנות',
    text: 'כמה פניות נפתרו אוטומטית, כמה הועברו לנציג, ומה הלקוחות שואלים הכי הרבה.',
  },
]

const STEPS = [
  { n: '1', title: 'הלקוח שולח הודעה', text: 'ישירות למספר ה-WhatsApp של העסק.' },
  { n: '2', title: 'ה-AI מחפש תשובה', text: 'Gemini סורק את מאגר הידע ומחשב רמת ביטחון.' },
  { n: '3', title: 'תשובה או נציג', text: 'ביטחון גבוה — תשובה אוטומטית. נמוך — הפנייה עוברת לנציג.' },
]

const STATS = [
  { value: '< 5 שניות', label: 'זמן מענה ממוצע' },
  { value: '24/7', label: 'זמינות' },
  { value: '~$0.30', label: 'עלות חודשית ל-100 פניות ביום' },
]

const gradientText =
  'bg-gradient-to-l from-indigo-700 via-purple-700 to-pink-600 bg-clip-text text-transparent'
const gradientButton =
  'rounded-xl bg-gradient-to-l from-indigo-600 via-purple-600 to-pink-500 text-white font-semibold hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-purple-600/25'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-lg shadow-lg shadow-purple-500/30">
            💬
          </div>
          <span className="font-extrabold text-lg text-gray-900">Rani Support</span>
        </div>
        <Link
          href="/login"
          className="text-sm font-semibold text-indigo-700 hover:text-indigo-900 transition-colors"
        >
          כניסת נציגים ←
        </Link>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 pt-10 pb-20 grid gap-12 md:grid-cols-2 items-center">
          <div>
            <span className="inline-block mb-4 rounded-full glass-panel px-3.5 py-1 text-xs font-semibold text-purple-700 shadow-sm">
              ✨ מבוסס Gemini AI
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
              תמיכת לקוחות ב-WhatsApp
              <br />
              <span className={gradientText}>שעונה לבד.</span>
            </h1>
            <p className="mt-5 text-lg text-gray-600 leading-relaxed max-w-lg">
              בוט AI שעונה ללקוחות שלך מתוך מאגר הידע של העסק, בשפה שלהם, תוך שניות —
              ומעביר לנציג אנושי רק כשבאמת צריך.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#how" className={`${gradientButton} px-6 py-3 text-sm`}>
                איך זה עובד
              </a>
              <Link
                href="/login"
                className="rounded-xl glass-panel px-6 py-3 text-sm font-semibold text-gray-800 hover:bg-white transition-colors shadow-sm"
              >
                לדשבורד הנציגים
              </Link>
            </div>
          </div>

          {/* Chat mockup */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-30 blur-xl" />
            <div className="relative glass-panel rounded-[1.75rem] shadow-2xl shadow-indigo-950/10 overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/60 bg-white/50">
                <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                  AI
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">שירות לקוחות</p>
                  <p className="text-xs text-emerald-600">מחובר</p>
                </div>
              </div>
              <div className="chat-wallpaper p-5 space-y-3 text-sm">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-white px-4 py-2.5 shadow-sm text-gray-800">
                  היי, מה שעות הפעילות שלכם?
                </div>
                <div className="max-w-[80%] mr-auto rounded-2xl rounded-tl-sm bg-emerald-100 px-4 py-2.5 shadow-sm text-gray-800">
                  היי! אנחנו פתוחים א׳–ה׳ 9:00–18:00 וביום ו׳ עד 13:00 😊
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-white px-4 py-2.5 shadow-sm text-gray-800">
                  Do you ship abroad?
                </div>
                <div className="max-w-[80%] mr-auto rounded-2xl rounded-tl-sm bg-emerald-100 px-4 py-2.5 shadow-sm text-gray-800">
                  Yes! We ship worldwide. Delivery takes 7–14 business days.
                </div>
                <div className="flex justify-center pt-1">
                  <span className="rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-medium">
                    שאלה מורכבת? מועבר לנציג 🧑‍💼
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-4xl mx-auto px-4 pb-20">
          <div className="glass-panel rounded-3xl shadow-xl shadow-indigo-950/5 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-white/70">
            {STATS.map((s) => (
              <div key={s.label} className="p-6 text-center">
                <p className={`text-3xl font-extrabold ${gradientText}`}>{s.value}</p>
                <p className="mt-1 text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-4 pb-24">
          <h2 className="text-3xl font-extrabold text-center text-gray-900">
            כל מה שצריך <span className={gradientText}>לתמיכה חכמה</span>
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="glass-panel rounded-2xl p-6 shadow-lg shadow-indigo-950/5 hover:-translate-y-1 transition-transform"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-pink-100 flex items-center justify-center text-2xl">
                  {f.icon}
                </div>
                <h3 className="mt-4 font-bold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="max-w-5xl mx-auto px-4 pb-24 scroll-mt-8">
          <h2 className="text-3xl font-extrabold text-center text-gray-900">איך זה עובד</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="glass-panel rounded-2xl p-6 shadow-lg shadow-indigo-950/5 text-center">
                <div
                  className={`w-12 h-12 mx-auto rounded-full ${gradientButton} flex items-center justify-center text-lg`}
                >
                  {s.n}
                </div>
                <h3 className="mt-4 font-bold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 pb-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-indigo-600 via-purple-600 to-pink-500 p-10 text-center text-white shadow-2xl shadow-purple-600/30">
            <h2 className="text-3xl font-extrabold">מוכן לתת ללקוחות מענה מיידי?</h2>
            <p className="mt-3 text-white/85">דבר איתנו ונחבר את הבוט למספר ה-WhatsApp של העסק שלך.</p>
            <a
              href="mailto:raniaburaia@tovtech.org"
              className="mt-7 inline-block rounded-xl bg-white px-7 py-3 text-sm font-bold text-purple-700 hover:bg-white/90 transition-colors shadow-lg"
            >
              צור קשר
            </a>
          </div>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-8 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500 border-t border-white/60">
        <p>© {new Date().getFullYear()} Rani Support</p>
        <Link href="/privacy" className="hover:text-gray-800 transition-colors">
          מדיניות פרטיות
        </Link>
      </footer>
    </div>
  )
}
