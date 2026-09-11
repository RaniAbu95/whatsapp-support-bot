import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm relative">
        <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-30 blur-xl" />
        <div className="relative glass-panel rounded-[1.75rem] p-8 shadow-2xl shadow-indigo-950/10">
          <div className="text-center mb-7">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30 ring-4 ring-white/50">
              🔐
            </div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-l from-indigo-700 via-purple-700 to-pink-600 bg-clip-text text-transparent">
              כניסת נציגים
            </h1>
            <p className="text-sm text-gray-500 mt-1.5">הזן סיסמה כדי לגשת לדשבורד</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50/80 border border-red-100 p-3 text-sm text-red-700 text-center">
              סיסמה שגויה, נסה שוב
            </div>
          )}

          <form action={login} className="space-y-3">
            <input
              type="password"
              name="password"
              required
              autoFocus
              placeholder="סיסמה"
              className="w-full rounded-xl border border-gray-200 bg-white/90 px-4 py-2.5 text-sm transition-shadow focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-l from-indigo-600 via-purple-600 to-pink-500 text-white py-2.5 text-sm font-semibold hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-purple-600/25"
            >
              התחבר
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
